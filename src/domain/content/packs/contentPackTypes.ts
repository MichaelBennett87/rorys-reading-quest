import type { ContentReviewStatus, GradeBand, Passage, ReadingQuestion } from '../types'
import type { LessonPurpose } from '../../lesson'
import type { FluencyPracticeBlock, LessonRole, TeachingBlock } from '../../lesson/lessonTypes'

export interface ThemeGuide {
  passageId: string
  topicLabel: string
  bestSupportedTheme: string
  supportingSentenceIds: string[]
  characterActionSentenceIds: string[]
  importantEventSentenceIds: string[]
  outcomeSentenceId: string
  topicDistractor: string
  summaryDistractor: string
  reviewStatus: ContentReviewStatus
  contentVersion: string
}

export interface PerspectiveGuideCharacter {
  characterId: string
  characterName: string
  perspectiveStatement: string
  supportingSentenceIds: string[]
  wordsSentenceIds: string[]
  actionSentenceIds: string[]
  feelingSentenceIds: string[]
  choiceSentenceIds: string[]
}

export interface PerspectiveGuide {
  passageId: string
  sharedSituation: string
  characters: PerspectiveGuideCharacter[]
  contrastSummary: string
  narratorPointOfViewExcluded: true
  reviewStatus: ContentReviewStatus
  contentVersion: string
}

export interface RhymeSchemeLineGuide {
  lineId: string
  endWord: string
  rhymeKey: string
  rhymeLabel: string
}

export interface RhymeSchemeGuide {
  passageId: string
  scheme: string
  lines: RhymeSchemeLineGuide[]
  reviewStatus: ContentReviewStatus
  contentVersion: string
}

export type Grade3PoemForm = 'free-verse' | 'rhymed-verse' | 'haiku' | 'limerick'

export type PoemFormFeatureKind =
  | 'line-count'
  | 'stanza-structure'
  | 'rhyme'
  | 'rhyme-pattern'
  | 'syllable-pattern'
  | 'free-lineation'
  | 'nature-observation'
  | 'playful-tone'

export interface PoemFormFeature {
  featureId: string
  kind: PoemFormFeatureKind
  statement: string
  evidenceLineIds: string[]
}

export interface PoemFormGuide {
  poemId: string
  form: Grade3PoemForm
  lineCount: number
  stanzaCount: number
  definingFeatures: PoemFormFeature[]
  nonDefiningFeatures: string[]
  rhymeScheme?: string
  rhymeLines?: RhymeSchemeLineGuide[]
  classroomSyllablePattern?: number[]
  formExplanation: string
  comparisonNotes: string
  reviewStatus: ContentReviewStatus
  contentVersion: string
}

export interface TextFeatureContribution {
  featureId: string
  featureKind: 'title' | 'heading' | 'caption' | 'graph' | 'map' | 'glossary' | 'illustration'
  contributionStatement: string
  relatedSentenceIds: string[]
}

export interface TextFeatureGuide {
  passageId: string
  featureContributions: TextFeatureContribution[]
  combinedFeatureExplanation: string
  reviewStatus: ContentReviewStatus
  contentVersion: string
}

export type Grade3InformationalStructure = 'chronology' | 'comparison' | 'cause-effect'

export type Grade3InformationalFeatureKind =
  | 'title'
  | 'heading'
  | 'caption'
  | 'graph'
  | 'map'
  | 'glossary'
  | 'illustration'
  | 'timeline'
  | 'sidebar'

export interface InformationalFeatureContribution {
  featureId: string
  featureKind: Grade3InformationalFeatureKind
  contributionStatement: string
  evidenceIds: string[]
}

export interface InformationalStructureEvidence {
  evidenceId: string
  structure: Grade3InformationalStructure
  evidenceIds: string[]
  explanation: string
}

export interface InformationalStructureGuide {
  passageId: string
  primaryStructure: Grade3InformationalStructure
  featureContributions: InformationalFeatureContribution[]
  structureEvidence: InformationalStructureEvidence[]
  organizationalSummary: string
  reviewStatus: ContentReviewStatus
  contentVersion: string
}

export type CentralIdeaMode = 'stated' | 'inferred'

export interface CentralIdeaDetail {
  detailId: string
  evidenceIds: string[]
  contributionStatement: string
  sectionId: string
  relevant: boolean
}

export interface CentralIdeaSectionSupport {
  sectionId: string
  contributionStatement: string
  evidenceIds: string[]
}

