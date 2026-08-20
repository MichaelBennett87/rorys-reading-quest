import { ChildButton } from '../ChildButton'

interface SpeechControlProps {
  label: string
  disabled: boolean
  onActivate: () => void
}

export function SpeechControl({ label, disabled, onActivate }: SpeechControlProps) {
  return (
    <section className="word-help-control">
      <ChildButton type="button" disabled={disabled} onClick={onActivate}>
        {label}
      </ChildButton>
    </section>
  )
}
