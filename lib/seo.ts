/*
 * Search and AI-assistant metadata for the page: the title and description
 * (used by app/layout.tsx and /llms.txt) and the schema.org JSON-LD graph
 * rendered by app/page.tsx. Everything is built from lib/content.ts, so it
 * only ever restates what the page and the resume already say.
 *
 * The Person and the app @ids are the same ones protomota.com uses
 * (lib/seo.js in protomota/protomota-com), so search engines read both sites
 * as one Brad Dunlap, one Jotley and one PulseCanvas Studio.
 */
import {
  SITE,
  PROTOMOTA,
  NEWSLETTER,
  SOCIALS,
  SKILLS,
  EXPERIENCE,
  WORK_ROWS,
  LAB,
  EDUCATION,
  CERTIFICATIONS,
  YOUTUBE_AIRP,
} from "./content";

export const TITLE = "Brad Dunlap · Resume · AI, product and engineering leader";
export const DESCRIPTION =
  "Brad Dunlap's resume: 20+ years in software and product. Tech lead and product owner at NTT DATA, founder of Protomota Lab, building AI-powered apps and AI agents.";
export const SUMMARY =
  "Technology leader with 20+ years automating business and technology work, from hand-written scripts, test-driven development and CI/CD pipelines at RIIS to AI agents built with Claude and Codex today. Focuses on signal over noise and roots out performance theater: work that checks boxes but doesn't move the needle. At NTT DATA, leads the team behind a Fortune 500 AI pilot. Now, with AI as a force multiplier, builds and ships native AI-powered apps and AI agent systems solo through Protomota Lab.";
export const OG_IMAGE = { url: "/og-image.jpg?v=20261105b", width: 1200, height: 630, alt: "Brad Dunlap: 20+ years in AI, product and engineering, beside a wall of my apps, videos and experiments" };
export const PORTRAIT = { url: `${SITE}/img/brad.jpg`, width: 640, height: 640 };
export const RESUME_PDF = `${SITE}/brad-dunlap-resume-2026.pdf`;
export const RESUME_DOCX = `${SITE}/brad-dunlap-resume-2026.docx`;
export const RESUME_MD = `${SITE}/brad-dunlap-resume-2026.md`;
export const REEL = {
  name: "Brad Dunlap: my career in a minute",
  description: "A one-minute film of my career, from first iOS developer to technical lead and product owner, and the apps, AI agents, MCP servers and robots I build.",
  hls: "https://media.protomota.com/career-reel/v1/master.m3u8",
  mp4: "https://media.protomota.com/career-reel/v1/brad-dunlap-career-reel-1080p30.mp4",
  poster: `${SITE}/work/career-reel-poster.webp`,
  duration: "PT59S",
  uploadDate: "2026-11-11",
};

const PERSON_ID = `${PROTOMOTA}/#brad`;
const PROTOMOTA_ID = `${PROTOMOTA}/#protomota`;
const WEBSITE_ID = `${SITE}/#website`;
const PAGE_ID = `${SITE}/#webpage`;

// The apps are the same entities protomota.com describes.
const APP_IDS: Record<string, { id: string; category: string; store?: string }> = {
  Jotley: {
    id: `${PROTOMOTA}/#jotley`,
    category: "BusinessApplication",
    store: "https://apps.apple.com/us/app/jotley-private-ai-notes/id6746770199",
  },
  "PulseCanvas Studio": {
    id: `${PROTOMOTA}/#pulsecanvas-studio`,
    category: "MultimediaApplication",
    store: "https://apps.apple.com/us/app/pulsecanvas-studio/id6821642700",
  },
};
const OS: Record<string, string> = { Mac: "macOS", iPhone: "iOS", iPad: "iPadOS", "Vision Pro": "visionOS" };

const ref = (id: string) => ({ "@id": id });
const FREE = { "@type": "Offer", price: "0", priceCurrency: "USD" };

