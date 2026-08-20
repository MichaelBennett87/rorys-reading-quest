import type { ContentReviewStatus, GradeBand, Passage, ReadingQuestion } from '../types'
import type { LessonPurpose } from '../../lesson'
import type { LessonRole, TeachingBlock } from '../../lesson/lessonTypes'

export interface ContentPackManifest {
  packId: string
  packTitle: string
  gradeBand: GradeBand
  worldId: string
  unitId: string
  primarySkillId: string
  benchmarkReferences: string[]
  partialBenchmarkCoverage: string
  difficultyRange: [number, number]
  contentVersion: string
  reviewStatus: ContentReviewStatus
  coveredPatterns: string[]
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
  contentVersion: string
  eligiblePurposes: LessonPurpose[]
}

export interface ContentPack {
  manifest: ContentPackManifest
  passages: Passage[]
  questions: ReadingQuestion[]
  lessons: ContentPackLesson[]
}

export interface ContentPackAuditIssue {
  code:
    | 'missing_manifest_field'
    | 'duplicate_pack_id'
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
    | 'lesson_with_invalid_eligible_purpose'
    | 'duplicate_prompt_in_lesson'
    | 'duplicate_visible_choice_text'
    | 'correct_answer_absent'
    | 'correct_answer_position_concentration'
    | 'ambiguous_forbidden_homograph'
  message: string
  itemIdentifier: string
}
