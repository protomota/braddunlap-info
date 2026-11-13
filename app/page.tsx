import { ProtomotaFamily } from './ProtomotaFamily';
import { getPosts } from "@/lib/newsletter";
import { jsonLdString, REEL } from "@/lib/seo";
import CareerScene from "./CareerScene";
import ReelPlayer from "./ReelPlayer";
import ResumePicker from "./ResumePicker";
import ContactForm from "./ContactForm";
import {
  PROTOMOTA,
  NEWSLETTER,
  NAV,
  CONTACT,
  SOCIALS,
  KEY_FIGURES,
  TIMELINE,
  EXPERIENCE,
  SKILLS,
  WORK_ROWS,
  LAB,
  LAB_APPS,
  LAB_LINKS,
  EDUCATION,
  CERTIFICATIONS,
  INDUSTRIES,
} from "@/lib/content";

export const revalidate = 3600;

// The contact form only shows once the Resend key is in Vercel (a new env var
// needs a redeploy anyway), so the page never offers a form that can't send.
const FORM_ON = Boolean(process.env.RESEND_API_KEY?.trim());
const NAV_ITEMS = FORM_ON ? NAV : NAV.filter((item) => item.url !== "#contact");

// Every Resume button opens the PDF-or-Word picker (app/ResumePicker.tsx).
const PICKER = "resume-picker";

// Lucide icon paths (ISC license), drawn inline so the page stays JS-free.
const SKILL_ICONS: Record<string, React.ReactNode> = {
  ai: (<><path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2M20 14h2M15 13v2M9 13v2" /></>),
  code: (<><path d="m18 16 4-4-4-4M6 8l-4 4 4 4M14.5 4l-5 16" /></>),
  robot: (<><rect width="16" height="16" x="4" y="4" rx="2" /><rect width="6" height="6" x="9" y="9" rx="1" /><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2" /></>),
  cloud: (<><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" /></>),
  shield: (<><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></>),
  flow: (<><rect width="8" height="8" x="3" y="3" rx="2" /><path d="M7 11v4a2 2 0 0 0 2 2h4" /><rect width="8" height="8" x="13" y="13" rx="2" /></>),
};

/* ---------- timeline geometry (computed at build time) ---------- */
const T0 = 2007;
const NOW = new Date();
const T1 = NOW.getFullYear() + (NOW.getMonth() + 1) / 12;
const toYear = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  return y + (m - 1) / 12;
};
const pct = (y: number) => ((y - T0) / (T1 - T0)) * 100;
const TICKS = [2007, 2010, 2013, 2016, 2019, 2022, 2025];

function Mark({ size = 26 }: { size?: number }) {
  return <img src="/img/protomota-mark.svg" width={size} height={size} alt="" aria-hidden="true" />;
}

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17L17 7M8 7h9v9" />
    </svg>
  );
}

// Ties a sentence's last two words together with a non-breaking space, so no
// line ends on one lonely word (text-wrap: pretty in globals.css covers most
// browsers; this covers the rest).
function tie(text: string) {
  return text.replace(/ (\S+)$/, "\u00a0$1");
}

// Any airesourcepro.com mention in plain copy becomes a link (Brad 2026-11-11: a URL we mention is always a link).
function linkAirp(text: string) {
  const parts = text.split("airesourcepro.com");
  if (parts.length === 1) return text;
  return parts.flatMap((p, i) =>
    i === 0 ? [p] : [<a key={i} href="https://airesourcepro.com">airesourcepro.com</a>, p]
  );
}

function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
    </svg>
  );
}

function Head({ n, title, note }: { n: string; title: string; note?: React.ReactNode }) {
  return (
    <header className="head" data-reveal>
      <span className="num">{n}</span>
      <h2>{title}</h2>
      {note && <div className="head-note">{note}</div>}
    </header>
  );
}