export interface CentralIdeaGuide {
  passageId: string
  topicLabel: string
  centralIdeaStatement: string
  centralIdeaMode: CentralIdeaMode
  explicitCentralIdeaSentenceId?: string
  relevantEvidenceIds: string[]
  otherEvidenceIds: string[]
  relevantDetails?: CentralIdeaDetail[]
  irrelevantOrMinorDetails?: CentralIdeaDetail[]
  sectionSupport?: CentralIdeaSectionSupport[]
  synthesisStatement?: string
  reviewStatus: ContentReviewStatus
  contentVersion: string
}

export type InformationalPurposeKind =
  | 'explain-how'
  | 'describe'
  | 'teach-about'
  | 'explain-process'
  | 'explain-why'
  | 'provide-facts'

export interface AuthorPurposeGuide {
  passageId: string
  topicLabel: string
  purposeKind: InformationalPurposeKind
  specificPurposeStatement: string
  purposeEvidenceIds: string[]
  secondaryDetailIds: string[]
  reviewStatus: ContentReviewStatus
  contentVersion: string
}

export interface AuthorOpinionRecord {
  opinionId: string
  opinionStatement: string
  opinionSentenceId: string
  supportingEvidenceIds: string[]
  evidenceConnectionStatement: string
}

export interface AuthorOpinionGuide {
  passageId: string
  topicLabel: string
  opinions: AuthorOpinionRecord[]
  factEvidenceIds: string[]
  otherDetailIds: string[]
  reviewStatus: ContentReviewStatus
  contentVersion: string
}

export interface AcademicVocabularyTarget {
  targetId: string
  word: string
  childFriendlyMeaning: string
  speakingExample: string
  writingExample: string
  appropriateUseSentenceIds: string[]
  subjectContexts: string[]
}

export interface AcademicVocabularyGuide {
  passageId: string
  targets: AcademicVocabularyTarget[]
  reviewStatus: ContentReviewStatus
  contentVersion: string
}

export type MorphologyAffixKind = 'prefix' | 'suffix'

export interface MorphologyAffixAnalysis {
  affixId: string
  kind: MorphologyAffixKind
  surfaceForm: string
  displayLabel: string
  commonMeaning: string
}

export interface MorphologyTarget {
  targetId: string
  surfaceWord: string
  sentenceId: string
  baseWord: string
  baseMeaning: string
  affixes: [MorphologyAffixAnalysis]
  composedMeaning: string
  transparentComposition: true
}

export interface MorphologyGuide {
  passageId: string
  targets: MorphologyTarget[]
  reviewStatus: ContentReviewStatus
  contentVersion: string
}

export type ClassicalPartOrigin = 'Greek' | 'Latin' | 'Greek/Latin'

export type ClassicalPartKind = 'root' | 'prefix' | 'combining-form'

export interface ClassicalWordPart {
  partId: string
  surfaceForm: string
  displayLabel: string
  origin: ClassicalPartOrigin
  kind: ClassicalPartKind
  commonMeaning: string
}

export interface RootMorphologicalChunk {
  text: string
  role: 'root' | 'prefix' | 'suffix' | 'connector' | 'other'
  partId?: string
}

export interface RootSyllableChunk {
  displayText: string
  speechText: string
}

export interface RootDecodingTarget {
  targetId: string
  surfaceWord: string
  sentenceId: string
  primaryPart: ClassicalWordPart
  additionalParts: ClassicalWordPart[]
  morphologicalChunks: RootMorphologicalChunk[]
  syllableChunks: RootSyllableChunk[]
  decodingStatement: string
  meaningSupportStatement: string
}

export interface RootDecodingGuide {
  passageId: string
  targets: RootDecodingTarget[]
  reviewStatus: ContentReviewStatus
  contentVersion: string
}

export type DerivationalWordRole = 'noun' | 'verb' | 'adjective' | 'adverb'

export interface DerivationalMorphologicalChunk {
  text: string
  role: 'base' | 'suffix'
}

export interface DerivationalSuffixTarget {
  targetId: string
  sentenceId: string
  baseWord: string
  derivedWord: string
  suffix: string
  baseWordRole: DerivationalWordRole
  derivedWordRole: DerivationalWordRole
  morphologicalChunks: DerivationalMorphologicalChunk[]
  readingChunks: RootSyllableChunk[]
  transformationExplanation: string
}