export function jsonLd() {
  const current = EXPERIENCE[0];
  const person = {
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Brad Dunlap",
    givenName: "Brad",
    familyName: "Dunlap",
    url: `${SITE}/`,
    mainEntityOfPage: ref(PAGE_ID),
    image: { "@type": "ImageObject", ...PORTRAIT },
    email: "mailto:brad@protomota.com",
    jobTitle: ["Technical Lead and Product Owner", "Digital Solution Consultant Associate Director"],
    description: SUMMARY,
    worksFor: [
      { "@type": "Organization", name: current.org, url: "https://www.nttdata.com/" },
      ref(PROTOMOTA_ID),
    ],
    address: { "@type": "PostalAddress", addressLocality: "Bradenton", addressRegion: "FL", addressCountry: "US" },
    alumniOf: { "@type": "CollegeOrUniversity", name: "Eastern Michigan University", url: "https://www.emich.edu/" },
    knowsAbout: SKILLS.flatMap((s) => s.items.split(", ")),
    hasCredential: [
      ...EDUCATION.map((e) => ({
        "@type": "EducationalOccupationalCredential",
        name: e.split(",")[0],
        credentialCategory: "degree",
        recognizedBy: { "@type": "CollegeOrUniversity", name: "Eastern Michigan University" },
      })),
      ...CERTIFICATIONS.map((c) => ({
        "@type": "EducationalOccupationalCredential",
        name: c,
        credentialCategory: "certificate",
      })),
    ],
    sameAs: [
      ...SOCIALS.map((s) => s.href),
      `${PROTOMOTA}/`,
      "https://airesourcepro.com/",
    ],
  };

  const protomota = {
    "@type": "Organization",
    "@id": PROTOMOTA_ID,
    name: "Protomota",
    alternateName: "Protomota Lab",
    url: `${PROTOMOTA}/`,
    founder: ref(PERSON_ID),
  };

  const website = {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: `${SITE}/`,
    name: "Brad Dunlap",
    description: DESCRIPTION,
    inLanguage: "en-US",
    author: ref(PERSON_ID),
    publisher: ref(PERSON_ID),
  };

  const apps = LAB.filter((p) => APP_IDS[p.name]).map((p) => {
    const app = APP_IDS[p.name];
    const os = p.meta
      .split(" · ")
      .map((m) => OS[m])
      .filter(Boolean)
      .join(", ");
    return {
      "@type": "SoftwareApplication",
      "@id": app.id,
      name: p.name,
      url: p.href,
      description: `${p.text} Free and source available.`,
      applicationCategory: app.category,
      operatingSystem: os,
      ...(app.store && { downloadUrl: app.store }),
      offers: FREE,
      isAccessibleForFree: true,
      author: ref(PERSON_ID),
      publisher: ref(PROTOMOTA_ID),
    };
  });

  const airp = LAB.find((p) => p.name === "AI Resource Pro");
  const sites = airp
    ? [
        {
          "@type": "WebSite",
          "@id": "https://airesourcepro.com/#website",
          name: airp.name,
          url: "https://airesourcepro.com/",
          description: airp.text,
          isAccessibleForFree: true,
          author: ref(PERSON_ID),
          publisher: ref(PROTOMOTA_ID),
          sameAs: [YOUTUBE_AIRP.href],
        },
      ]
    : [];

  // The other Selected work cards: the Mac apps.
  const skip = new Set(["jotley", "pulsecanvas", "ai-resource-pro"]);
  const works = WORK_ROWS.flat()
    .filter((w) => !skip.has(w.key))
    .map((w) => ({
      "@type": "CreativeWork",
      "@id": `${SITE}/#work-${w.key}`,
      name: w.title,
      description: w.body,
      url: w.href,
      image: `${SITE}/work/${w.key}-1440.webp`,
      ...(w.tech && { keywords: w.tech }),
      creator: ref(PERSON_ID),
    }));

  const reel = {
    "@type": "VideoObject",
    "@id": `${SITE}/#video-career-reel`,
    name: REEL.name,
    description: REEL.description,
    thumbnailUrl: REEL.poster,
    uploadDate: REEL.uploadDate,
    duration: REEL.duration,
    contentUrl: REEL.mp4,
    creator: ref(PERSON_ID),
    publisher: ref(PROTOMOTA_ID),
  };

  const page = {
    "@type": "ProfilePage",
    "@id": PAGE_ID,
    url: `${SITE}/`,
    name: TITLE,
    description: DESCRIPTION,
    inLanguage: "en-US",
    isPartOf: ref(WEBSITE_ID),
    mainEntity: ref(PERSON_ID),
    about: ref(PERSON_ID),
    dateModified: new Date().toISOString(),
    primaryImageOfPage: { "@type": "ImageObject", url: `${SITE}${OG_IMAGE.url}`, width: OG_IMAGE.width, height: OG_IMAGE.height },
    hasPart: [
      { "@type": "DigitalDocument", name: "Brad Dunlap resume (PDF)", url: RESUME_PDF, encodingFormat: "application/pdf" },
      {
        "@type": "DigitalDocument",
        name: "Brad Dunlap resume (Word)",
        url: RESUME_DOCX,
        encodingFormat: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
      ref(reel["@id"]),
    ],
    significantLink: [`${PROTOMOTA}/`, NEWSLETTER, RESUME_PDF],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [page, website, person, protomota, ...apps, ...sites, ...works, reel],
  };
}

// For a <script type="application/ld+json">: escape "<" so no string in the
// data can close the script tag.
export function jsonLdString() {
  return JSON.stringify(jsonLd()).replace(/</g, "\\u003c");
}
