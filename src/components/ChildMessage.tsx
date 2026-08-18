import type { ReactNode } from 'react'

export type MessageCategory = 'WELCOME' | 'ENCOURAGE' | 'LOCKED' | 'READY' | 'REVIEW'

const messages: Record<MessageCategory, string> = {
  WELCOME: 'Ready for your next reading quest? Every clue makes your reading powers stronger.',
  ENCOURAGE: "You're building steady momentum—keep the clues coming.",
  LOCKED: 'This world is waiting for the next chapter of your explorer map.',
  READY: 'This quest is almost ready; we can open the lesson route in a later phase.',
  REVIEW: 'A quick review keeps your trail glowing.',
}

interface ChildMessageProps {
  category: MessageCategory
  children?: ReactNode
}

export function ChildMessage({ category, children }: ChildMessageProps) {
  const fallbackText = messages[category]

  return (
    <p className={`atlas-message atlas-message-${category.toLowerCase()}`}>
      {children ?? fallbackText}
    </p>
  )
}