export default async function Home() {
  const posts = await getPosts(5);

  return (
    <div className="page">
      {/* Structured data for search engines and AI assistants (lib/seo.ts) */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString() }} />
      <div className="bg-grid" aria-hidden="true" />
      <div className="bg-glow" aria-hidden="true" />

      <header className="top">
        <div className="shell top-inner">
          <a href={PROTOMOTA} className="brand" aria-label="Protomota home">
            <Mark />
            Protomota
          </a>
          <nav className="nav" aria-label="Sections">
            {NAV_ITEMS.map((item) => (
              <a key={item.url} href={item.url}>{item.label}</a>
            ))}
          </nav>
          <div className="top-cta">
            <a href={PROTOMOTA} className="btn btn-ghost top-site">protomota.com <Arrow /></a>
            <button type="button" popoverTarget={PICKER} className="btn btn-secondary">
              <DownloadIcon /> <span className="top-resume-label">Resume</span>
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <CareerScene roles={TIMELINE} quiet={[".hero h1", ".hero-sub"]} />
          <div className="shell hero-grid">
          <div className="hero-copy">
            <span className="kicker"><span className="dot" /> Open to new roles · Resume</span>
            <h1>Brad Dunlap</h1>
            <p className="hero-sub">
              Technology leader in <strong>AI, product and engineering</strong>. Technical lead and
              product owner at NTT DATA by day, founder of{" "}
              <a href={PROTOMOTA}>Protomota&nbsp;Lab</a> the rest of the time.
            </p>
            <p className="hero-sub hero-open">
              <strong>I&apos;m currently looking for new opportunities</strong> in AI automation
              and agentic AI. I&apos;m open to AI-first teams of any size, from an early-stage
              startup to a large company with AI at its core, where I can help ship AI that does
              real work. I also build automation for small businesses through Protomota Lab. If you
              think what I offer fits what you&apos;re building,{" "}
              <a href={FORM_ON ? "#contact" : "mailto:brad@protomota.com"}>I&apos;d love to hear from&nbsp;you</a>.
            </p>
            <div className="hero-cta">
              <button type="button" popoverTarget={PICKER} className="btn btn-primary btn-lg">
                <DownloadIcon /> Download my resume
              </button>
              <a href={PROTOMOTA} className="btn btn-secondary btn-lg">
                Visit Protomota <Arrow />
              </a>
            </div>
            <ul className="contact">
              {CONTACT.map((c) => (
                <li key={c.label}>{c.href ? <a href={c.href}>{c.label}</a> : c.label}</li>
              ))}
            </ul>
          </div>
          <div className="hero-photo">
            <img src="/img/brad.jpg" alt="Portrait of Brad Dunlap" width={640} height={640} fetchPriority="high" />
          </div>
          </div>
          <div className="shell hero-band">
            <p className="band-cap">
              <span>Fig. 0</span> My career since 2007, drawn as light. Each strand is a role;{" "}
              <i className="hint-hover">hover one.</i>
              <i className="hint-touch">tap one.</i>
            </p>
          </div>
        </section>

        <section className="section shell" id="profile">
          <Head n="01" title="Profile" />
          <div className="profile">
            <div className="profile-body" data-reveal>
              <p className="lead">
                I have spent more than twenty years in software engineering, product ownership and
                digital product delivery.
              </p>
              <p>
                I lead multidisciplinary teams and connect business priorities to application design,
                architecture and implementation. At NTT DATA I&apos;m the technical lead and product
                owner for a Fortune 500 initiative in virtual reality, voice and <span style={{ whiteSpace: "nowrap" }}>AI-assisted automation.</span>
              </p>
              <p>
                Outside work I build and ship native AI-powered apps and AI agent systems through{" "}
                <a href={PROTOMOTA}>Protomota&nbsp;Lab</a>.
              </p>
            </div>
            <figure className="figures" data-reveal>
              <figcaption><span>Table 1</span> Key figures</figcaption>
              <dl>
                {KEY_FIGURES.map((f) => (
                  <div key={f.label}>
                    <dt>{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
            </figure>
          </div>
        </section>

        <section className="section shell" id="experience">
          <Head n="02" title="Experience" />

          <figure className="timeline" data-reveal>
            <figcaption>
              <span>Fig. 1</span> Employment timing diagram, 2007 to present. Overlapping traces are
              concurrent leadership roles at Vectorform.
            </figcaption>
            <div className="tl-rows">
              {TICKS.map((y) => (
                <span key={y} className="tl-grid" aria-hidden="true" style={{ "--x": pct(y) } as React.CSSProperties} />
              ))}
              {TIMELINE.map((s) => {
                const a = pct(toYear(s.start));
                const b = s.end ? pct(toYear(s.end)) : 100;
                return (
                  <div className="tl-row" key={s.label}>
                    <span className="tl-label">{s.label}</span>
                    <span className="tl-track">
                      <span
                        className={`tl-bar ${s.end ? "" : "is-now"}`}
                        style={{ left: `${a}%`, width: `${Math.max(b - a, 1.2)}%` }}
                      />
                    </span>
                  </div>
                );
              })}
              <div className="tl-row tl-axis" aria-hidden="true">
                <span className="tl-label tl-blank" />
                <span className="tl-track">
                  {TICKS.map((y) => (
                    <span key={y} className="tl-tick" style={{ left: `${pct(y)}%` }}>{y}</span>
                  ))}
                </span>
              </div>
            </div>
          </figure>

          <div className="orgs">
            {EXPERIENCE.map((o, i) => (
              <article className="org" key={`${o.org}-${i}`} data-reveal>
                <div className="org-side">
                  <h3>{o.href ? <a href={o.href}>{o.org}</a> : o.org}</h3>
                  {o.note && <p>{tie(o.note)}</p>}
                </div>
                <div className="org-roles">
                  {o.roles.map((r) => (
                    <div className="role" key={r.title}>
                      <div className="role-head">
                        <h4>{r.title}</h4>
                        <span className="role-dates">{r.dates}</span>
                      </div>
                      <ul className="bullets">
                        {r.bullets.map((b) => (
                          <li key={b}>{linkAirp(tie(b))}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section shell" id="work">
          <Head
            n="03"
            title="Selected work"
            note={<p>My client work is confidential, so these are my own builds from Protomota&nbsp;Lab.</p>}
          />
          <div className="work">
            {WORK_ROWS.map((row, r) => (
              <div className="work-row" key={r}>
                {row.map((w) => {
                  const fig = WORK_ROWS.flat().indexOf(w) + 2;
                  return (
                    <div className="work-card" key={w.key} style={{ flexGrow: w.ratio }} data-reveal>
                      <span className="work-img" style={{ aspectRatio: String(w.ratio) }}>
                        <img
                          src={`/work/${w.key}-720.webp`}
                          srcSet={`/work/${w.key}-720.webp 720w, /work/${w.key}-1440.webp 1440w`}
                          sizes="(max-width: 760px) 100vw, 50vw"
                          alt={w.alt}
                          loading="lazy"
                          decoding="async"
                        />
                      </span>
                      <span className="work-body">
                        <span className="work-fig">Fig. {fig}</span>
                        <strong>{w.title}</strong>
                        <span className="work-text">{tie(w.body)}</span>
                        {w.tech && <span className="work-tech">{w.tech}</span>}
                        <span className="work-links">
                          <a className="work-link card-main" href={w.href}>{w.host} <Arrow /></a>
                          {w.also?.map((a) => (
                            <a className="work-link card-also" key={a.href} href={a.href}>{a.host} <Arrow /></a>
                          ))}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </section>

        <section className="section shell" id="skills">
          <Head n="04" title="Skills" />
          <dl className="skills">
            {SKILLS.map((s) => (
              <div key={s.area} data-reveal>
                <svg className="skill-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {SKILL_ICONS[s.icon]}
                </svg>
                <dt>{s.area}</dt>
                <dd>{tie(s.items)}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="section shell" id="protomota">
          <Head
            n="05"
            title="Protomota"
            note={
              <p>
                Protomota Lab is where I build and ship my own apps: Jotley and PulseCanvas Studio on the
                App Store, plus OpenTalon, Inkspring, Voxley and Textley for Mac. Most of my apps are productivity tools I build for my own work, use every day and give
                away, and I help businesses get set up on them too. PulseCanvas Studio is my music video
                app. Everything lives at&nbsp;<a href={PROTOMOTA}>protomota.com</a>.
              </p>
            }
          />
          <figure className="reel" data-reveal>
            <div className="reel-frame">
              <ReelPlayer
                src={REEL.hls}
                mp4={REEL.mp4}
                title={REEL.name}
                poster="/work/career-reel-poster.webp"
              />
            </div>
            <figcaption>
              <span>My career in a minute</span> Twenty years of leading teams and building the thing, in 4K at 60 fps, set to my song “One Less&nbsp;Thing”.
            </figcaption>
          </figure>
          <div className="lab">
            {LAB.map((p) => (
              <div className="lab-card" key={p.name} data-reveal>
                <div className="lab-id">
                  <img src={p.icon} alt={`${p.name} icon`} width={56} height={56} loading="lazy" />
                  <div>
                    <span className="lab-meta">{p.meta}</span>
                    <h3>{p.name}</h3>
                  </div>
                </div>
                <p>{tie(p.text)}</p>
                <span className="lab-links-in">
                  <a className="lab-link card-main" href={p.href}>{p.host} <Arrow /></a>
                  {p.also?.map((a) => (
                    <a className="lab-link card-also" key={a.href} href={a.href}>{a.host} <Arrow /></a>
                  ))}
                </span>
              </div>
            ))}
          </div>
          <div className="lab-links lab-apps" data-reveal>
            {LAB_APPS.map((l) => (
              <a key={l.label} href={l.href}>
                <strong>{l.label}</strong>
                <span>{tie(l.text)}</span>
                <Arrow />
              </a>
            ))}
          </div>
          <div className="lab-links" data-reveal>
            {LAB_LINKS.map((l) => (
              <a key={l.label} href={l.href}>
                <strong>{l.label}</strong>
                <span>{tie(l.text)}</span>
                <Arrow />
              </a>
            ))}
          </div>
        </section>

        <section className="section shell" id="writing">
          <Head
            n="06"
            title="Writing"
            note={<p>The Protomota Lab newsletter: what I&apos;m building and what I learn along the way.</p>}
          />
          {posts.length > 0 && (
            <ol className="posts">
              {posts.map((post) => (
                <li key={post.url} data-reveal>
                  <a href={post.url} target="_blank" rel="noopener">
                    <span className="post-date">{post.date}</span>
                    <span className="post-title">{post.title}</span>
                    <Arrow />
                  </a>
                </li>
              ))}
            </ol>
          )}
          <a className="textlink" href={NEWSLETTER} target="_blank" rel="noopener">
            All posts on Substack <Arrow />
          </a>
        </section>

        <section className="section shell" id="credentials">
          <Head n="07" title="Credentials" />
          <div className="creds">
            <div data-reveal>
              <h3>Education</h3>
              <ul className="bullets">{EDUCATION.map((e) => <li key={e}>{e}</li>)}</ul>
            </div>
            <div data-reveal>
              <h3>Certifications</h3>
              <ul className="bullets">{CERTIFICATIONS.map((c) => <li key={c}>{c}</li>)}</ul>
            </div>
            <div data-reveal>
              <h3>Industries</h3>
              <p>{INDUSTRIES}.</p>
            </div>
          </div>
        </section>

        {FORM_ON && (
        <section className="section shell" id="contact">
          <div className="contact-card" data-reveal>
            <div className="contact-copy">
              <span className="num">08</span>
              <h2>Get in touch</h2>
              <p>
                Questions about a role, a project, or anything on this page. Send a note
                and I&apos;ll reply by&nbsp;email.
              </p>
              <p className="contact-aside">Open to new roles and business opportunities.</p>
            </div>
            <ContactForm />
          </div>
        </section>
        )}

        <section className="shell newsletter-wrap" id="newsletter">
          <div className="newsletter" data-reveal>
            <span className="newsletter-icon" aria-hidden="true"><MailIcon /></span>
            <div className="newsletter-copy">
              <h2>One newsletter. All of Protomota.</h2>
              <p>{tie("Product updates and notes from the things I'm building. Join only if you want to.")}</p>
            </div>
            <a className="btn btn-pill btn-lg" href={NEWSLETTER} target="_blank" rel="noopener">
              Join the newsletter <Arrow />
            </a>
          </div>
        </section>

        <section className="section shell">
          <div className="closer" data-reveal>
            <div>
              <h2>Want the full picture?</h2>
              <p>
                Download my resume as a PDF or a Word file, or see what I&apos;m building right now
                on protomota.com.
              </p>
            </div>
            <div className="hero-cta">
              <button type="button" popoverTarget={PICKER} className="btn btn-primary btn-lg">
                <DownloadIcon /> Download my resume
              </button>
              <a href={PROTOMOTA} className="btn btn-secondary btn-lg">
                protomota.com <Arrow />
              </a>
            </div>
          </div>
        </section>
      </main>

      <ResumePicker id={PICKER} />

      <ProtomotaFamily />
      <footer className="foot">
        <div className="shell foot-inner">
          <a href={PROTOMOTA} className="brand">
            <Mark size={22} />
            Protomota
          </a>
          <nav className="foot-links" aria-label="Elsewhere">
            {SOCIALS.map((s) => (
              <a key={s.name} href={s.href} target="_blank" rel="me noopener">{s.name}</a>
            ))}
          </nav>
          <span className="foot-copy">© {new Date().getFullYear()} Protomota · Brad Dunlap</span>
        </div>
      </footer>
    </div>
  );
}
