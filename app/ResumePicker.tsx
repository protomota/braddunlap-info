"use client";

/* The resume download picker. Every Resume button on the page is a plain
   <button popoverTarget={id}> that opens this popover, which offers the PDF,
   the Word file or the Markdown file. The popover API opens it, centres it and closes it on Esc or
   an outside click with no JS at all, so it works before hydration. This is a
   client component only so that picking a file also closes it.
   protomota.com's About section has the same picker (components/redesign/
   ResumePicker.js); keep the two in step. */

const FILES = [
  {
    href: "/brad-dunlap-resume-2026.pdf",
    download: "Brad Dunlap - Resume 2026.pdf",
    badge: "PDF",
    label: "PDF",
    note: "The designed version, best for reading and printing.",
    meta: "2.5 MB",
  },
  {
    href: "/brad-dunlap-resume-2026.docx",
    download: "Brad Dunlap - Resume 2026.docx",
    badge: "DOC",
    label: "Word",
    note: "An editable .docx for application forms that ask for Word.",
    meta: "0.6 MB",
  },
  {
    href: "/brad-dunlap-resume-2026.md",
    download: "Brad Dunlap - Resume 2026.md",
    badge: "MD",
    label: "Markdown",
    note: "Plain text for AI tools, application forms and quick reading.",
    meta: "9 KB",
  },
];

function close(e: React.MouseEvent<HTMLElement>) {
  e.currentTarget.closest<HTMLElement>("[popover]")?.hidePopover();
}

export default function ResumePicker({ id }: { id: string }) {
  return (
    <div id={id} popover="auto" className="resume-pick" role="dialog" aria-labelledby={`${id}-title`}>
      <div className="resume-pick-top">
        <span className="resume-pick-kicker">Resume · November 2026</span>
        <button type="button" className="resume-pick-close" popoverTarget={id} popoverTargetAction="hide" aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <h2 id={`${id}-title`} className="resume-pick-title">Download my resume</h2>
      <p className="resume-pick-sub">Pick a format.</p>
      <ul className="resume-pick-list">
        {FILES.map((f) => (
          <li key={f.href}>
            <a href={f.href} download={f.download} className="resume-pick-opt" onClick={close}>
              <span className="resume-pick-badge" aria-hidden="true">{f.badge}</span>
              <span className="resume-pick-text">
                <strong>{f.label}</strong>
                <span>{f.note}</span>
              </span>
              <span className="resume-pick-meta">
                {f.meta}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3v12M7 10l5 5 5-5M5 21h14" />
                </svg>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