export interface DerivationalSuffixGuide {
  passageId: string
  targets: DerivationalSuffixTarget[]
  reviewStatus: ContentReviewStatus
  contentVersion: string
}

export type MultisyllablePatternLabel =
  | 'closed'
  | 'open'
  | 'vowel-consonant-e'
  | 'vowel-team'
  | 'r-controlled'
  | 'consonant-le'

export type MultisyllableMorphologicalHintKind =
  | 'compound-part'
  | 'prefix'
  | 'base'
  | 'suffix'

export interface MultisyllableMorphologicalHint {
  text: string
  kind: MultisyllableMorphologicalHintKind
}

export interface MultisyllableDecodingTarget {
  targetId: string
  surfaceWord: string
  sourceSentenceId: string
  syllableCount: number
  pronunciationChunks: RootSyllableChunk[]
  syllablePatterns: MultisyllablePatternLabel[]
  morphologicalHints: MultisyllableMorphologicalHint[]
  decodingSteps: string[]
  wholeWordSpeechText: string
  reviewStatus: ContentReviewStatus
  contentVersion: string
}

export interface MultisyllableDecodingGuide {
  passageId: string
  targets: MultisyllableDecodingTarget[]
  reviewStatus: ContentReviewStatus
  contentVersion: string
}

export type CharacterDevelopmentStageKind = 'beginning' | 'middle' | 'end'

export type CharacterDevelopmentEvidenceKind =
  | 'action'
  | 'dialogue'
  | 'thought'
  | 'feeling'
  | 'choice'
  | 'response-to-event'

export interface CharacterDevelopmentStage {
  stageId: string
  stage: CharacterDevelopmentStageKind
  stateStatement: string
  plotEventStatement: string
  evidenceIds: string[]
  evidenceKinds: CharacterDevelopmentEvidenceKind[]
}

export type CharacterDevelopmentKind =
  | 'learns'
  | 'changes-strategy'
  | 'builds-confidence'
  | 'becomes-more-responsible'
  | 'becomes-more-cooperative'
  | 'persists-after-setback'
  | 'reconsiders-a-choice'

export interface CharacterDevelopmentArc {
  characterId: string
  characterName: string
  developmentKind: CharacterDevelopmentKind
  stages: [CharacterDevelopmentStage, CharacterDevelopmentStage, CharacterDevelopmentStage]
  turningPointEvidenceIds: string[]
  plotCauseStatement: string
  developmentSummary: string
}

export interface CharacterDevelopmentGuide {
  passageId: string
  arcs: CharacterDevelopmentArc[]
  importantPlotEvidenceIds: string[]
  reviewStatus: ContentReviewStatus
  contentVersion: string
}

export type ThemeDevelopmentStageKind = 'beginning' | 'middle' | 'end'

export interface ThemeDevelopmentStage {
  stageId: string
  stage: ThemeDevelopmentStageKind
  evidenceIds: string[]
  developmentStatement: string
}

export type ThemeCandidateKind =
  | 'theme'
  | 'topic'
  | 'summary'
  | 'unsupported-theme'
  | 'moral-command'

export interface ThemeCandidate {
  themeId: string
  statement: string
  candidateKind: ThemeCandidateKind
  supported: boolean
  supportReason: string
}

export interface ThemeDevelopmentGuide {
  passageId: string
  topicLabel: string
  supportedTheme: ThemeCandidate
  plausibleDistractorThemes: ThemeCandidate[]
  stages: [ThemeDevelopmentStage, ThemeDevelopmentStage, ThemeDevelopmentStage]
  turningPointEvidenceIds: string[]
  characterConnectionStatement: string
  conflictConnectionStatement: string
  developmentSummary: string
  reviewStatus: ContentReviewStatus
  contentVersion: string
}

export type PerspectiveEvidenceKind =
  | 'dialogue'
  | 'thought'
  | 'action'
  | 'feeling'
  | 'noticing'
  | 'choice'

export interface CharacterPerspectiveState {
  characterId: string
  characterName: string
  situationId: string
  perspectiveStatement: string
  evidenceIds: string[]
  evidenceKinds: PerspectiveEvidenceKind[]
  motivationStatement: string
}

export interface PerspectiveComparison {
  comparisonId: string
  characterAId: string
  characterBId: string
  situationId: string
  relationship: 'different' | 'similar' | 'partly-similar'
  comparisonStatement: string
  characterAEvidenceIds: string[]
  characterBEvidenceIds: string[]
}

