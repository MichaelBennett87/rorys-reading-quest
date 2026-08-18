interface ProgressMeterProps {
  label: string
  value: number
  unitLabel?: string
}

export function ProgressMeter({ label, value, unitLabel = 'complete' }: ProgressMeterProps) {
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div className="progress-meter">
      <div className="progress-meter-row">
        <span>{label}</span>
        <span aria-live="polite">{clamped}%</span>
      </div>
      <progress
        value={clamped}
        max="100"
        aria-label={`${label}: ${clamped}% ${unitLabel}`}
        className="progress-meter-bar"
      />
    </div>
  )
}

