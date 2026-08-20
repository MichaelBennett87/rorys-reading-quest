import type { ContentPack, ContentPackAuditIssue } from './contentPackTypes'
import { collectObservedBenchmarkPatterns, getClaimedBenchmarkPatterns, getExpectedBenchmarkPatterns } from './benchmarkPatternCatalog'

export function buildContentPackAudit(packs: readonly ContentPack[]): ContentPackAuditIssue[] {
  const issues: ContentPackAuditIssue[] = []
  const packIds = new Set<string>()
  const seenLessonIds = new Set<string>()
  const seenPromptSignatures = new Set<string>()
  const activityIds = new Set<string>()
  const passageIds = new Set<string>()
  const questionIds = new Set<string>()
  const activeProgressionPassages = new Set<string>()
  let activeProgressionCount = 0
  let guidedCount = 0
  let lowerDifficultyCount = 0

  for (const pack of packs) {
    if (!pack.manifest.packId) pushIssue(issues, 'missing_manifest_field', 'manifest.packId', 'Pack ID is required.')
    if (!pack.manifest.packTitle) pushIssue(issues, 'missing_manifest_field', `manifest:${pack.manifest.packId}`, 'Pack title is required.')
    if (!pack.manifest.worldId) pushIssue(issues, 'missing_manifest_field', `manifest:${pack.manifest.packId}`, 'World ID is required.')
    if (!pack.manifest.unitId) pushIssue(issues, 'missing_manifest_field', `manifest:${pack.manifest.packId}`, 'Unit ID is required.')
    if (!pack.manifest.primarySkillId) pushIssue(issues, 'missing_manifest_field', `manifest:${pack.manifest.packId}`, 'Primary skill ID is required.')
    if (!pack.manifest.benchmarkReferences.length) pushIssue(issues, 'missing_benchmark_mapping', `manifest:${pack.manifest.packId}`, 'At least one benchmark reference is required.')
    if (!pack.manifest.partialBenchmarkCoverage) pushIssue(issues, 'missing_manifest_field', `manifest:${pack.manifest.packId}`, 'Partial benchmark coverage is required.')
    if (!pack.manifest.contentVersion) pushIssue(issues, 'missing_manifest_field', `manifest:${pack.manifest.packId}`, 'Content version is required.')
    if (!pack.manifest.reviewStatus) pushIssue(issues, 'missing_manifest_field', `manifest:${pack.manifest.packId}`, 'Review status is required.')
    if (!pack.manifest.passageIds.length) pushIssue(issues, 'missing_manifest_field', `manifest:${pack.manifest.packId}`, 'Passage IDs are required.')
    if (!pack.manifest.questionIds.length) pushIssue(issues, 'missing_manifest_field', `manifest:${pack.manifest.packId}`, 'Question IDs are required.')
    if (!pack.manifest.lessonIds.length) pushIssue(issues, 'missing_manifest_field', `manifest:${pack.manifest.packId}`, 'Lesson IDs are required.')
    if (packIds.has(pack.manifest.packId)) {
      pushIssue(issues, 'duplicate_pack_id', pack.manifest.packId, `Duplicate pack ID: ${pack.manifest.packId}`)
    } else {
      packIds.add(pack.manifest.packId)
    }

    if (pack.manifest.coveredPatterns.length === 0) {
      pushIssue(issues, 'missing_target_pattern_coverage', pack.manifest.packId, 'Each pack must declare at least one covered pattern.')
    }

    for (const benchmarkReference of pack.manifest.benchmarkReferences) {
      const expectedPatterns = getExpectedBenchmarkPatterns(benchmarkReference)
      if (expectedPatterns.length === 0) continue
      const claimedPatterns = getClaimedBenchmarkPatterns(pack, benchmarkReference)
      if (claimedPatterns.length > 0) {
        const observedPatterns = new Set(collectObservedBenchmarkPatterns(pack, benchmarkReference))
        const missingPatterns = claimedPatterns.filter((pattern) => !observedPatterns.has(pattern))
        if (missingPatterns.length > 0) {
          pushIssue(
            issues,
            'missing_target_pattern_coverage',
            pack.manifest.packId,
            `The pack must cover its claimed patterns: ${missingPatterns.join(', ')}.`,
          )
        }
      }
    }

    for (const passage of pack.passages) {
      if (passageIds.has(passage.passageIdentifier)) {
        pushIssue(issues, 'duplicate_passage_id', passage.passageIdentifier, `Duplicate passage ID: ${passage.passageIdentifier}`)
      } else {
        passageIds.add(passage.passageIdentifier)
      }
      if (passage.contentVersion !== pack.manifest.contentVersion) {
        pushIssue(issues, 'mismatched_content_version', passage.passageIdentifier, 'Passage content version must match pack version.')
      }
      if (passage.reviewStatus !== undefined && passage.reviewStatus !== 'DRAFT') {
        pushIssue(issues, 'missing_draft_status', passage.passageIdentifier, 'Passages in this pack must remain DRAFT.')
      }
      for (const target of passage.wordSupportTargets ?? []) {
        if (target.contentVersion !== pack.manifest.contentVersion) {
          pushIssue(issues, 'mismatched_content_version', target.targetId, 'Support target content version must match pack version.')
        }
        if (target.reviewStatus !== 'DRAFT') {
          pushIssue(issues, 'missing_draft_status', target.targetId, 'Support targets in this pack must remain DRAFT.')
        }
      }
    }

    for (const question of pack.questions) {
      if (questionIds.has(question.questionIdentifier)) {
        pushIssue(issues, 'duplicate_question_id', question.questionIdentifier, `Duplicate question ID: ${question.questionIdentifier}`)
      } else {
        questionIds.add(question.questionIdentifier)
      }
      if (question.contentVersion !== pack.manifest.contentVersion) {
        pushIssue(issues, 'mismatched_content_version', question.questionIdentifier, 'Question content version must match pack version.')
      }
      if (question.reviewStatus !== 'DRAFT') {
        pushIssue(issues, 'missing_draft_status', question.questionIdentifier, 'Questions in this pack must remain DRAFT.')
      }
      if (!question.explanation) {
        pushIssue(issues, 'missing_explanation', question.questionIdentifier, 'Every question needs an explanation.')
      }
      if (!question.evidenceReference || (question.evidenceReferenceIds?.length ?? 0) === 0) {
        pushIssue(issues, 'missing_evidence_reference', question.questionIdentifier, 'Every question needs a usable evidence reference.')
      }
      if (!question.questionContent) {
        pushIssue(issues, 'unsupported_question_payload', question.questionIdentifier, 'Question payload is missing.')
      }

      const promptSignature = `${question.lessonIdentifier ?? 'unknown'}::${question.prompt}`
      if (seenPromptSignatures.has(promptSignature)) {
        pushIssue(issues, 'duplicate_prompt_in_lesson', question.questionIdentifier, 'Duplicate prompt detected inside the lesson.')
      } else {
        seenPromptSignatures.add(promptSignature)
      }
    }

    for (const lesson of pack.lessons) {
      if (seenLessonIds.has(lesson.lessonId)) {
        pushIssue(issues, 'duplicate_lesson_id', lesson.lessonId, `Duplicate lesson ID: ${lesson.lessonId}`)
      } else {
        seenLessonIds.add(lesson.lessonId)
      }
      if (activityIds.has(lesson.activityId)) {
        pushIssue(issues, 'duplicate_lesson_activity_id', lesson.activityId, `Duplicate activity ID: ${lesson.activityId}`)
      } else {
        activityIds.add(lesson.activityId)
      }
      if (!lesson.lessonRole) {
        pushIssue(issues, 'missing_lesson_role', lesson.lessonId, 'Every lesson needs a lesson role.')
      }
      if (!lesson.eligiblePurposes.length) {
        pushIssue(issues, 'lesson_with_no_eligible_purpose', lesson.lessonId, 'Every lesson needs at least one eligible purpose.')
      }
      if (lesson.selectionStatus === 'legacy' && lesson.eligiblePurposes.includes('progression')) {
        pushIssue(issues, 'active_legacy_content_selected', lesson.lessonId, 'Legacy content must not be selected for fresh progression.')
      }
      if (lesson.lessonRole === 'GUIDED_PRACTICE' && !lesson.teachingBlock) {
        pushIssue(issues, 'guided_lesson_without_teaching_block', lesson.lessonId, 'Guided lessons require a teaching block.')
      }
      if (lesson.lessonRole === 'CHECKPOINT' && lesson.teachingBlock) {
        pushIssue(issues, 'checkpoint_lesson_with_teaching_block', lesson.lessonId, 'Checkpoint lessons must not include a teaching block.')
      }
      if (
        lesson.selectionStatus === 'active'
        && lesson.lessonRole === 'GUIDED_PRACTICE'
        && lesson.eligiblePurposes.some((purpose) => purpose === 'progression' || purpose === 'verification')
      ) {
        pushIssue(issues, 'lesson_with_invalid_eligible_purpose', lesson.lessonId, 'Guided lessons may only be used for remediation or review.')
      }
      if (lesson.selectionStatus === 'active' && lesson.lessonRole === 'CHECKPOINT' && lesson.eligiblePurposes.includes('remediation')) {
        pushIssue(issues, 'lesson_with_invalid_eligible_purpose', lesson.lessonId, 'Checkpoint lessons may not be used for remediation.')
      }
      if (lesson.contentVersion !== pack.manifest.contentVersion) {
        pushIssue(issues, 'mismatched_content_version', lesson.lessonId, 'Lesson content version must match pack version.')
      }
      if (!pack.manifest.lessonIds.includes(lesson.lessonId)) {
        pushIssue(issues, 'lesson_referencing_missing_content', lesson.lessonId, 'Lesson is not listed in the pack manifest.')
      }

      const lessonQuestions = pack.questions.filter((question) => question.lessonIdentifier === lesson.lessonId)
      const uniqueDifficulty = new Set(lessonQuestions.map((question) => question.difficulty))
      if (uniqueDifficulty.size > 1) {
        pushIssue(issues, 'mixed_difficulty_within_lesson', lesson.lessonId, 'Lessons must not mix difficulties.')
      }
      if (lessonQuestions.length !== lesson.questionIdentifiers.length) {
        pushIssue(issues, 'question_count_mismatch', lesson.lessonId, 'Question count does not match the lesson manifest.')
      }
      if (lesson.selectionStatus === 'active' && lesson.lessonRole === 'CHECKPOINT' && lesson.eligiblePurposes.includes('progression')) {
        activeProgressionCount += 1
        activeProgressionPassages.add(lesson.passageIdentifiers[0] ?? '')
      }
      if (lesson.selectionStatus === 'active' && lesson.lessonRole === 'GUIDED_PRACTICE') {
        guidedCount += 1
        if (lesson.difficulty === 0) {
          lowerDifficultyCount += 1
        }
      }
    }
  }

  if (activeProgressionCount < 3) {
    pushIssue(issues, 'insufficient_progression_variants', 'content-pack', 'At least three active checkpoint lessons are required.')
  }
  if (guidedCount < 4) {
    pushIssue(issues, 'insufficient_guided_remediation_variants', 'content-pack', 'At least four guided remediation lessons are required.')
  }
  if (lowerDifficultyCount < 2) {
    pushIssue(issues, 'insufficient_lower_difficulty_variants', 'content-pack', 'At least two difficulty-0 guided lessons are required.')
  }
  if (activeProgressionPassages.size < 3) {
    pushIssue(issues, 'repeated_active_passage', 'content-pack', 'Checkpoint lessons should use distinct active passages.')
  }

  validateBridgePackStructure(packs, issues)

  return issues
}

