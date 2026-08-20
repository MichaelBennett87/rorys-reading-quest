import { ChildButton } from '../ChildButton'

interface SupportedWordProps {
  label: string
  targetId: string
  onOpen: () => void
}

export function SupportedWord({ label, targetId, onOpen }: SupportedWordProps) {
  return (
    <ChildButton
      type="button"
      className="supported-word"
      onClick={onOpen}
      aria-label={`Open word help for ${label}`}
    >
      <span data-target-id={targetId} className="supported-word-text">
        {label}
      </span>
    </ChildButton>
  )
}

