# Development notes

- Next.js App Router with strict TypeScript. Run `npm ci` and `npm run build` to verify changes.
- Local development uses `npm run dev -- -p 3004`.
- Shared content lives in `lib/content.ts`. The page, JSON-LD, and `/llms.txt` use it.
- Keep the PDF, Word, and Markdown résumés consistent. Do not add a phone number to any format or embedded artwork.
- Preserve CSS scroll-driven reveals: content must remain visible without JavaScript.
- Preserve reduced-motion behavior and the static fallback in the decorative Three.js timeline.
- Newsletter RSS is fetched server-side; failures return an empty list.
- Contact-form secrets belong in environment variables. `.env.example` documents the configuration.
- The form is enabled at build time when `RESEND_API_KEY` is present. Configure both Turnstile keys together.
- Do not add private infrastructure details, local account configuration, credentials, or personal contact details to source files.
- The code license does not cover personal content or branded media; see `ASSETS.md`.
