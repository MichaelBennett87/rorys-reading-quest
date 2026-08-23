import type { Passage, WordSupportTarget } from '../../domain/content'
import type { PairedTextMember } from '../../domain/content/packs/contentPackTypes'
import { LessonTextCard } from './LessonTextCard'

interface PairedTextCardProps {
  pairId: string
  pairTitle: string
  members: [PairedTextMember, PairedTextMember]
  passages: [Passage, Passage]
  wordSupportTargets?: WordSupportTarget[]
  evidenceSnippetsByPassageId?: Record<string, string[]>
  onOpenWordSupport?: (target: WordSupportTarget) => void
  visibleWordSupport?: boolean
}

export function PairedTextCard({
  pairId,
  pairTitle,
  members,
  passages,
  wordSupportTargets = [],
  evidenceSnippetsByPassageId = {},
  onOpenWordSupport,
  visibleWordSupport = true,
}: PairedTextCardProps) {
  const targetsBySentenceId = new Map<string, WordSupportTarget[]>()
  for (const target of wordSupportTargets) {
    const targets = targetsBySentenceId.get(target.sentenceId) ?? []
    targets.push(target)
    targetsBySentenceId.set(target.sentenceId, targets)
  }

  return (
    <section className="card paired-text-card" aria-labelledby={`${pairId}-paired-text-heading`}>
      <h2 id={`${pairId}-paired-text-heading`}>{pairTitle}</h2>
      <p className="paired-text-instructions">Read both texts. Then compare the important details.</p>
      <div className="paired-text-grid">
        {passages.map((passage, index) => {
          const member = members[index]
          const headingId = `${pairId}-${member.label.toLowerCase().replace(/\s+/g, '-')}-heading`
          return (
            <div key={member.passageId} className="paired-text-panel">
              <LessonTextCard
                passage={passage}
                heading={`${member.label}: ${member.displayTitle}`}
                headingId={headingId}
                evidenceSnippets={evidenceSnippetsByPassageId[member.passageId] ?? []}
                wordSupportTargets={passage.sentences?.flatMap((sentence) => targetsBySentenceId.get(sentence.sentenceId) ?? []) ?? []}
                onOpenWordSupport={onOpenWordSupport}
                visibleWordSupport={visibleWordSupport}
              />
            </div>
          )
        })}
      </div>
    </section>
  )
}