export interface PerspectiveChange {
  characterId: string
  earlierPerspectiveStatement: string
  laterPerspectiveStatement: string
  changeEvidenceIds: string[]
  causeStatement: string
}

export interface CharacterPerspectiveGuide {
  passageId: string
  characters: CharacterPerspectiveState[]
  comparisons: PerspectiveComparison[]
  perspectiveChanges: PerspectiveChange[]
  importantEvidenceIds: string[]
  reviewStatus: ContentReviewStatus
  contentVersion: string
}

export type MeaningClueStrategyKind =
  | 'context-clue'
  | 'word-relationship'
  | 'reference-material'
  | 'background-knowledge'

export type ContextClueKind =
  | 'definition'
  | 'restatement'
  | 'example'
  | 'contrast'
  | 'cause-effect'

export type WordRelationshipKind =
  | 'synonym'
  | 'antonym'
  | 'category-member'
  | 'part-whole'
  | 'object-function'

export interface MeaningClueTarget {
  targetId: string
  word: string
  sentenceId: string
  childFriendlyMeaning: string
  primaryStrategy: MeaningClueStrategyKind
  clueEvidenceIds: string[]
  strategyExplanation: string
  contextClueKind?: ContextClueKind
  relationshipKind?: WordRelationshipKind
  relatedWords?: string[]
  glossaryEntryId?: string
  backgroundKnowledgeStatement?: string
}

export interface MeaningClueGuide {
  passageId: string
  targets: MeaningClueTarget[]
  reviewStatus: ContentReviewStatus
  contentVersion: string
}

export type WordplayKind = 'simile' | 'idiom' | 'alliteration'

export interface WordplayTargetBase {
  targetId: string
  kind: WordplayKind
  expressionText: string
  sentenceId: string
  evidenceReferenceIds: string[]
  explanationStatement: string
}

export interface SimileWordplayTarget extends WordplayTargetBase {
  kind: 'simile'
  signalWord: 'like' | 'as'
  comparisonSubject: string
  comparisonObject: string
  sharedQuality: string
  figurativeComparison: true
}

export interface IdiomWordplayTarget extends WordplayTargetBase {
  kind: 'idiom'
  intendedMeaning: string
  literalReading: string
  contextEvidenceIds: string[]
  nonliteral: true
}

export interface AlliterativeWord {
  word: string
  initialSound: string
}

export interface AlliterationWordplayTarget extends WordplayTargetBase {
  kind: 'alliteration'
  alliterativeWords: AlliterativeWord[]
  repeatedInitialSound: string
  soundExplanation: string
}

export type WordplayTarget =
  | SimileWordplayTarget
  | IdiomWordplayTarget
  | AlliterationWordplayTarget

export interface WordplayGuide {
  passageId: string
  targets: WordplayTarget[]
  reviewStatus: ContentReviewStatus
  contentVersion: string
}

export type RetellTextKind = 'literary' | 'informational'

export interface RetellPiece {
  pieceId: string
  text: string
  sequenceIndex: number
  role: string
  evidenceReferenceIds: string[]
}

export interface LiteraryRetellGuide {
  passageId: string
  textKind: 'literary'
  mainCharacters: string[]
  settingStatement: string
  problemStatement: string
  importantEventStatements: string[]
  resolutionStatement: string
  retellPieces: RetellPiece[]
  minorDetailIds: string[]
  reviewStatus: ContentReviewStatus
  contentVersion: string
}

export interface InformationalRetellGuide {
  passageId: string
  textKind: 'informational'
  topicLabel: string
  centralIdeaStatement: string
  relevantDetailStatements: string[]
  retellPieces: RetellPiece[]
  otherTrueDetailIds: string[]
  reviewStatus: ContentReviewStatus
  contentVersion: string
}

export type RetellGuide = LiteraryRetellGuide | InformationalRetellGuide

export type PairedTextRelationshipKind = 'same-topic' | 'same-theme'

export type PairedTextMemberFormat = 'literary-prose' | 'literary-poem' | 'informational'

export interface PairedTextMember {
  passageId: string
  label: 'Text 1' | 'Text 2'
  displayTitle: string
  format: PairedTextMemberFormat
}

export interface PairedTextSet {
  pairId: string
  pairTitle: string
  relationshipKind: PairedTextRelationshipKind
  members: [PairedTextMember, PairedTextMember]
  formatRelationship: 'same-format' | 'different-format'
  reviewStatus: ContentReviewStatus
  contentVersion: string
}

