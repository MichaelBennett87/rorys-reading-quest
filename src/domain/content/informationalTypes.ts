export type InformationalFeatureKind =
  | 'title'
  | 'heading'
  | 'caption'
  | 'graph'
  | 'map'
  | 'glossary'
  | 'illustration'

export interface InformationalTitleFeature {
  featureId: string
  kind: 'title'
  text: string
}

export interface InformationalHeadingFeature {
  featureId: string
  kind: 'heading'
  sectionId: string
  text: string
}

export interface InformationalCaptionFeature {
  featureId: string
  kind: 'caption'
  targetFeatureId: string
  text: string
}

export interface InformationalGraphDataPoint {
  dataPointId: string
  label: string
  value: number
  unitText?: string
}

export interface InformationalGraphFeature {
  featureId: string
  kind: 'graph'
  title: string
  valueLabel: string
  dataPoints: InformationalGraphDataPoint[]
}

export interface InformationalMapPosition {
  row: number
  column: number
}

export interface InformationalMapLocation {
  locationId: string
  label: string
  description: string
  position?: InformationalMapPosition
  order: number
}

export interface InformationalMapLegendEntry {
  legendId: string
  label: string
  description: string
}

export interface InformationalMapConnection {
  fromLocationId: string
  toLocationId: string
  label?: string
}

export interface InformationalMapFeature {
  featureId: string
  kind: 'map'
  title: string
  rows: number
  columns: number
  locations: InformationalMapLocation[]
  legendEntries: InformationalMapLegendEntry[]
  connections?: InformationalMapConnection[]
}

export interface InformationalGlossaryEntry {
  entryId: string
  term: string
  definition: string
}

export interface InformationalGlossaryFeature {
  featureId: string
  kind: 'glossary'
  entries: InformationalGlossaryEntry[]
}

export interface InformationalIllustrationLabel {
  labelId: string
  text: string
  description: string
}

export interface InformationalIllustrationFeature {
  featureId: string
  kind: 'illustration'
  title: string
  accessibleDescription: string
  labels: InformationalIllustrationLabel[]
}

export interface InformationalSection {
  sectionId: string
  headingFeatureId: string
  sentenceIds: string[]
  featureIds: string[]
}

export type InformationalFeature =
  | InformationalTitleFeature
  | InformationalHeadingFeature
  | InformationalCaptionFeature
  | InformationalGraphFeature
  | InformationalMapFeature
  | InformationalGlossaryFeature
  | InformationalIllustrationFeature

export interface InformationalTextStructure {
  titleFeatureId: string
  sections: InformationalSection[]
  features: InformationalFeature[]
}

