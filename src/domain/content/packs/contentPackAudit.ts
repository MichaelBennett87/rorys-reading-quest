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
    const expectation = getBridgePackExpectation(pack)
    if (!expectation) continue

    const activeLessons = pack.lessons.filter((lesson) => lesson.selectionStatus === 'active')
    const guidedLessons = activeLessons.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE')
    const checkpointLessons = activeLessons.filter((lesson) => lesson.lessonRole === 'CHECKPOINT')
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
    if (guidedLessons.filter((lesson) => lesson.difficulty === expectation.guidedDifficultyA).length !== 2) {
      pushIssue(issues, 'lesson_count_mismatch', pack.manifest.packId, `Expected 2 guided lessons at difficulty ${expectation.guidedDifficultyA}.`)
    }
    if (guidedLessons.filter((lesson) => lesson.difficulty === expectation.guidedDifficultyB).length !== 2) {
      pushIssue(issues, 'lesson_count_mismatch', pack.manifest.packId, `Expected 2 guided lessons at difficulty ${expectation.guidedDifficultyB}.`)
    }
    if (checkpointLessons.filter((lesson) => lesson.difficulty === maxDifficulty).length !== 3) {
      pushIssue(issues, 'lesson_count_mismatch', pack.manifest.packId, `Expected 3 checkpoint lessons at difficulty ${maxDifficulty}.`)
    }

    const checkpointPassages = new Set<string>()
    const allTargets = pack.passages.flatMap((passage) => passage.wordSupportTargets ?? [])
    const questionTypeCounts = new Map<string, number>()
    let hasOpenConsonantLeExample = false
    let hasClosedConsonantLeExample = false
    const prefixFamilyObserved = new Set<string>()
    const suffixFamilyObserved = new Set<string>()
    const suffixEdSoundObserved = new Set<string>()
    const prefixWordExpectations = expectation.packId === 'g2-word-forge-common-prefixes'
      ? new Map<string, { prefix: string; baseWord: string; familyTag: string }>([
          ['unhappy', { prefix: 'un', baseWord: 'happy', familyTag: 'prefix-un' }],
          ['unsafe', { prefix: 'un', baseWord: 'safe', familyTag: 'prefix-un' }],
          ['unfair', { prefix: 'un', baseWord: 'fair', familyTag: 'prefix-un' }],
          ['unkind', { prefix: 'un', baseWord: 'kind', familyTag: 'prefix-un' }],
          ['unpack', { prefix: 'un', baseWord: 'pack', familyTag: 'prefix-un' }],
          ['unlock', { prefix: 'un', baseWord: 'lock', familyTag: 'prefix-un' }],
          ['unroll', { prefix: 'un', baseWord: 'roll', familyTag: 'prefix-un' }],
          ['rebuild', { prefix: 're', baseWord: 'build', familyTag: 'prefix-re' }],
          ['repaint', { prefix: 're', baseWord: 'paint', familyTag: 'prefix-re' }],
          ['rewrite', { prefix: 're', baseWord: 'write', familyTag: 'prefix-re' }],
          ['reuse', { prefix: 're', baseWord: 'use', familyTag: 'prefix-re' }],
          ['retell', { prefix: 're', baseWord: 'tell', familyTag: 'prefix-re' }],
          ['preview', { prefix: 'pre', baseWord: 'view', familyTag: 'prefix-pre' }],
          ['preheat', { prefix: 'pre', baseWord: 'heat', familyTag: 'prefix-pre' }],
          ['pretest', { prefix: 'pre', baseWord: 'test', familyTag: 'prefix-pre' }],
          ['preschool', { prefix: 'pre', baseWord: 'school', familyTag: 'prefix-pre' }],
          ['dislike', { prefix: 'dis', baseWord: 'like', familyTag: 'prefix-dis' }],
          ['disagree', { prefix: 'dis', baseWord: 'agree', familyTag: 'prefix-dis' }],
          ['disconnect', { prefix: 'dis', baseWord: 'connect', familyTag: 'prefix-dis' }],
          ['disobey', { prefix: 'dis', baseWord: 'obey', familyTag: 'prefix-dis' }],
          ['miscount', { prefix: 'mis', baseWord: 'count', familyTag: 'prefix-mis' }],
          ['misplace', { prefix: 'mis', baseWord: 'place', familyTag: 'prefix-mis' }],
          ['misprint', { prefix: 'mis', baseWord: 'print', familyTag: 'prefix-mis' }],
          ['misspell', { prefix: 'mis', baseWord: 'spell', familyTag: 'prefix-mis' }],
        ])
      : null
    const forbiddenOpaquePrefixWords = expectation.packId === 'g2-word-forge-common-prefixes'
      ? new Set(['uncle', 'under', 'return', 'present', 'distance', 'mistake'])
      : null
    const suffixWordExpectations = expectation.packId === 'g2-word-forge-common-suffixes'
      ? new Map<string, { suffix: string; baseWord: string; familyTag: string; edSound?: 't' | 'd' | 'id' }>([
          ['planted', { suffix: 'ed', baseWord: 'plant', familyTag: 'suffix-ed', edSound: 'id' }],
          ['watered', { suffix: 'ed', baseWord: 'water', familyTag: 'suffix-ed', edSound: 'd' }],
          ['helped', { suffix: 'ed', baseWord: 'help', familyTag: 'suffix-ed', edSound: 't' }],
          ['helpful', { suffix: 'ful', baseWord: 'help', familyTag: 'suffix-ful-less' }],
          ['boxes', { suffix: 'es', baseWord: 'box', familyTag: 'suffix-s-es' }],
          ['dishes', { suffix: 'es', baseWord: 'dish', familyTag: 'suffix-s-es' }],
          ['softly', { suffix: 'ly', baseWord: 'soft', familyTag: 'suffix-ly' }],
          ['fearless', { suffix: 'less', baseWord: 'fear', familyTag: 'suffix-ful-less' }],
          ['helping', { suffix: 'ing', baseWord: 'help', familyTag: 'suffix-ing' }],
          ['quickly', { suffix: 'ly', baseWord: 'quick', familyTag: 'suffix-ly' }],
          ['faster', { suffix: 'er', baseWord: 'fast', familyTag: 'suffix-er-est' }],
          ['smallest', { suffix: 'est', baseWord: 'small', familyTag: 'suffix-er-est' }],
          ['calmer', { suffix: 'er', baseWord: 'calm', familyTag: 'suffix-er-est' }],
          ['kindly', { suffix: 'ly', baseWord: 'kind', familyTag: 'suffix-ly' }],
          ['hopeful', { suffix: 'ful', baseWord: 'hope', familyTag: 'suffix-ful-less' }],
          ['warmer', { suffix: 'er', baseWord: 'warm', familyTag: 'suffix-er-est' }],
          ['signs', { suffix: 's', baseWord: 'sign', familyTag: 'suffix-s-es' }],
          ['painted', { suffix: 'ed', baseWord: 'paint', familyTag: 'suffix-ed', edSound: 'id' }],
          ['smaller', { suffix: 'er', baseWord: 'small', familyTag: 'suffix-er-est' }],
          ['careless', { suffix: 'less', baseWord: 'care', familyTag: 'suffix-ful-less' }],
          ['wanted', { suffix: 'ed', baseWord: 'want', familyTag: 'suffix-ed', edSound: 'id' }],
          ['jumping', { suffix: 'ing', baseWord: 'jump', familyTag: 'suffix-ing' }],
          ['cleanest', { suffix: 'est', baseWord: 'clean', familyTag: 'suffix-er-est' }],
          ['kinder', { suffix: 'er', baseWord: 'kind', familyTag: 'suffix-er-est' }],
          ['wishes', { suffix: 'es', baseWord: 'wish', familyTag: 'suffix-s-es' }],
          ['cleaned', { suffix: 'ed', baseWord: 'clean', familyTag: 'suffix-ed', edSound: 'd' }],
          ['fastest', { suffix: 'est', baseWord: 'fast', familyTag: 'suffix-er-est' }],
          ['careful', { suffix: 'ful', baseWord: 'care', familyTag: 'suffix-ful-less' }],
        ])
      : null
    const forbiddenFalseSuffixWords = expectation.packId === 'g2-word-forge-common-suffixes'
      ? new Set(['bus', 'gas', 'yes', 'bed', 'red', 'sing', 'ring', 'king', 'tiger', 'water', 'winter', 'forest', 'honest', 'unless', 'family', 'only', 'early'])
      : null
    const forbiddenSpellingChangeWords = expectation.packId === 'g2-word-forge-common-suffixes'
      ? new Set(['making', 'hoping', 'running', 'bigger', 'biggest', 'happier', 'happiest', 'carried', 'cried'])
      : null
    const silentWordExpectations = expectation.packId === 'g2-word-forge-silent-letter-combinations'
      ? new Map<string, { familyTag: string; leadingChunk?: string; trailingChunk?: string }>([
          ['knight', { familyTag: 'silent-kn', leadingChunk: 'kn' }],
          ['knee', { familyTag: 'silent-kn', leadingChunk: 'kn' }],
          ['knock', { familyTag: 'silent-kn', leadingChunk: 'kn' }],
          ['knit', { familyTag: 'silent-kn', leadingChunk: 'kn' }],
          ['kneel', { familyTag: 'silent-kn', leadingChunk: 'kn' }],
          ['knob', { familyTag: 'silent-kn', leadingChunk: 'kn' }],
          ['know', { familyTag: 'silent-kn', leadingChunk: 'kn' }],
          ['knot', { familyTag: 'silent-kn', leadingChunk: 'kn' }],
          ['wrap', { familyTag: 'silent-wr', leadingChunk: 'wr' }],
          ['wrist', { familyTag: 'silent-wr', leadingChunk: 'wr' }],
          ['write', { familyTag: 'silent-wr', leadingChunk: 'wr' }],
          ['wrong', { familyTag: 'silent-wr', leadingChunk: 'wr' }],
          ['wren', { familyTag: 'silent-wr', leadingChunk: 'wr' }],
          ['wreck', { familyTag: 'silent-wr', leadingChunk: 'wr' }],
          ['lamb', { familyTag: 'silent-mb', trailingChunk: 'mb' }],
          ['comb', { familyTag: 'silent-mb', trailingChunk: 'mb' }],
          ['thumb', { familyTag: 'silent-mb', trailingChunk: 'mb' }],
          ['climb', { familyTag: 'silent-mb', trailingChunk: 'mb' }],
          ['crumb', { familyTag: 'silent-mb', trailingChunk: 'mb' }],
          ['ghost', { familyTag: 'silent-gh' }],
          ['night', { familyTag: 'silent-gh' }],
          ['bright', { familyTag: 'silent-gh' }],
          ['light', { familyTag: 'silent-gh' }],
          ['high', { familyTag: 'silent-gh' }],
          ['island', { familyTag: 'silent-s-island' }],
          ['islander', { familyTag: 'silent-s-island' }],
          ['isle', { familyTag: 'silent-s-island' }],
          ['aisle', { familyTag: 'silent-s-island' }],
        ])
      : null
    const forbiddenFalseSilentGhWords = expectation.packId === 'g2-word-forge-silent-letter-combinations'
      ? new Set(['cough', 'laugh', 'enough', 'rough', 'tough'])
      : null
    const forbiddenFalseSilentMbWords = expectation.packId === 'g2-word-forge-silent-letter-combinations'
      ? new Set(['number', 'timber', 'member', 'bamboo'])
      : null
    const silentFamilyObserved = new Set<string>()
    const silentRequiredWordsObserved = new Set<string>()

    if (allTargets.length < expectation.minSupportTargets || allTargets.length > expectation.maxSupportTargets) {
      pushIssue(
        issues,
        'support_target_count_mismatch',
        pack.manifest.packId,
        `Expected between ${expectation.minSupportTargets} and ${expectation.maxSupportTargets} support targets, found ${allTargets.length}.`,
      )
    }

    for (const question of pack.questions) {
      questionTypeCounts.set(question.questionType, (questionTypeCounts.get(question.questionType) ?? 0) + 1)
    }
    if (expectation.questionTypeCounts) {
      for (const [questionType, count] of Object.entries(expectation.questionTypeCounts)) {
        const observed = questionTypeCounts.get(questionType) ?? 0
        if (observed !== count) {
          pushIssue(
            issues,
            'question_count_mismatch',
            pack.manifest.packId,
            `Expected ${count} ${questionType.replace('_', ' ')} questions, found ${observed}.`,
          )
        }
      }
    }

    for (const passage of pack.passages) {
      const targets = passage.wordSupportTargets ?? []
      if (targets.length < expectation.minSupportTargetsPerPassage || targets.length > expectation.maxSupportTargetsPerPassage) {
        pushIssue(
          issues,
          'support_target_count_mismatch',
          passage.passageIdentifier,
          `Expected between ${expectation.minSupportTargetsPerPassage} and ${expectation.maxSupportTargetsPerPassage} support targets per passage.`,
        )
      }
      for (const target of targets) {
        if ((target.displayChunks ?? []).length < 2) {
          pushIssue(issues, 'support_target_structure_invalid', target.targetId, 'Support targets need at least two authored chunks.')
        }
        const normalizedWord = target.surfaceWord.toLowerCase()
        if (expectation.forbiddenSilentEWords.has(normalizedWord)) {
          pushIssue(issues, 'forbidden_silent_e_target', target.targetId, 'One-syllable silent-e words are not valid consonant-le targets.')
        }
        if (expectation.openConsonantLeWords.has(normalizedWord)) {
          hasOpenConsonantLeExample = true
        }
        if (expectation.closedConsonantLeWords.has(normalizedWord)) {
          hasClosedConsonantLeExample = true
        }
        if (prefixWordExpectations) {
          if (forbiddenOpaquePrefixWords?.has(normalizedWord)) {
            pushIssue(issues, 'ambiguous_forbidden_homograph', target.targetId, 'Opaque words must not be treated as transparent prefix targets.')
            continue
          }
          const expectationForWord = prefixWordExpectations.get(normalizedWord)
          if (expectationForWord) {
            prefixFamilyObserved.add(expectationForWord.familyTag)
            const reconstructed = (target.displayChunks ?? []).map((chunk) => chunk.displayText.toLowerCase().replace(/[^a-z]/g, '')).join('')
            if (reconstructed !== normalizedWord) {
              pushIssue(issues, 'support_target_structure_invalid', target.targetId, 'Prefix target chunks must reconstruct the surface word.')
            }
            const prefixChunk = target.displayChunks?.[0]?.displayText.toLowerCase().replace(/[^a-z]/g, '') ?? ''
            if (prefixChunk !== expectationForWord.prefix) {
              pushIssue(issues, 'support_target_structure_invalid', target.targetId, 'Prefix target chunks must begin with the authored prefix.')
            }
            const baseChunk = (target.displayChunks ?? []).slice(1).map((chunk) => chunk.displayText.toLowerCase().replace(/[^a-z]/g, '')).join('')
            if (baseChunk !== expectationForWord.baseWord) {
              pushIssue(issues, 'support_target_structure_invalid', target.targetId, 'Prefix target chunks must preserve the base word.')
            }
          }
        }
        if (suffixWordExpectations) {
          if (forbiddenFalseSuffixWords?.has(normalizedWord)) {
            pushIssue(issues, 'ambiguous_forbidden_homograph', target.targetId, 'False suffix words must not be treated as transparent suffix targets.')
            continue
          }
          if (forbiddenSpellingChangeWords?.has(normalizedWord)) {
            pushIssue(issues, 'ambiguous_forbidden_homograph', target.targetId, 'Spelling-change words must not be primary suffix targets.')
            continue
          }
          const expectationForWord = suffixWordExpectations.get(normalizedWord)
        if (expectationForWord) {
          suffixFamilyObserved.add(expectationForWord.familyTag)
            const reconstructed = (target.displayChunks ?? []).map((chunk) => chunk.displayText.toLowerCase().replace(/[^a-z]/g, '')).join('')
            if (reconstructed !== normalizedWord) {
              pushIssue(issues, 'support_target_structure_invalid', target.targetId, 'Suffix target chunks must reconstruct the surface word.')
            }
            const prefixChunk = target.displayChunks?.[0]?.displayText.toLowerCase().replace(/[^a-z]/g, '') ?? ''
            const suffixChunk = target.displayChunks?.[1]?.displayText.toLowerCase().replace(/[^a-z]/g, '') ?? ''
            if (prefixChunk !== expectationForWord.baseWord) {
              pushIssue(issues, 'support_target_structure_invalid', target.targetId, 'Suffix target chunks must preserve the base word.')
            }
            if (suffixChunk !== expectationForWord.suffix) {
              pushIssue(issues, 'support_target_structure_invalid', target.targetId, 'Suffix target chunks must preserve the authored suffix.')
            }
            if (expectationForWord.edSound) {
              const spokenSuffix = target.spokenChunks?.[1]?.speechText.toLowerCase().replace(/[^a-z]/g, '') ?? ''
              if (spokenSuffix !== expectationForWord.edSound) {
                pushIssue(issues, 'support_target_structure_invalid', target.targetId, 'Suffix -ed targets must include a defensible spoken ending.')
              }
              suffixEdSoundObserved.add(expectationForWord.edSound)
            }
          }
        }
        if (silentWordExpectations) {
          if (forbiddenFalseSilentGhWords?.has(normalizedWord) || forbiddenFalseSilentMbWords?.has(normalizedWord)) {
            pushIssue(issues, 'ambiguous_forbidden_homograph', target.targetId, 'False silent-letter examples must not be treated as transparent silent-letter targets.')
            continue
          }
          const expectationForWord = silentWordExpectations.get(normalizedWord)
          if (expectationForWord) {
            silentFamilyObserved.add(expectationForWord.familyTag)
            silentRequiredWordsObserved.add(normalizedWord)
            const reconstructed = (target.displayChunks ?? []).map((chunk) => chunk.displayText.toLowerCase().replace(/[^a-z]/g, '')).join('')
            if (reconstructed !== normalizedWord) {
              pushIssue(issues, 'support_target_structure_invalid', target.targetId, 'Silent-letter target chunks must reconstruct the surface word.')
            }
            if ((target.displayChunks ?? []).length < 2) {
              pushIssue(issues, 'support_target_structure_invalid', target.targetId, 'Silent-letter targets need at least two authored chunks.')
            }
            if (expectationForWord.leadingChunk) {
              const leadingChunk = target.displayChunks?.[0]?.displayText.toLowerCase().replace(/[^a-z]/g, '') ?? ''
              if (leadingChunk !== expectationForWord.leadingChunk) {
                pushIssue(issues, 'support_target_structure_invalid', target.targetId, 'Silent-letter target chunks must preserve the quiet onset.')
              }
            }
            if (expectationForWord.trailingChunk) {
              const trailingChunk = target.displayChunks?.[target.displayChunks.length - 1]?.displayText.toLowerCase().replace(/[^a-z]/g, '') ?? ''
              if (trailingChunk !== expectationForWord.trailingChunk) {
                pushIssue(issues, 'support_target_structure_invalid', target.targetId, 'Silent-letter target chunks must preserve the quiet ending.')
              }
            }
          }
        }
      }
    }

    if (expectation.packId === 'g2-word-forge-consonant-le-integrated') {
      if (!hasOpenConsonantLeExample) {
        pushIssue(issues, 'missing_target_pattern_coverage', pack.manifest.packId, 'The pack must include open syllables before consonant-le.')
      }
      if (!hasClosedConsonantLeExample) {
        pushIssue(issues, 'missing_target_pattern_coverage', pack.manifest.packId, 'The pack must include closed syllables before consonant-le.')
      }
    }

    if (expectation.packId === 'g2-word-forge-common-prefixes') {
      for (const familyTag of ['prefix-un', 'prefix-re', 'prefix-pre', 'prefix-dis', 'prefix-mis'] as const) {
        if (!prefixFamilyObserved.has(familyTag)) {
          pushIssue(issues, 'missing_target_pattern_coverage', pack.manifest.packId, `The pack must include ${familyTag.replace('prefix-', '').replace('-', '-')} support targets.`)
        }
      }
    }

    if (expectation.packId === 'g2-word-forge-common-suffixes') {
      for (const familyTag of ['suffix-s-es', 'suffix-ed', 'suffix-ing', 'suffix-er-est', 'suffix-ful-less', 'suffix-ly'] as const) {
        if (!suffixFamilyObserved.has(familyTag)) {
          pushIssue(issues, 'missing_target_pattern_coverage', pack.manifest.packId, `The pack must include ${familyTag.replace('suffix-', '').replace('-', '-')} support targets.`)
        }
      }
      for (const soundKind of ['t', 'd', 'id'] as const) {
        if (!suffixEdSoundObserved.has(soundKind)) {
          pushIssue(issues, 'missing_target_pattern_coverage', pack.manifest.packId, `The pack must include an authored -ed target with the ${soundKind} sound.`,)
        }
      }
    }

    if (expectation.packId === 'g2-word-forge-silent-letter-combinations') {
      for (const familyTag of ['silent-kn', 'silent-wr', 'silent-mb', 'silent-gh', 'silent-s-island'] as const) {
        if (!silentFamilyObserved.has(familyTag)) {
          pushIssue(issues, 'missing_target_pattern_coverage', pack.manifest.packId, `The pack must include ${familyTag.replace('silent-', '').replace('-', '-')} support targets.`)
        }
      }
      for (const requiredWord of ['knight', 'comb', 'island', 'ghost'] as const) {
        if (!silentRequiredWordsObserved.has(requiredWord)) {
          pushIssue(issues, 'missing_target_pattern_coverage', pack.manifest.packId, `The pack must include ${requiredWord} somewhere in authored support.`)
        }
      }
    }

    for (const lesson of checkpointLessons) {
      if (lesson.passageIdentifiers.length !== 3) {
        pushIssue(issues, 'lesson_referencing_missing_content', lesson.lessonId, 'Checkpoint lessons in this pack must reference exactly three passages.')
      }
      for (const passageId of lesson.passageIdentifiers) {
        checkpointPassages.add(passageId)
      }
      const lessonQuestions = pack.questions.filter((question) => question.lessonIdentifier === lesson.lessonId)
      const lessonTags = new Set(lessonQuestions.flatMap((question) => question.tags ?? []))
      for (const requiredPattern of expectation.checkpointPatterns) {
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

interface BridgePackExpectation {
  packId: string
  guidedDifficultyA: number
  guidedDifficultyB: number
  checkpointPatterns: string[]
  minSupportTargets: number
  maxSupportTargets: number
  minSupportTargetsPerPassage: number
  maxSupportTargetsPerPassage: number
  openConsonantLeWords: Set<string>
  closedConsonantLeWords: Set<string>
  forbiddenSilentEWords: Set<string>
  questionTypeCounts?: Partial<Record<string, number>>
}

function getBridgePackExpectation(pack: ContentPack): BridgePackExpectation | null {
  const hasB = pack.manifest.benchmarkReferences.includes('ELA.2.F.1.3b')
  const hasC = pack.manifest.benchmarkReferences.includes('ELA.2.F.1.3c')
  const [minDifficulty, maxDifficulty] = pack.manifest.difficultyRange

  if (hasB && hasC && minDifficulty === 2 && maxDifficulty === 3) {
    return {
      packId: pack.manifest.packId,
      guidedDifficultyA: 2,
      guidedDifficultyB: 3,
      checkpointPatterns: ['two-syllable-short-vowels', 'two-syllable-long-vowels', 'open-syllable', 'closed-syllable'],
      minSupportTargets: 0,
      maxSupportTargets: Number.POSITIVE_INFINITY,
      minSupportTargetsPerPassage: 0,
      maxSupportTargetsPerPassage: Number.POSITIVE_INFINITY,
      openConsonantLeWords: new Set<string>(),
      closedConsonantLeWords: new Set<string>(),
      forbiddenSilentEWords: new Set<string>(),
    }
  }

  if (hasC && !hasB && minDifficulty === 3 && maxDifficulty === 4) {
    return {
      packId: pack.manifest.packId,
      guidedDifficultyA: 3,
      guidedDifficultyB: 4,
      checkpointPatterns: ['consonant-le', 'open-syllable', 'closed-syllable'],
      minSupportTargets: 28,
      maxSupportTargets: 35,
      minSupportTargetsPerPassage: 3,
      maxSupportTargetsPerPassage: 5,
      openConsonantLeWords: new Set(['table', 'maple', 'cable', 'title', 'noble', 'bugle', 'stable']),
      closedConsonantLeWords: new Set(['apple', 'candle', 'little', 'bottle', 'simple', 'puzzle', 'middle', 'rattle', 'bubble', 'jungle', 'pebble', 'giggle', 'sample', 'temple', 'dimple', 'tumble', 'handle', 'bundle']),
      forbiddenSilentEWords: new Set(['sale', 'mile', 'hole', 'rule', 'pale', 'smile']),
    }
  }

  if (!hasB && !hasC && pack.manifest.benchmarkReferences.includes('ELA.2.F.1.3d') && minDifficulty === 4 && maxDifficulty === 5) {
    return {
      packId: pack.manifest.packId,
      guidedDifficultyA: 4,
      guidedDifficultyB: 5,
      checkpointPatterns: ['prefix-un', 'prefix-re', 'prefix-pre', 'prefix-dis', 'prefix-mis'],
      minSupportTargets: 28,
      maxSupportTargets: 35,
      minSupportTargetsPerPassage: 3,
      maxSupportTargetsPerPassage: 5,
      openConsonantLeWords: new Set(),
      closedConsonantLeWords: new Set(),
      forbiddenSilentEWords: new Set(),
      questionTypeCounts: {
        multiple_choice: 20,
        multi_select: 7,
        hot_text: 7,
        table_match: 7,
      },
    }
  }

  if (!hasB && !hasC && pack.manifest.benchmarkReferences.includes('ELA.2.F.1.3d') && minDifficulty === 5 && maxDifficulty === 6) {
    return {
      packId: pack.manifest.packId,
      guidedDifficultyA: 5,
      guidedDifficultyB: 6,
      checkpointPatterns: ['suffix-s-es', 'suffix-ed', 'suffix-ing', 'suffix-er-est', 'suffix-ful-less', 'suffix-ly'],
      minSupportTargets: 28,
      maxSupportTargets: 28,
      minSupportTargetsPerPassage: 4,
      maxSupportTargetsPerPassage: 4,
      openConsonantLeWords: new Set(),
      closedConsonantLeWords: new Set(),
      forbiddenSilentEWords: new Set(),
      questionTypeCounts: {
        multiple_choice: 20,
        multi_select: 7,
        hot_text: 7,
        table_match: 7,
      },
    }
  }

  if (!hasB && !hasC && pack.manifest.benchmarkReferences.includes('ELA.2.F.1.3e') && minDifficulty === 6 && maxDifficulty === 7) {
    return {
      packId: pack.manifest.packId,
      guidedDifficultyA: 6,
      guidedDifficultyB: 7,
      checkpointPatterns: ['silent-kn', 'silent-wr', 'silent-mb', 'silent-gh', 'silent-s-island'],
      minSupportTargets: 28,
      maxSupportTargets: 28,
      minSupportTargetsPerPassage: 4,
      maxSupportTargetsPerPassage: 4,
      openConsonantLeWords: new Set(),
      closedConsonantLeWords: new Set(),
      forbiddenSilentEWords: new Set(),
      questionTypeCounts: {
        multiple_choice: 20,
        multi_select: 7,
        hot_text: 7,
        table_match: 7,
      },
    }
  }

  return null
}
