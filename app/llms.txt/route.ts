/*
 * /llms.txt: the whole page as plain Markdown for AI assistants and agents
 * (llmstxt.org). Built from lib/content.ts at build time, so it says exactly
 * what the page says.
 */
import {
  SITE,
  PROTOMOTA,
  NEWSLETTER,
  CONTACT,
  SOCIALS,
  KEY_FIGURES,
  EXPERIENCE,
  SKILLS,
  WORK_ROWS,
  LAB,
  LAB_LINKS,
  EDUCATION,
  CERTIFICATIONS,
  INDUSTRIES,
} from "@/lib/content";
import { SUMMARY, RESUME_PDF, RESUME_DOCX,
  RESUME_MD, REEL } from "@/lib/seo";

export const dynamic = "force-static";

function body() {
  const out: string[] = [];
  const add = (...lines: string[]) => out.push(...lines);

  add(
    "# Brad Dunlap",
    "",
    `> ${SUMMARY}`,
    "",
    "Technology leader in AI, product and engineering. Technical lead and product owner at NTT DATA, founder of Protomota (protomota.com). This file restates the resume page at " +
      `${SITE}/ in plain Markdown.`,
    "",
    "## Resume and contact",
    "",
    `- [Resume (PDF)](${RESUME_PDF}): the designed version, November 2026`,
    `- [Resume (Word)](${RESUME_DOCX}): editable .docx, same content`,
    `- [Resume (Markdown)](${RESUME_MD}): plain-text Markdown, same content`,
    ...CONTACT.map((c) => (c.href ? `- [${c.label}](${c.href})` : `- Location: ${c.label}`)),
    ...SOCIALS.filter((s) => !CONTACT.some((c) => c.href === s.href)).map((s) => `- [${s.name}](${s.href})`),
    "",
    "## Key figures",
    "",
    ...KEY_FIGURES.map((k) => `- ${k.value}: ${k.label}`),
    "",
    "## Experience",
    "",
  );
  for (const o of EXPERIENCE) {
    add(`### ${o.org}${o.note ? ` (${o.note})` : ""}`, "");
    for (const r of o.roles) {
      add(`**${r.title}**, ${r.dates}`, "", ...r.bullets.map((b) => `- ${b}`), "");
    }
  }

  add("## Selected work", "", "My client work is confidential, so these are my own builds from Protomota Lab.", "");
  for (const w of WORK_ROWS.flat()) {
    const also = w.also?.map((a) => ` Also: [${a.host}](${a.href}).`).join("") ?? "";
    add(`- [${w.title}](${w.href}): ${w.body}${w.tech ? ` (${w.tech})` : ""}${also}`);
  }
  add(
    "",
    `- [${REEL.name}](https://www.youtube.com/watch?v=${REEL.youtubeId}): ${REEL.description} More at ${PROTOMOTA}/motion.`,
    "",
    "## Skills",
    "",
    ...SKILLS.map((s) => `- ${s.area}: ${s.items}`),
    "",
    "## Protomota Lab",
    "",
    "Independent work outside professional employment. Jotley and PulseCanvas Studio are free and source available.",
    "",
    ...LAB.map((p) => {
      const also = p.also?.map((a) => ` Also: [${a.host}](${a.href}).`).join("") ?? "";
      return `- [${p.name}](${p.href}) (${p.meta}): ${p.text}${also}`;
    }),
    ...LAB_LINKS.map((l) => `- [${l.label}](${l.href}): ${l.text}`),
    "",
    "## Writing",
    "",
    `- [The Protomota newsletter](${NEWSLETTER}): what I'm building and what I learn along the way.`,
    "",
    "## Credentials",
    "",
    "Education:",
    "",
    ...EDUCATION.map((e) => `- ${e}`),
    "",
    "Certifications:",
    "",
    ...CERTIFICATIONS.map((c) => `- ${c}`),
    "",
    `Industries: ${INDUSTRIES}.`,
    "",
  );
  return out.join("\n");
}

export function GET() {
  return new Response(body(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
