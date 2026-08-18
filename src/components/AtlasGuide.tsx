export function AtlasGuide() {
  return (
    <svg
      aria-hidden="true"
      role="img"
      viewBox="0 0 100 100"
      className="atlas-guide-mark"
      focusable="false"
    >
      <defs>
        <linearGradient id="atlasCompass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4f6aa7" />
          <stop offset="1" stopColor="#6f4b9d" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="47" fill="#f7f0dc" />
      <circle cx="50" cy="50" r="44" fill="none" stroke="#2f3968" strokeWidth="4" />
      <path
        d="M50 9 L64 42 L50 50 L50 84 L50 50 L36 42 Z"
        fill="url(#atlasCompass)"
      />
      <circle cx="50" cy="50" r="12" fill="#2f3968" />
      <circle cx="50" cy="50" r="7" fill="#f8d7ae" />
      <circle cx="50" cy="50" r="28" stroke="#2f3968" fill="none" strokeWidth="2.5" />
      <circle cx="50" cy="16" r="4" fill="#1f4f3e" />
      <circle cx="50" cy="84" r="4" fill="#5a2e4e" />
      <circle cx="16" cy="50" r="4" fill="#8e4d2b" />
      <circle cx="84" cy="50" r="4" fill="#4e6f34" />
    </svg>
  )
}

