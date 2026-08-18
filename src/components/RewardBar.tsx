interface RewardBarProps {
  xp: number
  stars: number
  streak: number
}

export function RewardBar({ xp, stars, streak }: RewardBarProps) {
  return (
    <section aria-label="Quest rewards" className="reward-bar">
      <div className="reward-pill reward-xp">
        <span aria-hidden="true">✨ XP</span>
        <strong aria-label={`${xp} experience points`}>{xp}</strong>
      </div>
      <div className="reward-pill reward-stars">
        <span aria-hidden="true">🌟 Stars</span>
        <strong aria-label={`${stars} stars earned`}>{stars}</strong>
      </div>
      <div className="reward-pill reward-streak">
        <span aria-hidden="true">🔥 Streak</span>
        <strong aria-label={`Quest streak ${streak} sessions`}>{streak} sessions</strong>
      </div>
    </section>
  )
}

