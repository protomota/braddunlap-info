import { NextResponse } from "next/server";

// Same flow as protomota.com's pages/api/contact.js: an alert to Brad (reply-to
// the visitor), then a thank-you to the visitor, both through Resend from the
// verified protomota.com domain. Cloudflare Turnstile is checked only once
// TURNSTILE_SECRET_KEY is set in Vercel.

export const runtime = "nodejs";

function clean(value: string | undefined) {
  return (value ?? "").trim().replace(/(?:\\r|\\n)+$/g, "").trim();
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

async function verifyTurnstile(token: string, secret: string, ip: string | null) {
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = await res.json();
    if (!data.success) console.warn("Turnstile verification failed", data["error-codes"] || []);
    return data.success === true;
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return false;
  }
}

async function sendEmail(apiKey: string, email: Record<string, unknown>) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(email),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

type Fields = { name: string; email: string; subject: string; message: string };

// Branded email template for the alert to Brad (copied from protomota.com)
function notificationEmail({ name, email, subject, message }: Fields) {
  const h = { name: escapeHtml(name), email: escapeHtml(email), subject: escapeHtml(subject), message: escapeHtml(message) };
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <img src="https://protomota.com/logo.png?v=20261015" alt="Protomota Lab" width="60" style="display: block;">
              <h1 style="color: #ff8c29; font-size: 24px; margin: 15px 0 5px 0; font-weight: 700;">New Contact Form Submission</h1>
              <p style="color: #888; font-size: 14px; margin: 0;">braddunlap.info</p>
            </td>
          </tr>

          <!-- Main Content Card -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(145deg, rgba(18, 18, 26, 0.95), rgba(25, 25, 35, 0.9)); border-radius: 16px; border: 1px solid rgba(255, 140, 41, 0.2);">
                <!-- Orange accent line -->
                <tr>
                  <td style="height: 3px; background: linear-gradient(90deg, #ff8c29, #ffab5c, #ff8c29); border-radius: 16px 16px 0 0;"></td>
                </tr>

                <tr>
                  <td style="padding: 30px;">
                    <!-- From Section -->
                    <table width="100%" style="margin-bottom: 25px;">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <span style="color: #ff8c29; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">From</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="background: rgba(255, 255, 255, 0.03); padding: 15px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);">
                          <p style="color: #f5f5f5; font-size: 16px; margin: 0 0 5px 0; font-weight: 600;">${h.name}</p>
                          <p style="color: #00d4ff; font-size: 14px; margin: 0;">
                            <a href="mailto:${h.email}" style="color: #00d4ff; text-decoration: none;">${h.email}</a>
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Subject Section -->
                    <table width="100%" style="margin-bottom: 25px;">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <span style="color: #ff8c29; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Subject</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="background: rgba(255, 255, 255, 0.03); padding: 15px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);">
                          <p style="color: #f5f5f5; font-size: 16px; margin: 0;">${h.subject}</p>
                        </td>
                      </tr>
                    </table>

                    <!-- Message Section -->
                    <table width="100%">
                      <tr>
                        <td style="padding-bottom: 8px;">
                          <span style="color: #ff8c29; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">Message</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="background: rgba(255, 255, 255, 0.03); padding: 20px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);">
                          <p style="color: #d4d4d4; font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${h.message}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Reply Button -->
          <tr>
            <td align="center" style="padding: 30px 0;">
              <a href="mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(`Re: ${h.subject}`)}" style="display: inline-block; background: linear-gradient(135deg, #ff8c29 0%, #ffab5c 100%); color: #000; padding: 14px 32px; border-radius: 50px; font-weight: 600; font-size: 14px; text-decoration: none; box-shadow: 0 4px 15px rgba(255, 140, 41, 0.3);">Reply to ${h.name}</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="color: #666; font-size: 12px; margin: 0;">This message was sent from the contact form on braddunlap.info</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Thank-you email to the visitor (copied from protomota.com)
