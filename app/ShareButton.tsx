/* Share pill (Brad 2026-11-21: share buttons everywhere we talk about our
   products). Phones open the native share sheet; desktops get a small menu
   with Copy link, X, LinkedIn, Facebook and Email. The behavior lives in
   /protomota-share.js (loaded once in the root layout), the same script every
   Protomota site uses. */
type Props = {
  url?: string;
  title?: string;
  text?: string;
  label?: string;
  small?: boolean;
  className?: string;
};

export function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v12" />
      <path d="m7.5 7.5 4.5-4.5 4.5 4.5" />
      <path d="M5 12v6.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V12" />
    </svg>
  );
}

export default function ShareButton({ url, title, text, label = 'Share', small = false, className = '' }: Props) {
  return (
    <button
      type="button"
      className={`pm-share-btn${small ? ' is-small' : ''} ${className}`.trim()}
      data-pm-share=""
      data-share-url={url}
      data-share-title={title}
      data-share-text={text}
      aria-haspopup="menu"
      aria-label={title ? `Share ${title}` : 'Share'}
    >
      <ShareIcon />
      <span data-pm-share-label="">{label}</span>
    </button>
  );
}
