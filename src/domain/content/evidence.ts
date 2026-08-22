import type { Passage } from './types'
import type {
  InformationalFeature,
  InformationalTextStructure,
} from './informationalTypes'

export interface PassageEvidenceEntry {
  evidenceId: string
  label: string
  text: string
}

export function resolvePassageEvidence(passage: Passage, evidenceId: string): PassageEvidenceEntry | null {
  return buildPassageEvidenceIndex(passage).get(evidenceId) ?? null
}

export function buildPassageEvidenceIndex(passage: Passage): ReadonlyMap<string, PassageEvidenceEntry> {
  const entries = new Map<string, PassageEvidenceEntry>()

  for (const sentence of passage.sentences ?? []) {
    entries.set(sentence.sentenceId, {
      evidenceId: sentence.sentenceId,
      label: passage.contentKind === 'poem' ? `Line ${sentence.lineNumber ?? 0}` : `Sentence ${sentence.lineNumber ?? 0}`,
      text: sentence.text,
    })
  }

  if (passage.contentKind === 'informational' && passage.informationalStructure) {
    for (const entry of collectInformationalEvidence(passage.informationalStructure)) {
      entries.set(entry.evidenceId, entry)
    }
  }

  return entries
}

function collectInformationalEvidence(structure: InformationalTextStructure): PassageEvidenceEntry[] {
  const entries: PassageEvidenceEntry[] = []
  const featureById = new Map(structure.features.map((feature) => [feature.featureId, feature] as const))

  for (const feature of structure.features) {
    entries.push(buildFeatureEvidence(feature))

    if (feature.kind === 'graph') {
      for (const dataPoint of feature.dataPoints) {
        entries.push({
          evidenceId: dataPoint.dataPointId,
          label: `Graph data point: ${dataPoint.label}`,
          text: dataPoint.unitText ? `${dataPoint.value} ${dataPoint.unitText}` : `${dataPoint.value}`,
        })
      }
    }

    if (feature.kind === 'map') {
      for (const location of feature.locations) {
        entries.push({
          evidenceId: location.locationId,
          label: `Map location: ${location.label}`,
          text: location.description,
        })
      }
      for (const legendEntry of feature.legendEntries) {
        entries.push({
          evidenceId: legendEntry.legendId,
          label: `Map legend: ${legendEntry.label}`,
          text: legendEntry.description,
        })
      }
    }

    if (feature.kind === 'glossary') {
      for (const glossaryEntry of feature.entries) {
        entries.push({
          evidenceId: glossaryEntry.entryId,
          label: `Glossary term: ${glossaryEntry.term}`,
          text: glossaryEntry.definition,
        })
      }
    }

    if (feature.kind === 'illustration') {
      for (const label of feature.labels) {
        entries.push({
          evidenceId: label.labelId,
          label: `Illustration label: ${label.text}`,
          text: label.description,
        })
      }
    }
  }

  for (const feature of structure.features) {
    if (feature.kind !== 'caption') continue
    const target = featureById.get(feature.targetFeatureId)
    if (!target) continue
    entries.push({
      evidenceId: feature.featureId,
      label: getCaptionLabel(target.kind),
      text: feature.text,
    })
  }

  return entries
}

function buildFeatureEvidence(feature: InformationalFeature): PassageEvidenceEntry {
  switch (feature.kind) {
    case 'title':
      return {
        evidenceId: feature.featureId,
        label: 'Title',
        text: feature.text,
      }
    case 'heading':
      return {
        evidenceId: feature.featureId,
        label: 'Heading',
        text: feature.text,
      }
    case 'caption':
      return {
        evidenceId: feature.featureId,
        label: 'Caption',
        text: feature.text,
      }
    case 'graph':
      return {
        evidenceId: feature.featureId,
        label: `Graph: ${feature.title}`,
        text: feature.valueLabel,
      }
    case 'map':
      return {
        evidenceId: feature.featureId,
        label: `Map: ${feature.title}`,
        text: feature.title,
      }
    case 'glossary':
      return {
        evidenceId: feature.featureId,
        label: 'Glossary',
        text: feature.entries.map((entry) => `${entry.term}: ${entry.definition}`).join(' | '),
      }
    case 'illustration':
      return {
        evidenceId: feature.featureId,
        label: `Illustration: ${feature.title}`,
        text: feature.accessibleDescription,
      }
  }
}

function getCaptionLabel(kind: InformationalFeature['kind']): string {
  switch (kind) {
    case 'graph':
      return 'Graph caption'
    case 'map':
      return 'Map caption'
    case 'illustration':
      return 'Illustration caption'
    default:
      return 'Caption'
  }
}

