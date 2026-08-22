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

export type CentralIdeaMode = 'stated' | 'inferred'

export interface CentralIdeaGuide {
  passageId: string
  topicLabel: string
  centralIdeaStatement: string
  centralIdeaMode: CentralIdeaMode
  explicitCentralIdeaSentenceId?: string
  relevantEvidenceIds: string[]
  otherEvidenceIds: string[]
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
  centralIdeaGuides?: CentralIdeaGuide[]
  authorPurposeGuides?: AuthorPurposeGuide[]
  themeGuides?: ThemeGuide[]
  perspectiveGuides?: PerspectiveGuide[]
  rhymeSchemeGuides?: RhymeSchemeGuide[]
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
   | 'invalid_informational_feature_reference'
   | 'missing_perspective_guide'
   | 'perspective_guide_count_mismatch'
  | 'perspective_guide_structure_invalid'
  | 'missing_poem_structure'
  | 'poem_structure_invalid'
  | 'missing_rhyme_scheme_guide'
  | 'rhyme_scheme_guide_count_mismatch'
  | 'rhyme_scheme_guide_invalid'
  message: string
  itemIdentifier: string
}
