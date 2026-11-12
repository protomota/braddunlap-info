import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { SITE } from "@/lib/content";
import { TITLE, DESCRIPTION, OG_IMAGE } from "@/lib/seo";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

// Same type system as protomota.com: Space Grotesk headings, Inter body,
// JetBrains Mono labels.
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "Brad Dunlap",
  authors: [{ name: "Brad Dunlap", url: SITE }],
  creator: "Brad Dunlap",
  publisher: "Protomota Lab",
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: "/",
    siteName: "Brad Dunlap",
    locale: "en_US",
    title: TITLE,
    description: DESCRIPTION,
    firstName: "Brad",
    lastName: "Dunlap",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    site: "@protomotalab",
    creator: "@protomotalab",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  // Icons: app/favicon.ico and app/apple-icon.png, picked up by file convention.
  // Google Search Console and Bing Webmaster Tools ownership tags.
  verification: {
    google: "IJZsHWQ6Tgckh84GB2ngnSrDy_Iw1AEg4Ct8_0G2DIg",
    other: { "msvalidate.01": "E2001B47E91F72A19BB1E8E642B26928" },
  },
};

export const viewport: Viewport = { themeColor: "#0a0a0b", colorScheme: "dark" };

// Google Analytics 4. Only production deploys send hits (not previews or
// local runs). Besides page views it sends three click events from one
// delegated listener: resume_download (the PDF or Word file), newsletter_click
// (anything on newsletter.protomota.com) and outbound_click (any other site),
// each with the link's URL as link_url.
const GA_ID = "G-YL3REZYLXP";
const GA_ON = process.env.VERCEL_ENV === "production";
const GA_INIT = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');
document.addEventListener('click', function (e) {
  var a = e.target instanceof Element && e.target.closest('a[href]');
  if (!a) return;
  var url;
  try { url = new URL(a.href, location.href); } catch (_) { return; }
  var ext = (url.pathname.match(/\\.(pdf|docx)$/i) || [])[1];
  if (ext && url.origin === location.origin) {
    gtag('event', 'resume_download', { file_extension: ext.toLowerCase(), file_name: url.pathname.split('/').pop(), link_url: url.href });
  } else if (url.hostname === 'newsletter.protomota.com') {
    gtag('event', 'newsletter_click', { link_url: url.href });
  } else if (/^https?:$/.test(url.protocol) && url.hostname !== location.hostname) {
    gtag('event', 'outbound_click', { link_url: url.href, link_domain: url.hostname });
  }
}, true);
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${grotesk.variable} ${inter.variable} ${mono.variable}`}>
      <body>
        {children}
        {GA_ON && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">{GA_INIT}</Script>
          </>
        )}
      </body>
    </html>
  );
}
