// braddunlap-info-email: Cloudflare Email Worker for every address @braddunlap.info.
// 1. Forwards the email, untouched, to braddunlap@protomota.com (which lands in protomota@gmail.com).
// 2. Logs it in HubSpot as a business inquiry (Inquiry site: braddunlap.info) through
//    protomota.com/api/inbound-lead, signed with the INBOUND_LEAD_SECRET worker secret.
// Automated mail (bounces, newsletters, no-reply senders) is forwarded but not logged.
import PostalMime from 'postal-mime';

const FORWARD_TO = 'braddunlap@protomota.com';
const ENDPOINT = 'https://protomota.com/api/inbound-lead';
const AUTOMATED_FROM = /^(mailer-daemon|postmaster|no-?reply|do-?not-?reply|notifications?|bounces?)[@+.-]/i;

function isAutomated(headers, fromAddress) {
  const auto = (headers.get('auto-submitted') || 'no').toLowerCase();
  const precedence = (headers.get('precedence') || '').toLowerCase();
  return auto !== 'no'
    || ['bulk', 'list', 'junk'].includes(precedence)
    || headers.has('list-unsubscribe')
    || headers.has('list-id')
    || AUTOMATED_FROM.test(fromAddress || '');
}

export default {
  async email(message, env) {
    // Delivery comes first; nothing below can stop the forward.
    await message.forward(FORWARD_TO);

    try {
      const raw = await new Response(message.raw).arrayBuffer();
      const mail = await PostalMime.parse(raw);
      const fromAddress = (mail.replyTo?.[0]?.address || mail.from?.address || message.from || '').trim();
      if (isAutomated(message.headers, fromAddress)) {
        console.log('skipped automated mail from', fromAddress);
        return;
      }
      const text = (mail.text || (mail.html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ') || '').trim();
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { Authorization: `Bearer ${env.INBOUND_LEAD_SECRET}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site: 'braddunlap.info',
          source: `Email to ${message.to}`,
          name: mail.replyTo?.[0]?.name || mail.from?.name || '',
          email: fromAddress,
          subject: mail.subject || '(no subject)',
          message: text.slice(0, 10000),
        }),
      });
      console.log('inbound-lead', res.status, (await res.text()).slice(0, 200));
    } catch (error) {
      console.error('HubSpot logging failed:', error?.message || error);
    }
  },
};
