import type { InformationalReferenceFeature } from '../../domain/content'

interface ReferenceMaterialCardProps {
  feature: InformationalReferenceFeature
}

export function ReferenceMaterialCard({ feature }: ReferenceMaterialCardProps) {
  const typeLabel = feature.referenceKind === 'dictionary' ? 'Dictionary' : 'Thesaurus'

  return (
    <section
      className="informational-sidebar reference-material-card"
      aria-labelledby={`${feature.featureId}-title`}
      data-reference-kind={feature.referenceKind}
    >
      <h4 id={`${feature.featureId}-title`}>{typeLabel}</h4>
      <p className="reference-headword"><strong>{feature.headword}</strong></p>
      <ol aria-label={`${feature.headword} meanings`}>
        {feature.senses.map((sense) => (
          <li key={sense.senseId}>
            {sense.partOfSpeech && <span className="reference-part-of-speech">{sense.partOfSpeech}: </span>}
            {sense.meaning}
          </li>
        ))}
      </ol>
      {(feature.relatedWords?.length ?? 0) > 0 && (
        <p><strong>Related words:</strong> {feature.relatedWords?.join(', ')}</p>
      )}
    </section>
  )
}
