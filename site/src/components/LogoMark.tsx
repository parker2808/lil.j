/** Static version of the scene 1 gate mark (pink moon, monogram line, tilted orbit + star). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <radialGradient id="lm-moon" cx="50%" cy="58%" r="55%">
          <stop offset="0" stopColor="#f8d0e2" />
          <stop offset="0.62" stopColor="#e7a3c0" />
          <stop offset="1" stopColor="#c97b9e" />
        </radialGradient>
        <radialGradient id="lm-shine" cx="34%" cy="30%" r="36%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="55" rx="45" ry="17" fill="none" stroke="#fff7fb" strokeOpacity="0.75" strokeWidth="2.2" />
      <circle cx="50" cy="55" r="28" fill="url(#lm-moon)" />
      <circle cx="50" cy="55" r="28" fill="url(#lm-shine)" />
      <g transform="translate(50 55) scale(0.62) translate(-37 -35)" fill="none" stroke="#fff7fb" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M28 16 V42 Q28 54 46 54" />
        <g fill="#fff" stroke="none">
          <circle cx="28" cy="16" r="3" />
          <circle cx="28" cy="32" r="2.2" />
          <circle cx="34" cy="48" r="2.2" />
          <circle cx="46" cy="54" r="3" />
        </g>
      </g>
      <path d="M5 55 A45 17 0 0 0 95 55" fill="none" stroke="#fff7fb" strokeOpacity="0.9" strokeWidth="2.2" />
      <circle cx="88" cy="46" r="4" fill="#fff" />
    </svg>
  );
}
