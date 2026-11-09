"use client";

import { useRef, useState } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

// The same contact form as protomota.com (components/redesign/ContactForm.js in
// protomota/protomota-com). It posts to app/api/contact/route.ts, which emails
// Brad and sends the visitor a thank-you through Resend.
//
// Cloudflare Turnstile switches on by itself once NEXT_PUBLIC_TURNSTILE_SITE_KEY
// (here) and TURNSTILE_SECRET_KEY (the API route) are set in Vercel. Until then
// the form sends without a check.

type Form = { name: string; email: string; message: string };
const EMPTY: Form = { name: "", email: "", message: "" };

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function clean(value: string | undefined) {
  return (value ?? "").trim().replace(/(?:\\r|\\n)+$/g, "").trim();
}

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17L17 7M8 7h9v9" />
    </svg>
  );
}

export default function ContactForm() {
  const [form, setForm] = useState<Form>(EMPTY);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const siteKey = clean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  const update = (key: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const resetTurnstile = () => {
    turnstileRef.current?.reset();
    setToken(null);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (siteKey && !token) {
      setStatus("error");
      setError("Give the verification a second to finish, then try again.");
      turnstileRef.current?.execute?.();
      return;
    }
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: "More information",
          message: form.message.trim(),
          turnstileToken: token,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Something went wrong. Please try again.");
      setStatus("sent");
      // GA4 recommended event for a lead; mark it as a key event in GA to count conversions.
      window.gtag?.("event", "generate_lead", { form: "contact" });
      setForm(EMPTY);
      resetTurnstile();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      resetTurnstile();
    }
  };

  if (status === "sent") {
    return (
      <div className="cform cform-sent" role="status">
        <span className="cform-sent-mark" aria-hidden="true">✓</span>
        <h3>Message received.</h3>
        <p>Thanks for writing. I&apos;ll get back to you by email.</p>
        <button type="button" className="btn btn-secondary" onClick={() => setStatus("idle")}>
          Send another
        </button>
      </div>
    );
  }

  return (
    <form className="cform" onSubmit={onSubmit}>
      <div className="cform-row">
        <label className="cform-field">
          <span>Name</span>
          <input type="text" name="name" autoComplete="name" required value={form.name} onChange={update("name")} />
        </label>
        <label className="cform-field">
          <span>Email</span>
          <input type="email" name="email" autoComplete="email" required value={form.email} onChange={update("email")} />
        </label>
      </div>
      <label className="cform-field">
        <span>What would you like to know?</span>
        <textarea name="message" rows={5} required value={form.message} onChange={update("message")} />
      </label>
      {siteKey && (
        <div className="cform-turnstile">
          <Turnstile
            ref={turnstileRef}
            siteKey={siteKey}
            options={{ theme: "dark", size: "flexible" }}
            onSuccess={setToken}
            onError={() => setToken(null)}
            onExpire={() => setToken(null)}
          />
        </div>
      )}
      <div className="cform-foot">
        <button type="submit" className="btn btn-primary btn-lg" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : <>Send message <Arrow /></>}
        </button>
        {status === "error" && <p className="cform-error" role="alert">{error}</p>}
      </div>
    </form>
  );
}
