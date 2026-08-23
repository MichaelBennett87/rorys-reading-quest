import type { Passage, WordSupportTarget } from '../../domain/content'
import { InformationalTextCard } from './InformationalTextCard'
import { PassageCard } from './PassageCard'
import { PoemCard } from './PoemCard'

interface LessonTextCardProps {
  passage: Passage
  heading: string
  headingId?: string
  evidenceSnippets?: string[]
  wordSupportTargets?: WordSupportTarget[]
  onOpenWordSupport?: (target: WordSupportTarget) => void
  visibleWordSupport?: boolean
}

export function LessonTextCard({
  passage,
  heading,
  headingId,
  evidenceSnippets = [],
  wordSupportTargets = [],
  onOpenWordSupport,
  visibleWordSupport = true,
}: LessonTextCardProps) {
  switch (passage.contentKind) {
    case 'poem':
      return passage.poemStructure ? (
        <PoemCard
          heading={heading}
          headingId={headingId}
          poemText={passage.passageText}
          poemStructure={passage.poemStructure}
          wordSupportTargets={wordSupportTargets}
          onOpenWordSupport={onOpenWordSupport}
          visibleWordSupport={visibleWordSupport}
          evidenceSnippets={evidenceSnippets}
        />
      ) : (
        <section className="card poem-card">
          <h2>{heading}</h2>
          <p>This poem could not be displayed.</p>
        </section>
      )
    case 'informational':
      return (
        <InformationalTextCard
          heading={heading}
          headingId={headingId}
          passage={passage}
          wordSupportTargets={wordSupportTargets}
          onOpenWordSupport={onOpenWordSupport}
          visibleWordSupport={visibleWordSupport}
          evidenceSnippets={evidenceSnippets}
        />
      )
    default:
      return (
        <PassageCard
          heading={heading}
          headingId={headingId}
          passageText={passage.passageText}
          wordSupportTargets={wordSupportTargets}
          onOpenWordSupport={onOpenWordSupport}
          visibleWordSupport={visibleWordSupport}
          evidenceSnippets={evidenceSnippets}
        />
      )
  }
}