function autoResponseEmail({ name, subject }: Fields) {
  const h = { name: escapeHtml(name), subject: escapeHtml(subject) };
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0f; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <img src="https://protomota.com/logo.png?v=20261015" alt="Protomota Lab" width="80" style="display: block;">
            </td>
          </tr>

          <!-- Main Content Card -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(145deg, rgba(18, 18, 26, 0.95), rgba(25, 25, 35, 0.9)); border-radius: 16px; border: 1px solid rgba(255, 140, 41, 0.2);">
                <!-- Orange accent line -->
                <tr>
                  <td style="height: 3px; background: linear-gradient(90deg, #ff8c29, #ffab5c, #ff8c29); border-radius: 16px 16px 0 0;"></td>
                </tr>

                <tr>
                  <td style="padding: 40px 30px;">
                    <h1 style="color: #f5f5f5; font-size: 24px; margin: 0 0 20px 0; font-weight: 700;">Thanks for reaching out, ${h.name}! 👋</h1>

                    <p style="color: #d4d4d4; font-size: 16px; line-height: 1.7; margin: 0 0 20px 0;">
                      Thanks for reaching out about <strong style="color: #ff8c29;">"${h.subject}"</strong>. Expect a response as soon as possible.
                    </p>

                    <p style="color: #d4d4d4; font-size: 16px; line-height: 1.7; margin: 0 0 30px 0;">
                      In the meantime, feel free to check out the latest projects and blog posts:
                    </p>

                    <!-- CTA Buttons -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center" style="padding-bottom: 15px;">
                          <a href="https://protomota.com/#apps" style="display: inline-block; background: linear-gradient(135deg, #ff8c29 0%, #ffab5c 100%); color: #000; padding: 14px 32px; border-radius: 50px; font-weight: 600; font-size: 14px; text-decoration: none; box-shadow: 0 4px 15px rgba(255, 140, 41, 0.3);">View Projects</a>
                        </td>
                      </tr>
                      <tr>
                        <td align="center">
                          <a href="https://newsletter.protomota.com" style="display: inline-block; background: rgba(255, 255, 255, 0.05); color: #f5f5f5; padding: 14px 32px; border-radius: 50px; font-weight: 600; font-size: 14px; text-decoration: none; border: 1px solid rgba(255, 255, 255, 0.1);">Read the Blog</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Social Links -->
          <tr>
            <td align="center" style="padding: 30px 0;">
              <p style="color: #888; font-size: 14px; margin: 0 0 15px 0;">Connect with me:</p>
              <a href="https://x.com/protomotalab" style="color: #00d4ff; font-size: 14px; text-decoration: none; margin: 0 8px;">X / Twitter</a>
              <span style="color: #444;">•</span>
              <a href="https://instagram.com/protomota" style="color: #00d4ff; font-size: 14px; text-decoration: none; margin: 0 8px;">Instagram</a>
              <span style="color: #444;">•</span>
              <a href="https://tiktok.com/@protomota" style="color: #00d4ff; font-size: 14px; text-decoration: none; margin: 0 8px;">TikTok</a>
              <span style="color: #444;">•</span>
              <a href="https://youtube.com/@protomota" style="color: #00d4ff; font-size: 14px; text-decoration: none; margin: 0 8px;">YouTube</a>
              <span style="color: #444;">•</span>
              <a href="https://reddit.com/u/protomota" style="color: #00d4ff; font-size: 14px; text-decoration: none; margin: 0 8px;">Reddit</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.05);">
              <p style="color: #666; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Protomota Lab. Building the future, one project at a time.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const fields: Fields = {
    name: str(body.name, 200),
    email: str(body.email, 320),
    subject: str(body.subject, 200),
    message: str(body.message, 10000),
  };

  const turnstileSecret = clean(process.env.TURNSTILE_SECRET_KEY);
  if (turnstileSecret) {
    const token = str(body.turnstileToken, 4096);
    if (!token) return NextResponse.json({ message: "Please complete the verification" }, { status: 400 });
    const ip = req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    if (!(await verifyTurnstile(token, turnstileSecret, ip))) {
      return NextResponse.json({ message: "Verification failed. Please try again." }, { status: 400 });
    }
  }

  if (!fields.name || !fields.email || !fields.subject || !fields.message) {
    return NextResponse.json({ message: "Name, email, subject, and message are required" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    return NextResponse.json({ message: "Invalid email address" }, { status: 400 });
  }

  const apiKey = clean(process.env.RESEND_API_KEY);
  if (!apiKey) {
    console.error("RESEND_API_KEY is not set");
    return NextResponse.json({ message: "Error sending email. Please try again." }, { status: 500 });
  }

  try {
    await sendEmail(apiKey, {
      from: clean(process.env.CONTACT_FROM_EMAIL) || "Protomota Contact <contact@protomota.com>",
      to: clean(process.env.CONTACT_TO_EMAIL) || "brad@protomota.com",
      subject: `Contact Form (braddunlap.info): ${fields.subject}`,
      html: notificationEmail(fields),
      reply_to: fields.email,
    });
    await sendEmail(apiKey, {
      from: clean(process.env.CONTACT_REPLY_FROM_EMAIL) || "Brad at Protomota <brad@protomota.com>",
      to: fields.email,
      subject: `Thanks for reaching out! Re: ${fields.subject}`,
      html: autoResponseEmail(fields),
    });
    return NextResponse.json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ message: "Error sending email. Please try again." }, { status: 500 });
  }
}