export type ComparisonDimension =
  | 'character'
  | 'setting'
  | 'event-sequence'
  | 'central-idea'
  | 'important-detail'
  | 'process'

export interface PairedTextComparisonPoint {
  pointId: string
  dimension: ComparisonDimension
  statement: string
  text1EvidenceIds: string[]
  text2EvidenceIds: string[]
  importanceExplanation: string
}

export interface PairedTextComparisonGuide {
  pairId: string
  relationshipKind: PairedTextRelationshipKind
  sharedTopicOrThemeStatement: string
  importantSimilarities: PairedTextComparisonPoint[]
  importantDifferences: PairedTextComparisonPoint[]
  text1OtherDetailIds: string[]
  text2OtherDetailIds: string[]
  reviewStatus: ContentReviewStatus
  contentVersion: string
}

export interface ContentPackManifest {
  packId: string
  packTitle: string
  gradeBand: GradeBand
  worldId: string
  unitId: string
  primarySkillId: string
  benchmarkReferences: string[]
  supportingBenchmarkReferences?: string[]
  coverageKind?: 'benchmark' | 'supportive_practice'
  partialBenchmarkCoverage: string
  difficultyRange: [number, number]
  contentVersion: string
  reviewStatus: ContentReviewStatus
  coveredPatterns: string[]
  coveredSupportComponents?: string[]
  passageIds: string[]
  questionIds: string[]
  lessonIds: string[]
}

export interface ContentPackLesson {
  lessonId: string
  worldId: string
  unitId: string
  activityId: string
  difficulty: number
  passageIdentifiers: string[]
  pairedTextSetId?: string
  questionIdentifiers: string[]
  lessonTitle: string
  lessonObjective: string
  lessonRole: LessonRole
  selectionStatus: 'active' | 'legacy'
  teachingBlock?: TeachingBlock
  fluencyPracticeBlock?: FluencyPracticeBlock
  contentVersion: string
  eligiblePurposes: LessonPurpose[]
}

export interface ContentPack {
  manifest: ContentPackManifest
  passages: Passage[]
  questions: ReadingQuestion[]
  lessons: ContentPackLesson[]
  textFeatureGuides?: TextFeatureGuide[]
  informationalStructureGuides?: InformationalStructureGuide[]
  centralIdeaGuides?: CentralIdeaGuide[]
  authorPurposeGuides?: AuthorPurposeGuide[]
  authorOpinionGuides?: AuthorOpinionGuide[]
  academicVocabularyGuides?: AcademicVocabularyGuide[]
  morphologyGuides?: MorphologyGuide[]
  rootDecodingGuides?: RootDecodingGuide[]
  derivationalSuffixGuides?: DerivationalSuffixGuide[]
  multisyllableDecodingGuides?: MultisyllableDecodingGuide[]
  characterDevelopmentGuides?: CharacterDevelopmentGuide[]
  themeDevelopmentGuides?: ThemeDevelopmentGuide[]
  characterPerspectiveGuides?: CharacterPerspectiveGuide[]
  meaningClueGuides?: MeaningClueGuide[]
  wordplayGuides?: WordplayGuide[]
  retellGuides?: RetellGuide[]
  pairedTextSets?: PairedTextSet[]
  pairedTextComparisonGuides?: PairedTextComparisonGuide[]
  themeGuides?: ThemeGuide[]
  perspectiveGuides?: PerspectiveGuide[]
  rhymeSchemeGuides?: RhymeSchemeGuide[]
  poemFormGuides?: PoemFormGuide[]
}

