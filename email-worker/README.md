# braddunlap-info-email

Cloudflare Email Worker behind the braddunlap.info catch-all Email Routing rule.
Forwards every email to braddunlap@protomota.com and logs real (non-automated) ones in
HubSpot as braddunlap.info inquiries via protomota.com/api/inbound-lead.

Deploy (needs wrangler login on the Cloudflare account):

    cd email-worker && npm install && npx wrangler deploy
    npx wrangler secret put INBOUND_LEAD_SECRET   # same value as Vercel INBOUND_LEAD_SECRET on protomota-com and braddunlap-info

Then in Cloudflare > Email Routing > braddunlap.info > Routing rules, the catch-all action is
"Send to a Worker: braddunlap-info-email". Not deployed by Vercel (outside the Next.js app).
