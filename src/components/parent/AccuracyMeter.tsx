interface AccuracyMeterProps {
  label: string
  value: number | null
}

export function AccuracyMeter({ label, value }: AccuracyMeterProps) {
  if (value === null) {
    return <p className="accuracy-meter-empty">No practice data yet</p>
  }

  const bounded = Math.min(100, Math.max(0, value))
  return (
    <div className="accuracy-meter" aria-label={`${label} ${bounded}%`}>
      <div className="accuracy-meter-track" aria-hidden="true">
        <div className="accuracy-meter-fill" style={{ width: `${bounded}%` }} />
      </div>
      <span className="accuracy-meter-value">{bounded}%</span>
    </div>
  )
}