function pushIssue(
  issues: ContentPackAuditIssue[],
  code: ContentPackAuditIssue['code'],
  itemIdentifier: string,
  message: string,
) {
  issues.push({ code, itemIdentifier, message })
}

function validateBridgePackStructure(packs: readonly ContentPack[], issues: ContentPackAuditIssue[]) {
  for (const pack of packs) {
    if (!pack.manifest.benchmarkReferences.some((benchmark) => benchmark === 'ELA.2.F.1.3b' || benchmark === 'ELA.2.F.1.3c')) continue

    const activeLessons = pack.lessons.filter((lesson) => lesson.selectionStatus === 'active')
    const guidedLessons = activeLessons.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE')
    const checkpointLessons = activeLessons.filter((lesson) => lesson.lessonRole === 'CHECKPOINT')
    const minDifficulty = pack.manifest.difficultyRange[0]
    const maxDifficulty = pack.manifest.difficultyRange[1]

    if (activeLessons.length !== 7) {
      pushIssue(issues, 'lesson_count_mismatch', pack.manifest.packId, `Expected 7 active lessons, found ${activeLessons.length}.`)
    }
    if (pack.passages.length !== 7) {
      pushIssue(issues, 'passage_count_mismatch', pack.manifest.packId, `Expected 7 passages, found ${pack.passages.length}.`)
    }
    if (pack.questions.length !== 41) {
      pushIssue(issues, 'question_count_mismatch', pack.manifest.packId, `Expected 41 questions, found ${pack.questions.length}.`)
    }
    if (guidedLessons.length !== 4) {
      pushIssue(issues, 'lesson_count_mismatch', pack.manifest.packId, `Expected 4 active guided lessons, found ${guidedLessons.length}.`)
    }
    if (checkpointLessons.length !== 3) {
      pushIssue(issues, 'lesson_count_mismatch', pack.manifest.packId, `Expected 3 active checkpoint lessons, found ${checkpointLessons.length}.`)
    }
    if (guidedLessons.filter((lesson) => lesson.difficulty === minDifficulty).length !== 2) {
      pushIssue(issues, 'lesson_count_mismatch', pack.manifest.packId, `Expected 2 guided lessons at difficulty ${minDifficulty}.`)
    }
    if (guidedLessons.filter((lesson) => lesson.difficulty === minDifficulty + 1).length !== 2) {
      pushIssue(issues, 'lesson_count_mismatch', pack.manifest.packId, `Expected 2 guided lessons at difficulty ${minDifficulty + 1}.`)
    }
    if (checkpointLessons.filter((lesson) => lesson.difficulty === maxDifficulty).length !== 3) {
      pushIssue(issues, 'lesson_count_mismatch', pack.manifest.packId, `Expected 3 checkpoint lessons at difficulty ${maxDifficulty}.`)
    }

    const checkpointPassages = new Set<string>()
    for (const lesson of checkpointLessons) {
      if (lesson.passageIdentifiers.length !== 3) {
        pushIssue(issues, 'lesson_referencing_missing_content', lesson.lessonId, 'Checkpoint lessons in this pack must reference exactly three passages.')
      }
      for (const passageId of lesson.passageIdentifiers) {
        checkpointPassages.add(passageId)
      }
      const lessonQuestions = pack.questions.filter((question) => question.lessonIdentifier === lesson.lessonId)
      const lessonTags = new Set(lessonQuestions.flatMap((question) => question.tags ?? []))
      for (const requiredPattern of ['two-syllable-short-vowels', 'two-syllable-long-vowels', 'open-syllable', 'closed-syllable']) {
        if (!lessonTags.has(requiredPattern)) {
          pushIssue(
            issues,
            'missing_target_pattern_coverage',
            lesson.lessonId,
            `Checkpoint lessons in this pack must include ${requiredPattern.replaceAll('-', ' ')} coverage.`,
          )
        }
      }
    }

    if (checkpointPassages.size < 3) {
      pushIssue(issues, 'repeated_active_passage', pack.manifest.packId, 'Checkpoint lessons should use at least three distinct passages.')
    }
  }
}
