import { memo } from 'react'

import type { Passage, WordSupportTarget } from '../../domain/content'
import type {
  InformationalCaptionFeature,
  InformationalFeature,
  InformationalGlossaryFeature,
  InformationalGraphFeature,
  InformationalIllustrationFeature,
  InformationalMapFeature,
} from '../../domain/content'
import { SupportedText } from './SupportedText'

interface InformationalTextCardProps {
  heading: string
  headingId?: string
  passage: Passage
  evidenceSnippets?: string[]
  wordSupportTargets?: WordSupportTarget[]
  onOpenWordSupport?: (target: WordSupportTarget) => void
  visibleWordSupport?: boolean
}

function InformationalTextCard({
  heading,
  headingId = 'lesson-informational-heading',
  passage,
  evidenceSnippets = [],
  wordSupportTargets = [],
  onOpenWordSupport,
  visibleWordSupport = true,
}: InformationalTextCardProps) {
  const structure = passage.informationalStructure
  if (!structure) {
    return (
      <section className="card informational-text-card" aria-labelledby={headingId}>
        <h2 id={headingId}>{heading}</h2>
        <p>This informational passage could not be displayed.</p>
      </section>
    )
  }

  const sentences = passage.sentences ?? []
  const sentenceTargetsById = new Map<string, WordSupportTarget[]>()
  for (const target of wordSupportTargets) {
    const targets = sentenceTargetsById.get(target.sentenceId) ?? []
    targets.push(target)
    sentenceTargetsById.set(target.sentenceId, targets)
  }

  const featureById = new Map(structure.features.map((feature) => [feature.featureId, feature] as const))
  const captionByTargetId = new Map(
    structure.features
      .filter((feature): feature is InformationalCaptionFeature => feature.kind === 'caption')
      .map((feature) => [feature.targetFeatureId, feature] as const),
  )

  return (
    <section className="card informational-text-card" aria-labelledby={headingId}>
      <h2 id={headingId}>{heading}</h2>
      <article className="informational-text" aria-label="Informational text">
        {renderTitle(featureById.get(structure.titleFeatureId))}
        {structure.sections.map((section) => {
          const headingFeature = featureById.get(section.headingFeatureId)
          if (!headingFeature || headingFeature.kind !== 'heading') {
            return null
          }

          return (
            <section key={section.sectionId} className="informational-section" aria-labelledby={headingFeature.featureId}>
              <h3 id={headingFeature.featureId}>{headingFeature.text}</h3>
              {section.sentenceIds.map((sentenceId) => {
                const sentence = sentences.find((entry) => entry.sentenceId === sentenceId)
                if (!sentence) {
                  return null
                }

                return (
                  <p key={sentence.sentenceId} className="informational-sentence">
                    <SupportedText
                      text={sentence.text}
                      targets={sentenceTargetsById.get(sentence.sentenceId) ?? []}
                      onOpenWordSupport={onOpenWordSupport}
                      visibleWordSupport={visibleWordSupport}
                    />
                  </p>
                )
              })}
              <div className="informational-section-features">
                {section.featureIds
                  .map((featureId) => featureById.get(featureId))
                  .filter((feature): feature is InformationalFeature => feature !== undefined && feature.kind !== 'caption')
                  .map((feature) => renderFeature(feature, captionByTargetId.get(feature.featureId), onOpenWordSupport, visibleWordSupport))}
              </div>
            </section>
          )
        })}
      </article>
      {evidenceSnippets.length > 0 && (
        <div>
          <h3>Evidence in this passage</h3>
          <ul>
            {evidenceSnippets.map((snippet) => (
              <li key={snippet} className="evidence-snippet">
                {snippet}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}

function renderTitle(feature?: InformationalFeature) {
  if (!feature || feature.kind !== 'title') {
    return null
  }

  return (
    <p className="informational-title" aria-label="Title">
      <strong>{feature.text}</strong>
    </p>
  )
}

function renderFeature(
  feature: InformationalFeature,
  caption: InformationalCaptionFeature | undefined,
  onOpenWordSupport: InformationalTextCardProps['onOpenWordSupport'],
  visibleWordSupport: boolean,
) {
  switch (feature.kind) {
    case 'graph':
      return renderGraphFeature(feature, caption, onOpenWordSupport, visibleWordSupport)
    case 'map':
      return renderMapFeature(feature, caption)
    case 'glossary':
      return renderGlossaryFeature(feature)
    case 'illustration':
      return renderIllustrationFeature(feature, caption)
    default:
      return null
  }
}

function renderGraphFeature(
  feature: InformationalGraphFeature,
  caption: InformationalCaptionFeature | undefined,
  _onOpenWordSupport: InformationalTextCardProps['onOpenWordSupport'],
  _visibleWordSupport: boolean,
) {
  const maxValue = Math.max(...feature.dataPoints.map((point) => point.value), 1)

  return (
    <figure key={feature.featureId} className="informational-figure informational-graph" aria-labelledby={`${feature.featureId}-title`}>
      <h4 id={`${feature.featureId}-title`}>{feature.title}</h4>
      <div className="informational-graph-bars" aria-label={`${feature.title} chart`}>
        {feature.dataPoints.map((point) => (
          <div key={point.dataPointId} className="informational-graph-row">
            <span className="informational-graph-label">{point.label}</span>
            <div className="informational-graph-bar-track" aria-hidden="true">
              <div className="informational-graph-bar" style={{ width: `${(point.value / maxValue) * 100}%` }} />
            </div>
            <span className="informational-graph-value">
              {point.value}
              {point.unitText ? ` ${point.unitText}` : ''}
            </span>
          </div>
        ))}
      </div>
      <table className="informational-data-table">
        <caption className="sr-only">{feature.title} data table</caption>
        <thead>
          <tr>
            <th scope="col">Label</th>
            <th scope="col">{feature.valueLabel}</th>
          </tr>
        </thead>
        <tbody>
          {feature.dataPoints.map((point) => (
            <tr key={point.dataPointId}>
              <th scope="row">{point.label}</th>
              <td>
                {point.value}
                {point.unitText ? ` ${point.unitText}` : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {caption && <figcaption>{caption.text}</figcaption>}
    </figure>
  )
}

function renderMapFeature(feature: InformationalMapFeature, caption: InformationalCaptionFeature | undefined) {
  return (
    <figure key={feature.featureId} className="informational-figure informational-map" aria-labelledby={`${feature.featureId}-title`}>
      <h4 id={`${feature.featureId}-title`}>{feature.title}</h4>
      <div
        className="informational-map-grid"
        role="img"
        aria-label={`${feature.title} map`}
        style={{
          display: 'grid',
          gridTemplateRows: `repeat(${feature.rows}, minmax(2rem, 1fr))`,
          gridTemplateColumns: `repeat(${feature.columns}, minmax(3rem, 1fr))`,
        }}
      >
        {feature.locations.map((location) => (
          <div
            key={location.locationId}
            className="informational-map-location"
            style={{
              gridRowStart: location.position ? location.position.row : undefined,
              gridColumnStart: location.position ? location.position.column : undefined,
              order: location.order,
            }}
          >
            <strong>{location.label}</strong>
            <span>{location.description}</span>
          </div>
        ))}
      </div>
      <ol className="informational-map-locations">
        {feature.locations.map((location) => (
          <li key={location.locationId}>
            <strong>{location.label}</strong>
            <span>{location.description}</span>
          </li>
        ))}
      </ol>
      <ul className="informational-map-legend">
        {feature.legendEntries.map((entry) => (
          <li key={entry.legendId}>
            <strong>{entry.label}</strong>
            <span>{entry.description}</span>
          </li>
        ))}
      </ul>
      {(feature.connections ?? []).length > 0 && (
        <ul className="informational-map-connections">
          {(feature.connections ?? []).map((connection) => (
            <li key={`${connection.fromLocationId}-${connection.toLocationId}`}>
              {connection.label}
            </li>
          ))}
        </ul>
      )}
      {caption && <figcaption>{caption.text}</figcaption>}
    </figure>
  )
}

function renderGlossaryFeature(feature: InformationalGlossaryFeature) {
  return (
    <section key={feature.featureId} className="informational-glossary" aria-labelledby={`${feature.featureId}-title`}>
      <h4 id={`${feature.featureId}-title`}>Glossary</h4>
      <dl>
        {feature.entries.map((entry) => (
          <div key={entry.entryId}>
            <dt>{entry.term}</dt>
            <dd>{entry.definition}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function renderIllustrationFeature(feature: InformationalIllustrationFeature, caption: InformationalCaptionFeature | undefined) {
  return (
    <figure key={feature.featureId} className="informational-figure informational-illustration" aria-labelledby={`${feature.featureId}-title`}>
      <h4 id={`${feature.featureId}-title`}>{feature.title}</h4>
      <p>{feature.accessibleDescription}</p>
      <ul className="informational-illustration-labels">
        {feature.labels.map((label) => (
          <li key={label.labelId}>
            <strong>{label.text}</strong>
            <span>{label.description}</span>
          </li>
        ))}
      </ul>
      {caption && <figcaption>{caption.text}</figcaption>}
    </figure>
  )
}

export { InformationalTextCard }
export const MemoizedInformationalTextCard = memo(InformationalTextCard)
