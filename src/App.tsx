function App() {
  const pathwayCards = [
    { title: 'Foundation established', details: 'Grade 2 Bridge activities and checkpoints.' },
    { title: 'Grade 2 Bridge', details: 'Core decoding, fluency, and sight-word foundations.' },
    { title: 'Grade 3 Quest', details: 'Narrative and informational mastery lanes.' },
    { title: 'Grade 4 Frontier', details: 'Early stretch work for later progression.' },
  ]

  return (
    <main className="app-shell">
      <section className="hero-card">
        <svg
          aria-hidden="true"
          role="img"
          viewBox="0 0 140 140"
          className="compass-mark"
          focusable="false"
        >
          <circle cx="70" cy="70" r="58" fill="#fdf6ef" />
          <circle cx="70" cy="70" r="48" stroke="#d8c9b7" fill="none" strokeWidth="3" />
          <path d="M70 16 L84 56 L56 84 L16 70 Z" fill="#f0a16f" />
          <path d="M70 124 L56 84 L84 56 L124 70 Z" fill="#f8c28f" />
          <circle cx="70" cy="70" r="9" fill="#bf4f27" />
          <circle cx="70" cy="70" r="24" stroke="#bf4f27" strokeWidth="3" fill="none" />
          <path d="M70 24 L62 56 L70 70 L70 98" stroke="#1f2342" strokeWidth="3" fill="none" />
        </svg>
        <div className="hero-text">
          <h1>Rory&apos;s Reading Quest</h1>
          <p>Build reading powers one quest at a time.</p>
        </div>
      </section>

      <section className="session-card">
        <h2>Starting Journey</h2>
        <p>
          This minimal shell proves the foundation architecture.
          No account required in this phase.
        </p>
        <div className="pathway-grid" role="list">
          {pathwayCards.map((card) => (
            <article className="pathway" role="listitem" key={card.title}>
              <h3>{card.title}</h3>
              <p>{card.details}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="path-controls">
        <button type="button">Start Training Round</button>
        <button type="button">Try a New Route</button>
        <button type="button">Clue Practice</button>
      </section>

      <section className="parent-area" aria-label="Parent area placeholder">
        <h2>Parent Area</h2>
        <p>Parent-facing review panel is not yet implemented.</p>
        <p className="parent-note">Phase 0 focuses on shell and deterministic engine setup.</p>
      </section>
    </main>
  )
}

export default App