export interface ContentPackAuditIssue {
  code:
  | 'missing_manifest_field'
  | 'duplicate_pack_id'
  | 'missing_supporting_benchmark_mapping'
  | 'lesson_count_mismatch'
  | 'passage_count_mismatch'
  | 'duplicate_lesson_id'
    | 'duplicate_lesson_activity_id'
    | 'duplicate_passage_id'
    | 'duplicate_question_id'
    | 'missing_benchmark_mapping'
    | 'wrong_grade_band'
    | 'wrong_primary_skill'
    | 'mixed_difficulty_within_lesson'
    | 'missing_lesson_role'
    | 'guided_lesson_without_teaching_block'
    | 'checkpoint_lesson_with_teaching_block'
    | 'insufficient_progression_variants'
    | 'insufficient_guided_remediation_variants'
    | 'insufficient_lower_difficulty_variants'
    | 'repeated_active_passage'
    | 'question_count_mismatch'
    | 'lesson_referencing_missing_content'
    | 'lesson_with_no_eligible_purpose'
    | 'active_legacy_content_selected'
    | 'missing_explanation'
    | 'missing_evidence_reference'
    | 'unsupported_question_payload'
    | 'missing_draft_status'
    | 'mismatched_content_version'
    | 'missing_target_pattern_coverage'
    | 'support_target_count_mismatch'
    | 'support_target_structure_invalid'
    | 'forbidden_silent_e_target'
    | 'lesson_with_invalid_eligible_purpose'
    | 'duplicate_prompt_in_lesson'
    | 'duplicate_visible_choice_text'
    | 'missing_support_sentence'
    | 'correct_answer_absent'
    | 'correct_answer_position_concentration'
    | 'ambiguous_forbidden_homograph'
     | 'missing_theme_guide'
     | 'theme_guide_count_mismatch'
     | 'theme_guide_structure_invalid'
     | 'missing_text_feature_guide'
     | 'text_feature_guide_count_mismatch'
     | 'text_feature_guide_invalid'
   | 'missing_central_idea_guide'
   | 'central_idea_guide_count_mismatch'
   | 'central_idea_guide_invalid'
   | 'missing_author_purpose_guide'
   | 'author_purpose_guide_count_mismatch'
   | 'author_purpose_guide_invalid'
   | 'missing_author_opinion_guide'
   | 'author_opinion_guide_count_mismatch'
   | 'author_opinion_guide_invalid'
   | 'missing_academic_vocabulary_guide'
   | 'academic_vocabulary_guide_count_mismatch'
   | 'academic_vocabulary_guide_invalid'
   | 'missing_morphology_guide'
   | 'morphology_guide_count_mismatch'
     | 'morphology_guide_invalid'
     | 'missing_root_decoding_guide'
     | 'root_decoding_guide_count_mismatch'
     | 'root_decoding_guide_invalid'
     | 'missing_derivational_suffix_guide'
     | 'derivational_suffix_guide_count_mismatch'
     | 'derivational_suffix_guide_invalid'
     | 'missing_multisyllable_decoding_guide'
     | 'multisyllable_decoding_guide_count_mismatch'
     | 'multisyllable_decoding_guide_invalid'
     | 'missing_character_development_guide'
     | 'character_development_guide_count_mismatch'
     | 'character_development_guide_invalid'
     | 'missing_theme_development_guide'
     | 'theme_development_guide_count_mismatch'
     | 'theme_development_guide_invalid'
     | 'ambiguous_supported_theme'
     | 'theme_is_topic_only'
     | 'theme_is_summary_only'
     | 'missing_character_perspective_guide'
     | 'character_perspective_guide_count_mismatch'
     | 'character_perspective_guide_invalid'
   | 'missing_meaning_clue_guide'
   | 'meaning_clue_guide_count_mismatch'
   | 'meaning_clue_guide_invalid'
     | 'missing_wordplay_guide'
     | 'wordplay_guide_count_mismatch'
     | 'wordplay_guide_invalid'
     | 'missing_retell_guide'
     | 'retell_guide_count_mismatch'
     | 'retell_guide_invalid'
     | 'retell_builder_invalid'
     | 'missing_paired_text_set'
     | 'paired_text_set_count_mismatch'
     | 'paired_text_set_invalid'
     | 'missing_paired_text_comparison_guide'
     | 'paired_text_comparison_guide_count_mismatch'
     | 'paired_text_comparison_guide_invalid'
   | 'invalid_evidence_reference'
   | 'invalid_author_opinion_feature_reference'
   | 'invalid_informational_feature_reference'
   | 'missing_perspective_guide'
   | 'perspective_guide_count_mismatch'
  | 'perspective_guide_structure_invalid'
  | 'missing_poem_structure'
  | 'poem_structure_invalid'
  | 'missing_rhyme_scheme_guide'
  | 'rhyme_scheme_guide_count_mismatch'
  | 'rhyme_scheme_guide_invalid'
  | 'missing_poem_form_guide'
  | 'poem_form_guide_count_mismatch'
  | 'poem_form_guide_invalid'
  | 'missing_informational_structure_guide'
  | 'informational_structure_guide_count_mismatch'
  | 'informational_structure_guide_invalid'
  | 'ambiguous_informational_structure'
  message: string
  itemIdentifier: string
}
