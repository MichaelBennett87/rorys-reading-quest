import { parseScopedEvidenceReference, resolveLessonEvidence, resolvePassageEvidence } from '../evidence'
import type { ContentPack, ContentPackAuditIssue } from './contentPackTypes'
import { collectObservedBenchmarkPatterns, getClaimedBenchmarkPatterns, getExpectedBenchmarkPatterns } from './benchmarkPatternCatalog'
import { buildRootDecodingGuideAudit } from './rootDecodingGuideAudit'
import { buildDerivationalSuffixGuideAudit } from './derivationalSuffixGuideAudit'
import { buildMultisyllableDecodingGuideAudit } from './multisyllableDecodingGuideAudit'
import { buildCharacterDevelopmentGuideAudit } from './characterDevelopmentGuideAudit'
import { buildThemeDevelopmentGuideAudit } from './themeDevelopmentGuideAudit'
import { buildCharacterPerspectiveGuideAudit } from './characterPerspectiveGuideAudit'
import { buildPoemFormGuideAudit } from './poemFormGuideAudit'
import { buildInformationalStructureGuideAudit } from './informationalStructureGuideAudit'
import { buildCentralIdeaEngineGuideAudit } from './centralIdeaEngineGuideAudit'
import { buildPurposeDevelopmentGuideAudit } from './purposeDevelopmentGuideAudit'
import { buildAuthorClaimGuideAudit } from './authorClaimGuideAudit'
import { buildFigurativeLanguageGuideAudit } from './figurativeLanguageGuideAudit'
import { buildGrade3SummaryGuideAudit } from './grade3SummaryGuideAudit'
import { buildGrade3AuthorComparisonGuideAudit } from './grade3AuthorComparisonGuideAudit'
import { buildGrade3AcademicVocabularyGuideAudit } from './grade3AcademicVocabularyGuideAudit'
import { buildRootMeaningGuideAudit } from './rootMeaningGuideAudit'

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
    if (pack.manifest.coverageKind === 'supportive_practice') {
      if (!pack.manifest.supportingBenchmarkReferences?.length) {
        pushIssue(
          issues,
          'missing_supporting_benchmark_mapping',
          `manifest:${pack.manifest.packId}`,
          'Supportive-practice packs require supporting benchmark references.',
        )
      }
    } else if (!pack.manifest.benchmarkReferences.length) {
      pushIssue(issues, 'missing_benchmark_mapping', `manifest:${pack.manifest.packId}`, 'At least one benchmark reference is required.')
    }
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
      if (passage.gradeBand !== pack.manifest.gradeBand) {
        pushIssue(issues, 'wrong_grade_band', passage.passageIdentifier, 'Passage grade band must match the pack manifest.')
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
      if (question.gradeBand !== pack.manifest.gradeBand) {
        pushIssue(issues, 'wrong_grade_band', question.questionIdentifier, 'Question grade band must match the pack manifest.')
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
        if (lesson.difficulty === pack.manifest.difficultyRange[0]) {
          lowerDifficultyCount += 1
        }
      }
    }

    if (pack.manifest.coverageKind === 'supportive_practice') {
      validateSupportivePracticePackStructure(pack, issues)
    }

    if (pack.manifest.benchmarkReferences.includes('ELA.2.R.3.3') && pack.manifest.difficultyRange[0] === 2 && pack.manifest.difficultyRange[1] === 3) {
      validateCompareKeepPackStructure(pack, issues)
    }

    issues.push(...buildRootDecodingGuideAudit(pack))
    issues.push(...buildDerivationalSuffixGuideAudit(pack))
    issues.push(...buildMultisyllableDecodingGuideAudit(pack))
    issues.push(...buildCharacterDevelopmentGuideAudit(pack))
    issues.push(...buildThemeDevelopmentGuideAudit(pack))
    issues.push(...buildCharacterPerspectiveGuideAudit(pack))
    issues.push(...buildPoemFormGuideAudit(pack))
    issues.push(...buildInformationalStructureGuideAudit(pack))
    issues.push(...buildCentralIdeaEngineGuideAudit(pack))
    issues.push(...buildPurposeDevelopmentGuideAudit(pack))
    issues.push(...buildAuthorClaimGuideAudit(pack))
    issues.push(...buildFigurativeLanguageGuideAudit(pack))
    issues.push(...buildGrade3SummaryGuideAudit(pack))
    issues.push(...buildGrade3AuthorComparisonGuideAudit(pack))
    issues.push(...buildGrade3AcademicVocabularyGuideAudit(pack))
    issues.push(...buildRootMeaningGuideAudit(pack))
  }

  const hasBenchmarkProgressionPack = packs.some((pack) => pack.manifest.coverageKind !== 'supportive_practice')

  if (hasBenchmarkProgressionPack && activeProgressionCount < 3) {
    pushIssue(issues, 'insufficient_progression_variants', 'content-pack', 'At least three active checkpoint lessons are required.')
  }
  if (hasBenchmarkProgressionPack && guidedCount < 4) {
    pushIssue(issues, 'insufficient_guided_remediation_variants', 'content-pack', 'At least four guided remediation lessons are required.')
  }
  if (hasBenchmarkProgressionPack && lowerDifficultyCount < 2) {
    pushIssue(
      issues,
      'insufficient_lower_difficulty_variants',
      'content-pack',
      'At least two guided lessons at the pack\'s lower difficulty are required.',
    )
  }
  if (hasBenchmarkProgressionPack && activeProgressionPassages.size < 3) {
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
    const passageCount = expectation.passageCount ?? 7
    if (pack.passages.length !== passageCount) {
      pushIssue(issues, 'passage_count_mismatch', pack.manifest.packId, `Expected ${passageCount} passages, found ${pack.passages.length}.`)
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

    const checkpointPassageCount = expectation.checkpointPassageCount ?? 3
    for (const lesson of checkpointLessons) {
      if (lesson.passageIdentifiers.length < checkpointPassageCount) {
        pushIssue(
          issues,
          'lesson_referencing_missing_content',
          lesson.lessonId,
          `Checkpoint lessons in this pack must reference at least ${checkpointPassageCount} passages.`,
        )
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

    if (pack.manifest.benchmarkReferences.includes('ELA.2.R.1.2')) {
      validateThemeTrailGuideStructure(pack, issues)
    }
    if (pack.manifest.benchmarkReferences.includes('ELA.2.R.2.1')) {
      validateTextFeatureGuideStructure(pack, issues)
    }
    if (pack.manifest.benchmarkReferences.includes('ELA.2.R.2.2') || pack.manifest.benchmarkReferences.includes('ELA.3.R.2.2')) {
      validateCentralIdeaGuideStructure(pack, issues)
    }
    if (pack.manifest.benchmarkReferences.includes('ELA.2.R.2.3')) {
      validateAuthorPurposeGuideStructure(pack, issues)
    }
    if (pack.manifest.benchmarkReferences.includes('ELA.2.R.2.4')) {
      validateAuthorOpinionGuideStructure(pack, issues)
    }
    if (pack.manifest.benchmarkReferences.includes('ELA.2.V.1.1')) {
      validateAcademicVocabularyGuideStructure(pack, issues)
    }
    if (pack.manifest.benchmarkReferences.includes('ELA.2.V.1.2')) {
      validateMorphologyGuideStructure(pack, issues)
    }
    if (pack.manifest.benchmarkReferences.includes('ELA.2.V.1.3')) {
      validateMeaningClueGuideStructure(pack, issues)
    }
    if (pack.manifest.benchmarkReferences.includes('ELA.2.R.3.2')) {
      validateRetellGuideStructure(pack, issues)
    }
    if (pack.manifest.benchmarkReferences.includes('ELA.2.R.3.1')) {
      validateWordplayGuideStructure(pack, issues)
    }
    if (pack.manifest.benchmarkReferences.includes('ELA.2.R.1.3')) {
      validatePerspectivePortalGuideStructure(pack, issues)
    }
    if (pack.manifest.benchmarkReferences.includes('ELA.2.R.1.4')) {
      validatePoetryPlanetGuideStructure(pack, issues)
    }
  }
}

function validateSupportivePracticePackStructure(pack: ContentPack, issues: ContentPackAuditIssue[]) {
  if (!pack.lessons.some((lesson) => lesson.lessonRole === 'FLUENCY_PRACTICE')) return

  const isGrade3Fluency = pack.manifest.gradeBand === 3
  const expectedSupportingBenchmark = isGrade3Fluency ? 'ELA.3.F.1.4' : 'ELA.2.F.1.4'
  const expectedQuestionBenchmark = isGrade3Fluency ? 'ELA.3.F.1.4' : 'RR-G2-FLUENCY-PRACTICE'
  const expectedDifficulty = isGrade3Fluency ? 4 : 8

  if (pack.manifest.supportingBenchmarkReferences?.includes(expectedSupportingBenchmark) !== true) {
    pushIssue(
      issues,
      'missing_supporting_benchmark_mapping',
      pack.manifest.packId,
      `Supportive-practice packs at Grade ${pack.manifest.gradeBand} must support ${expectedSupportingBenchmark}.`,
    )
  }

  const activeLessons = pack.lessons.filter((lesson) => lesson.selectionStatus === 'active')
  const fluencyLessons = activeLessons.filter((lesson) => lesson.lessonRole === 'FLUENCY_PRACTICE')
  const guidedLessons = fluencyLessons.filter((lesson) => lesson.fluencyPracticeBlock?.practiceMode === 'guided')
  const independentLessons = fluencyLessons.filter((lesson) => lesson.fluencyPracticeBlock?.practiceMode === 'independent')

  if (activeLessons.length !== 7) {
    pushIssue(issues, 'lesson_count_mismatch', pack.manifest.packId, `Expected 7 active lessons, found ${activeLessons.length}.`)
  }
  if (pack.passages.length !== 7) {
    pushIssue(issues, 'passage_count_mismatch', pack.manifest.packId, `Expected 7 passages, found ${pack.passages.length}.`)
  }
  if (pack.questions.length !== 28) {
    pushIssue(issues, 'question_count_mismatch', pack.manifest.packId, `Expected 28 questions, found ${pack.questions.length}.`)
  }
  if (fluencyLessons.length !== 7) {
    pushIssue(issues, 'missing_lesson_role', pack.manifest.packId, `Expected 7 FLUENCY_PRACTICE lessons, found ${fluencyLessons.length}.`)
  }
  if (guidedLessons.length !== 4) {
    pushIssue(issues, 'lesson_count_mismatch', pack.manifest.packId, `Expected 4 guided fluency lessons, found ${guidedLessons.length}.`)
  }
  if (independentLessons.length !== 3) {
    pushIssue(issues, 'lesson_count_mismatch', pack.manifest.packId, `Expected 3 independent fluency lessons, found ${independentLessons.length}.`)
  }

  const questionTypeCounts = new Map<string, number>()
  const expressionCueKinds = new Set<string>()
  let firstCorrectPositions = 0
  let checkedCorrectPositions = 0

  for (const lesson of activeLessons) {
    if (lesson.lessonRole !== 'FLUENCY_PRACTICE') {
      pushIssue(issues, 'missing_lesson_role', lesson.lessonId, 'Fluency lessons must use the FLUENCY_PRACTICE lesson role.')
    }
    if (lesson.difficulty !== expectedDifficulty) {
      pushIssue(issues, 'mixed_difficulty_within_lesson', lesson.lessonId, `Fluency lessons must remain at difficulty ${expectedDifficulty}.`)
    }
    if (!lesson.fluencyPracticeBlock) {
      pushIssue(issues, 'missing_manifest_field', lesson.lessonId, 'Fluency lessons require a fluency practice block.')
      continue
    }
    if (lesson.eligiblePurposes.includes('verification') || lesson.eligiblePurposes.includes('remediation')) {
      pushIssue(issues, 'lesson_with_invalid_eligible_purpose', lesson.lessonId, 'Fluency practice lessons are review and progression only.')
    }
    if (lesson.fluencyPracticeBlock.oralReadingMeasured !== false) {
      pushIssue(issues, 'missing_manifest_field', lesson.lessonId, 'Fluency practice must not measure oral reading.')
    }
    if (lesson.fluencyPracticeBlock.timerUsed !== false) {
      pushIssue(issues, 'missing_manifest_field', lesson.lessonId, 'Fluency practice must not use a timer.')
    }
    if (lesson.fluencyPracticeBlock.microphoneUsed !== false) {
      pushIssue(issues, 'missing_manifest_field', lesson.lessonId, 'Fluency practice must not use a microphone.')
    }
    if (!lesson.fluencyPracticeBlock.phraseGroups.length) {
      pushIssue(issues, 'missing_manifest_field', lesson.lessonId, 'Fluency practice requires phrase groups.')
    }
    if (!lesson.fluencyPracticeBlock.expressionCues.length) {
      pushIssue(issues, 'missing_manifest_field', lesson.lessonId, 'Fluency practice requires expression cues.')
    }
    if (lesson.fluencyPracticeBlock.requiredReadCount < 1 || lesson.fluencyPracticeBlock.requiredReadCount > 3) {
      pushIssue(issues, 'missing_manifest_field', lesson.lessonId, 'Fluency practice requiredReadCount must stay between 1 and 3.')
    }
    if (lesson.lessonRole === 'FLUENCY_PRACTICE' && lesson.fluencyPracticeBlock.practiceMode === 'guided' && !lesson.teachingBlock) {
      pushIssue(issues, 'guided_lesson_without_teaching_block', lesson.lessonId, 'Guided fluency lessons require a teaching block.')
    }
    if (lesson.lessonRole === 'FLUENCY_PRACTICE' && lesson.fluencyPracticeBlock.practiceMode === 'independent' && lesson.teachingBlock) {
      pushIssue(issues, 'checkpoint_lesson_with_teaching_block', lesson.lessonId, 'Independent fluency lessons must not include a teaching block.')
    }

    const passage = pack.passages.find((entry) => entry.passageIdentifier === lesson.passageIdentifiers[0])
    if (!passage) {
      pushIssue(issues, 'lesson_referencing_missing_content', lesson.lessonId, 'Fluency lessons must reference a valid passage.')
      continue
    }

    const reconstructedPhrases = lesson.fluencyPracticeBlock.phraseGroups.map((phrase) => phrase.text).join(' ')
    if (normalizeFluencySpacing(reconstructedPhrases) !== normalizeFluencySpacing(passage.passageText)) {
      pushIssue(issues, 'support_target_structure_invalid', lesson.lessonId, 'Fluency phrase groups must reconstruct the passage text.')
    }
    for (const cue of lesson.fluencyPracticeBlock.expressionCues) {
      if (!passage.sentences?.some((sentence) => sentence.sentenceId === cue.sentenceId)) {
        pushIssue(issues, 'missing_support_sentence', cue.cueId, 'Fluency expression cues must reference a valid sentence.')
      }
      expressionCueKinds.add(normalizeCueLabel(cue.label))
    }

    const lessonQuestions = pack.questions.filter((question) => question.lessonIdentifier === lesson.lessonId)
    if (lessonQuestions.length !== 4) {
      pushIssue(issues, 'question_count_mismatch', lesson.lessonId, `Expected 4 questions for ${lesson.lessonId}.`)
    }
    for (const question of lessonQuestions) {
      questionTypeCounts.set(question.questionType, (questionTypeCounts.get(question.questionType) ?? 0) + 1)
      if (question.gradeBand !== pack.manifest.gradeBand) {
        pushIssue(issues, 'wrong_grade_band', question.questionIdentifier, `Fluency questions must remain Grade ${pack.manifest.gradeBand}.`)
      }
      if (question.skillIdentifier !== pack.manifest.primarySkillId) {
        pushIssue(issues, 'wrong_primary_skill', question.questionIdentifier, 'Fluency questions must stay on the bridge skill.')
      }
      if (question.reportingCategory !== 'Foundational Skills Bridge') {
        pushIssue(issues, 'missing_manifest_field', question.questionIdentifier, 'Fluency questions must use the Foundational Skills Bridge category.')
      }
      if (question.benchmarkReference !== expectedQuestionBenchmark) {
        pushIssue(issues, 'missing_manifest_field', question.questionIdentifier, `Fluency questions must use ${expectedQuestionBenchmark}.`)
      }
      if (question.reviewStatus !== 'DRAFT') {
        pushIssue(issues, 'missing_draft_status', question.questionIdentifier, 'Fluency questions must remain DRAFT.')
      }
      if (!question.explanation) {
        pushIssue(issues, 'missing_explanation', question.questionIdentifier, 'Fluency questions need explanations.')
      }
      if (!question.evidenceReference || (question.evidenceReferenceIds?.length ?? 0) === 0) {
        pushIssue(issues, 'missing_evidence_reference', question.questionIdentifier, 'Fluency questions need evidence references.')
      }
      if (!question.questionContent) {
        pushIssue(issues, 'unsupported_question_payload', question.questionIdentifier, 'Fluency questions require question content.')
      }
      if (new Set(question.answerChoices).size !== question.answerChoices.length) {
        pushIssue(issues, 'duplicate_visible_choice_text', question.questionIdentifier, 'Visible answer text must not be duplicated within a question.')
      }
      if (!question.correctAnswers.length) {
        pushIssue(issues, 'correct_answer_absent', question.questionIdentifier, 'Fluency questions need a correct answer.')
      }
      const firstPosition = getFirstCorrectPosition(question)
      if (firstPosition !== null) {
        checkedCorrectPositions += 1
        if (firstPosition === 0) {
          firstCorrectPositions += 1
        }
      }
    }

    const targetCount = passage.wordSupportTargets?.length ?? 0
    if (targetCount !== 3) {
      pushIssue(issues, 'support_target_count_mismatch', passage.passageIdentifier, `Expected exactly 3 support targets, found ${targetCount}.`)
    }
  }

  if (pack.questions.length !== 28) {
    pushIssue(issues, 'question_count_mismatch', pack.manifest.packId, `Expected 28 fluency questions, found ${pack.questions.length}.`)
  }
  if (questionTypeCounts.get('multiple_choice') !== 14) {
    pushIssue(issues, 'question_count_mismatch', pack.manifest.packId, `Expected 14 multiple choice questions, found ${questionTypeCounts.get('multiple_choice') ?? 0}.`)
  }
  if (questionTypeCounts.get('multi_select') !== 5) {
    pushIssue(issues, 'question_count_mismatch', pack.manifest.packId, `Expected 5 multiselect questions, found ${questionTypeCounts.get('multi_select') ?? 0}.`)
  }
  if (questionTypeCounts.get('hot_text') !== 5) {
    pushIssue(issues, 'question_count_mismatch', pack.manifest.packId, `Expected 5 hot text questions, found ${questionTypeCounts.get('hot_text') ?? 0}.`)
  }
  if (questionTypeCounts.get('table_match') !== 4) {
    pushIssue(issues, 'question_count_mismatch', pack.manifest.packId, `Expected 4 table match questions, found ${questionTypeCounts.get('table_match') ?? 0}.`)
  }

  const supportTargets = pack.passages.flatMap((passage) => passage.wordSupportTargets ?? [])
  if (supportTargets.length !== 21) {
    pushIssue(issues, 'support_target_count_mismatch', pack.manifest.packId, `Expected 21 support targets, found ${supportTargets.length}.`)
  }
  if (supportTargets.length && supportTargets.length / pack.passages.length !== 3) {
    pushIssue(issues, 'support_target_count_mismatch', pack.manifest.packId, 'Each fluency passage must have exactly 3 support targets.')
  }

  for (const passage of pack.passages) {
    const targetCount = passage.wordSupportTargets?.length ?? 0
    if (targetCount !== 3) {
      pushIssue(issues, 'support_target_count_mismatch', passage.passageIdentifier, `Expected exactly 3 support targets, found ${targetCount}.`)
    }
    for (const target of passage.wordSupportTargets ?? []) {
      if (target.reviewStatus !== 'DRAFT') {
        pushIssue(issues, 'missing_draft_status', target.targetId, 'Fluency support targets must remain DRAFT.')
      }
      if (target.contentVersion !== pack.manifest.contentVersion) {
        pushIssue(issues, 'mismatched_content_version', target.targetId, 'Fluency support targets must match the pack version.')
      }
    }
  }

  if (checkedCorrectPositions > 0 && firstCorrectPositions / checkedCorrectPositions > 0.75) {
    pushIssue(issues, 'correct_answer_position_concentration', pack.manifest.packId, 'Correct answers are too concentrated in the first position.')
  }

  if (expressionCueKinds.size === 0) {
    pushIssue(issues, 'missing_manifest_field', pack.manifest.packId, 'Fluency practice requires expression cues.')
  }

  validateFluencySupportMetadata(pack, issues)
}

function validateThemeTrailGuideStructure(pack: ContentPack, issues: ContentPackAuditIssue[]) {
  const guides = pack.themeGuides ?? []
  const passageById = new Map(pack.passages.map((passage) => [passage.passageIdentifier, passage] as const))
  const guideByPassageId = new Map<string, NonNullable<ContentPack['themeGuides']>[number]>()

  if (guides.length !== pack.passages.length) {
    pushIssue(
      issues,
      'theme_guide_count_mismatch',
      pack.manifest.packId,
      `Expected ${pack.passages.length} theme guides, found ${guides.length}.`,
    )
  }

  for (const guide of guides) {
    if (guideByPassageId.has(guide.passageId)) {
      pushIssue(issues, 'theme_guide_structure_invalid', guide.passageId, 'Theme guides must not duplicate a passage ID.')
      continue
    }
    guideByPassageId.set(guide.passageId, guide)
    const passage = passageById.get(guide.passageId)
    if (!passage) {
      pushIssue(issues, 'missing_theme_guide', guide.passageId, 'Every theme guide must point to a real passage.')
      continue
    }

    validateThemeGuideAgainstPassage(pack, passage, guide, issues)
  }

  for (const passage of pack.passages) {
    if (!guideByPassageId.has(passage.passageIdentifier)) {
      pushIssue(issues, 'missing_theme_guide', passage.passageIdentifier, 'Every passage needs exactly one theme guide.')
    }
  }
}

function validateThemeGuideAgainstPassage(
  pack: ContentPack,
  passage: ContentPack['passages'][number],
  guide: NonNullable<ContentPack['themeGuides']>[number],
  issues: ContentPackAuditIssue[],
) {
  const sentenceIds = new Set((passage.sentences ?? []).map((sentence) => sentence.sentenceId))
  const normalizedTheme = normalizeThemeGuideText(guide.bestSupportedTheme)
  const normalizedTopic = normalizeThemeGuideText(guide.topicLabel)
  const normalizedTopicDistractor = normalizeThemeGuideText(guide.topicDistractor)
  const normalizedSummaryDistractor = normalizeThemeGuideText(guide.summaryDistractor)

  if (!guide.topicLabel || !guide.bestSupportedTheme || !guide.topicDistractor || !guide.summaryDistractor) {
    pushIssue(issues, 'theme_guide_structure_invalid', guide.passageId, 'Theme guides need topic, theme, and distractor text.')
  }
  if (normalizedTheme === normalizedTopic) {
    pushIssue(issues, 'theme_guide_structure_invalid', guide.passageId, 'The best-supported theme must not repeat the topic.')
  }
  if (normalizedTheme === normalizedTopicDistractor) {
    pushIssue(issues, 'theme_guide_structure_invalid', guide.passageId, 'The best-supported theme must be distinct from the topic distractor.')
  }
  if (normalizedTheme === normalizedSummaryDistractor) {
    pushIssue(issues, 'theme_guide_structure_invalid', guide.passageId, 'The best-supported theme must be distinct from the summary distractor.')
  }
  if (normalizeThemeGuideText(guide.bestSupportedTheme).split(' ').filter(Boolean).length < 4) {
    pushIssue(issues, 'theme_guide_structure_invalid', guide.passageId, 'The best-supported theme should be a complete thought.')
  }

  if (guide.supportingSentenceIds.length < 2) {
    pushIssue(issues, 'theme_guide_structure_invalid', guide.passageId, 'Each theme needs at least two supporting sentences.')
  }
  if (guide.characterActionSentenceIds.length < 1) {
    pushIssue(issues, 'theme_guide_structure_invalid', guide.passageId, 'Each theme needs at least one supporting character action.')
  }
  if (guide.importantEventSentenceIds.length < 1) {
    pushIssue(issues, 'theme_guide_structure_invalid', guide.passageId, 'Each theme needs at least one supporting event.')
  }
  if (!guide.outcomeSentenceId) {
    pushIssue(issues, 'theme_guide_structure_invalid', guide.passageId, 'Each theme needs an outcome sentence.')
  }

  for (const sentenceId of [
    ...guide.supportingSentenceIds,
    ...guide.characterActionSentenceIds,
    ...guide.importantEventSentenceIds,
    guide.outcomeSentenceId,
  ]) {
    if (!sentenceId || !sentenceIds.has(sentenceId)) {
      pushIssue(issues, 'missing_support_sentence', guide.passageId, 'Theme guide sentence IDs must resolve to the authored passage.')
    }
  }

  if (guide.reviewStatus !== 'DRAFT') {
    pushIssue(issues, 'missing_draft_status', guide.passageId, 'Theme guides in this pack must remain DRAFT.')
  }
  if (guide.contentVersion !== pack.manifest.contentVersion) {
    pushIssue(issues, 'mismatched_content_version', guide.passageId, 'Theme guide content version must match the pack version.')
  }
}

function validateTextFeatureGuideStructure(pack: ContentPack, issues: ContentPackAuditIssue[]) {
  const guides = pack.textFeatureGuides ?? []
  const passageById = new Map(pack.passages.map((passage) => [passage.passageIdentifier, passage] as const))
  const guideByPassageId = new Map<string, NonNullable<ContentPack['textFeatureGuides']>[number]>()

  if (guides.length !== pack.passages.length) {
    pushIssue(
      issues,
      'text_feature_guide_count_mismatch',
      pack.manifest.packId,
      `Expected ${pack.passages.length} text feature guides, found ${guides.length}.`,
    )
  }

  for (const guide of guides) {
    if (guideByPassageId.has(guide.passageId)) {
      pushIssue(issues, 'text_feature_guide_invalid', guide.passageId, 'Text feature guides must not duplicate a passage ID.')
      continue
    }
    guideByPassageId.set(guide.passageId, guide)
    const passage = passageById.get(guide.passageId)
    if (!passage) {
      pushIssue(issues, 'missing_text_feature_guide', guide.passageId, 'Every text feature guide must point to a real passage.')
      continue
    }

    validateTextFeatureGuideAgainstPassage(pack, passage, guide, issues)
  }

  for (const passage of pack.passages) {
    if (!guideByPassageId.has(passage.passageIdentifier)) {
      pushIssue(issues, 'missing_text_feature_guide', passage.passageIdentifier, 'Every passage needs exactly one text feature guide.')
    }
  }
}

function validateTextFeatureGuideAgainstPassage(
  pack: ContentPack,
  passage: ContentPack['passages'][number],
  guide: NonNullable<ContentPack['textFeatureGuides']>[number],
  issues: ContentPackAuditIssue[],
) {
  const sentenceIds = new Set((passage.sentences ?? []).map((sentence) => sentence.sentenceId))
  const structure = passage.informationalStructure
  const features = structure?.features ?? []
  const featuresById = new Map(features.map((feature) => [feature.featureId, feature] as const))
  const seenFeatureIds = new Set<string>()

  if (passage.contentKind !== 'informational' || !structure) {
    pushIssue(issues, 'text_feature_guide_invalid', guide.passageId, 'Text feature guides require an informational passage structure.')
    return
  }
  if (!guide.combinedFeatureExplanation.trim()) {
    pushIssue(issues, 'text_feature_guide_invalid', guide.passageId, 'Text feature guides need a combined feature explanation.')
  }
  if (guide.featureContributions.length !== features.length) {
    pushIssue(issues, 'text_feature_guide_invalid', guide.passageId, 'Text feature guides must cover every authored feature exactly once.')
  }
  if (guide.reviewStatus !== 'DRAFT') {
    pushIssue(issues, 'missing_draft_status', guide.passageId, 'Text feature guides in this pack must remain DRAFT.')
  }
  if (guide.contentVersion !== pack.manifest.contentVersion) {
    pushIssue(issues, 'mismatched_content_version', guide.passageId, 'Text feature guide content version must match the pack version.')
  }

  for (const contribution of guide.featureContributions) {
    const feature = featuresById.get(contribution.featureId)
    if (!feature) {
      pushIssue(issues, 'text_feature_guide_invalid', contribution.featureId, 'Feature contributions must point to an authored feature.')
      continue
    }
    if (seenFeatureIds.has(contribution.featureId)) {
      pushIssue(issues, 'text_feature_guide_invalid', contribution.featureId, 'Feature contributions must be unique.')
      continue
    }
    seenFeatureIds.add(contribution.featureId)

    if (feature.kind !== contribution.featureKind) {
      pushIssue(issues, 'text_feature_guide_invalid', contribution.featureId, 'Feature contribution kind must match the authored feature.')
    }
    if (!contribution.contributionStatement.trim() || contribution.contributionStatement.trim().split(/\s+/).length < 4) {
      pushIssue(issues, 'text_feature_guide_invalid', contribution.featureId, 'Feature contribution statements must explain meaning in a complete thought.')
    }
    if (!Array.isArray(contribution.relatedSentenceIds) || contribution.relatedSentenceIds.length === 0) {
      pushIssue(issues, 'text_feature_guide_invalid', contribution.featureId, 'Feature contributions need at least one related sentence.')
    }
    const relatedIds = new Set(contribution.relatedSentenceIds)
    if (relatedIds.size !== contribution.relatedSentenceIds.length) {
      pushIssue(issues, 'text_feature_guide_invalid', contribution.featureId, 'Related sentence IDs must be unique.')
    }
    for (const sentenceId of contribution.relatedSentenceIds) {
      if (!sentenceIds.has(sentenceId)) {
        pushIssue(issues, 'missing_support_sentence', contribution.featureId, 'Text feature guide sentence IDs must resolve to the authored passage.')
      }
    }
  }
}

function validateCentralIdeaGuideStructure(pack: ContentPack, issues: ContentPackAuditIssue[]) {
  const guides = pack.centralIdeaGuides ?? []
  const passageById = new Map(pack.passages.map((passage) => [passage.passageIdentifier, passage] as const))
  const guideByPassageId = new Map<string, NonNullable<ContentPack['centralIdeaGuides']>[number]>()
  const checkpointPassageIds = new Set(
    pack.lessons
      .filter((lesson) => lesson.selectionStatus === 'active' && lesson.lessonRole === 'CHECKPOINT')
      .flatMap((lesson) => lesson.passageIdentifiers),
  )

  if (guides.length !== pack.passages.length) {
    pushIssue(
      issues,
      'central_idea_guide_count_mismatch',
      pack.manifest.packId,
      `Expected ${pack.passages.length} central idea guides, found ${guides.length}.`,
    )
  }

  for (const guide of guides) {
    if (guideByPassageId.has(guide.passageId)) {
      pushIssue(issues, 'central_idea_guide_invalid', guide.passageId, 'Central idea guides must not duplicate a passage ID.')
      continue
    }
    guideByPassageId.set(guide.passageId, guide)
    const passage = passageById.get(guide.passageId)
    if (!passage) {
      pushIssue(issues, 'missing_central_idea_guide', guide.passageId, 'Every central idea guide must point to a real passage.')
      continue
    }

    validateCentralIdeaGuideAgainstPassage(pack, passage, guide, checkpointPassageIds, issues)
  }

  for (const passage of pack.passages) {
    if (!guideByPassageId.has(passage.passageIdentifier)) {
      pushIssue(issues, 'missing_central_idea_guide', passage.passageIdentifier, 'Every passage needs exactly one central idea guide.')
    }
  }
}

function validateCentralIdeaGuideAgainstPassage(
  pack: ContentPack,
  passage: ContentPack['passages'][number],
  guide: NonNullable<ContentPack['centralIdeaGuides']>[number],
  checkpointPassageIds: Set<string>,
  issues: ContentPackAuditIssue[],
) {
  const structure = passage.informationalStructure
  const features = structure?.features ?? []
  const titleFeature = features.find((feature) => feature.kind === 'title')
  const sentenceIds = new Set((passage.sentences ?? []).map((sentence) => sentence.sentenceId))
  const sectionBySentenceId = new Map<string, string>()
  for (const section of structure?.sections ?? []) {
    for (const sentenceId of section.sentenceIds) {
      sectionBySentenceId.set(sentenceId, section.sectionId)
    }
  }

  if (passage.contentKind !== 'informational' || !structure || !titleFeature) {
    pushIssue(issues, 'central_idea_guide_invalid', guide.passageId, 'Central idea guides require an informational passage structure with a title.')
    return
  }
  if (!guide.topicLabel.trim()) {
    pushIssue(issues, 'central_idea_guide_invalid', guide.passageId, 'Central idea guides need a topic label.')
  }
  if (!guide.centralIdeaStatement.trim()) {
    pushIssue(issues, 'central_idea_guide_invalid', guide.passageId, 'Central idea guides need a central idea statement.')
  }
  if (!looksLikeCompleteThought(guide.centralIdeaStatement)) {
    pushIssue(issues, 'central_idea_guide_invalid', guide.passageId, 'Central idea statements must be complete thoughts.')
  }

  const normalizedTopic = normalizeGuideText(guide.topicLabel)
  const normalizedIdea = normalizeGuideText(guide.centralIdeaStatement)
  const normalizedTitle = normalizeGuideText(titleFeature.text)
  if (normalizedTopic && normalizedTopic === normalizedIdea) {
    pushIssue(issues, 'central_idea_guide_invalid', guide.passageId, 'Central idea statements must differ from the topic.')
  }
  if (normalizedIdea && normalizedIdea === normalizedTitle) {
    pushIssue(issues, 'central_idea_guide_invalid', guide.passageId, 'Central idea statements must differ from the title.')
  }
  if (guide.centralIdeaMode !== 'stated' && guide.centralIdeaMode !== 'inferred') {
    pushIssue(issues, 'central_idea_guide_invalid', guide.passageId, 'Central idea guides must use a stated or inferred mode.')
  }
  if (guide.centralIdeaMode === 'stated') {
    if (!guide.explicitCentralIdeaSentenceId?.trim()) {
      pushIssue(issues, 'central_idea_guide_invalid', guide.passageId, 'Stated central ideas need an explicit sentence ID.')
    }
  } else if (guide.explicitCentralIdeaSentenceId) {
    pushIssue(issues, 'central_idea_guide_invalid', guide.passageId, 'Inferred central ideas must not claim an explicit sentence ID.')
  }
  if (guide.explicitCentralIdeaSentenceId && !sentenceIds.has(guide.explicitCentralIdeaSentenceId)) {
    pushIssue(issues, 'invalid_informational_feature_reference', guide.explicitCentralIdeaSentenceId, 'Central idea sentence IDs must resolve to the authored passage.')
  }
  if (guide.reviewStatus !== 'DRAFT') {
    pushIssue(issues, 'missing_draft_status', guide.passageId, 'Central idea guides in this pack must remain DRAFT.')
  }
  if (guide.contentVersion !== pack.manifest.contentVersion) {
    pushIssue(issues, 'mismatched_content_version', guide.passageId, 'Central idea guide content version must match the pack version.')
  }
  if (guide.topicLabel.includes('<') || guide.centralIdeaStatement.includes('<') || guide.topicLabel.includes('http://') || guide.topicLabel.includes('https://') || guide.centralIdeaStatement.includes('http://') || guide.centralIdeaStatement.includes('https://')) {
    pushIssue(issues, 'central_idea_guide_invalid', guide.passageId, 'Central idea guide text must not contain raw HTML or remote URLs.')
  }

  const relevantIds = new Set(guide.relevantEvidenceIds)
  const otherIds = new Set(guide.otherEvidenceIds)
  if (relevantIds.size !== guide.relevantEvidenceIds.length) {
    pushIssue(issues, 'central_idea_guide_invalid', guide.passageId, 'Relevant evidence IDs must be unique.')
  }
  if (otherIds.size !== guide.otherEvidenceIds.length) {
    pushIssue(issues, 'central_idea_guide_invalid', guide.passageId, 'Other evidence IDs must be unique.')
  }
  for (const evidenceId of guide.relevantEvidenceIds) {
    if (guide.otherEvidenceIds.includes(evidenceId)) {
      pushIssue(issues, 'central_idea_guide_invalid', guide.passageId, 'Relevant and other evidence IDs must not overlap.')
      break
    }
  }

  const requiredRelevantCount = checkpointPassageIds.has(passage.passageIdentifier) ? 4 : 3
  if (guide.relevantEvidenceIds.length < requiredRelevantCount) {
    pushIssue(issues, 'central_idea_guide_invalid', guide.passageId, `Central idea guides need at least ${requiredRelevantCount} relevant evidence IDs.`)
  }
  const relevantSentenceIds = guide.relevantEvidenceIds.filter((evidenceId) => sentenceIds.has(evidenceId))
  if (relevantSentenceIds.length < 2) {
    pushIssue(issues, 'central_idea_guide_invalid', guide.passageId, 'Central idea guides need at least two body sentence evidence references.')
  }
  if (checkpointPassageIds.has(passage.passageIdentifier)) {
    const relevantSectionIds = new Set(
      relevantSentenceIds
        .map((sentenceId) => sectionBySentenceId.get(sentenceId))
        .filter((sectionId): sectionId is string => Boolean(sectionId)),
    )
    if (relevantSectionIds.size < 2) {
      pushIssue(issues, 'central_idea_guide_invalid', guide.passageId, 'Checkpoint central idea guides must draw relevant details from at least two sections.')
    }
  }

  for (const evidenceId of [...guide.relevantEvidenceIds, ...guide.otherEvidenceIds]) {
    if (!resolvePassageEvidence(passage, evidenceId)) {
      pushIssue(issues, 'invalid_informational_feature_reference', evidenceId, 'Central idea evidence IDs must resolve to authored passage evidence.')
    }
  }
}

function validateAuthorPurposeGuideStructure(pack: ContentPack, issues: ContentPackAuditIssue[]) {
  const guides = pack.authorPurposeGuides ?? []
  const passageById = new Map(pack.passages.map((passage) => [passage.passageIdentifier, passage] as const))
  const guideByPassageId = new Map<string, NonNullable<ContentPack['authorPurposeGuides']>[number]>()
  const checkpointPassageIds = new Set(
    pack.lessons
      .filter((lesson) => lesson.selectionStatus === 'active' && lesson.lessonRole === 'CHECKPOINT')
      .flatMap((lesson) => lesson.passageIdentifiers),
  )

  if (guides.length !== pack.passages.length) {
    pushIssue(
      issues,
      'author_purpose_guide_count_mismatch',
      pack.manifest.packId,
      `Expected ${pack.passages.length} author purpose guides, found ${guides.length}.`,
    )
  }

  for (const guide of guides) {
    if (guideByPassageId.has(guide.passageId)) {
      pushIssue(issues, 'author_purpose_guide_invalid', guide.passageId, 'Author purpose guides must not duplicate a passage ID.')
      continue
    }
    guideByPassageId.set(guide.passageId, guide)
    const passage = passageById.get(guide.passageId)
    if (!passage) {
      pushIssue(issues, 'missing_author_purpose_guide', guide.passageId, 'Every author purpose guide must point to a real passage.')
      continue
    }

    validateAuthorPurposeGuideAgainstPassage(pack, passage, guide, checkpointPassageIds, issues)
  }

  for (const passage of pack.passages) {
    if (!guideByPassageId.has(passage.passageIdentifier)) {
      pushIssue(issues, 'missing_author_purpose_guide', passage.passageIdentifier, 'Every passage needs exactly one author purpose guide.')
    }
  }
}

function validateAuthorPurposeGuideAgainstPassage(
  pack: ContentPack,
  passage: ContentPack['passages'][number],
  guide: NonNullable<ContentPack['authorPurposeGuides']>[number],
  checkpointPassageIds: Set<string>,
  issues: ContentPackAuditIssue[],
) {
  const structure = passage.informationalStructure
  const features = structure?.features ?? []
  const titleFeature = features.find((feature) => feature.kind === 'title')
  const sentenceIds = new Set((passage.sentences ?? []).map((sentence) => sentence.sentenceId))
  const sectionBySentenceId = new Map<string, string>()
  for (const section of structure?.sections ?? []) {
    for (const sentenceId of section.sentenceIds) {
      sectionBySentenceId.set(sentenceId, section.sectionId)
    }
  }

  if (passage.contentKind !== 'informational' || !structure || !titleFeature) {
    pushIssue(issues, 'author_purpose_guide_invalid', guide.passageId, 'Author purpose guides require an informational passage structure with a title.')
    return
  }
  if (!guide.topicLabel.trim()) {
    pushIssue(issues, 'author_purpose_guide_invalid', guide.passageId, 'Author purpose guides need a topic label.')
  }
  if (!guide.specificPurposeStatement.trim()) {
    pushIssue(issues, 'author_purpose_guide_invalid', guide.passageId, 'Author purpose guides need a specific purpose statement.')
  }

  const normalizedTopic = normalizeGuideText(guide.topicLabel)
  const normalizedPurpose = normalizeGuideText(guide.specificPurposeStatement)
  const normalizedTitle = normalizeGuideText(titleFeature.text)
  if (normalizedTopic && normalizedTopic === normalizedPurpose) {
    pushIssue(issues, 'author_purpose_guide_invalid', guide.passageId, 'Purpose statements must differ from the topic.')
  }
  if (normalizedPurpose && normalizedPurpose === normalizedTitle) {
    pushIssue(issues, 'author_purpose_guide_invalid', guide.passageId, 'Purpose statements must differ from the title.')
  }
  if (!normalizedPurpose.startsWith('to ')) {
    pushIssue(issues, 'author_purpose_guide_invalid', guide.passageId, 'Purpose statements should begin with to and name the author goal.')
  }
  if (normalizedPurpose === 'to inform' || normalizedPurpose === 'to entertain' || normalizedPurpose === 'to persuade') {
    pushIssue(issues, 'author_purpose_guide_invalid', guide.passageId, 'Purpose statements must be more specific than a generic label.')
  }
  if (!looksLikeCompleteThought(guide.specificPurposeStatement)) {
    pushIssue(issues, 'author_purpose_guide_invalid', guide.passageId, 'Purpose statements must be complete thoughts.')
  }
  if (
    guide.purposeKind !== 'explain-how' &&
    guide.purposeKind !== 'describe' &&
    guide.purposeKind !== 'teach-about' &&
    guide.purposeKind !== 'explain-process' &&
    guide.purposeKind !== 'explain-why' &&
    guide.purposeKind !== 'provide-facts'
  ) {
    pushIssue(issues, 'author_purpose_guide_invalid', guide.passageId, 'Author purpose guides must use a valid purpose kind.')
  }
  if (guide.reviewStatus !== 'DRAFT') {
    pushIssue(issues, 'missing_draft_status', guide.passageId, 'Author purpose guides in this pack must remain DRAFT.')
  }
  if (guide.contentVersion !== pack.manifest.contentVersion) {
    pushIssue(issues, 'mismatched_content_version', guide.passageId, 'Author purpose guide content version must match the pack version.')
  }
  if (guide.topicLabel.includes('<') || guide.specificPurposeStatement.includes('<') || guide.topicLabel.includes('http://') || guide.topicLabel.includes('https://') || guide.specificPurposeStatement.includes('http://') || guide.specificPurposeStatement.includes('https://')) {
    pushIssue(issues, 'author_purpose_guide_invalid', guide.passageId, 'Author purpose guide text must not contain raw HTML or remote URLs.')
  }

  const purposeIds = new Set(guide.purposeEvidenceIds)
  const secondaryIds = new Set(guide.secondaryDetailIds)
  if (purposeIds.size !== guide.purposeEvidenceIds.length) {
    pushIssue(issues, 'author_purpose_guide_invalid', guide.passageId, 'Purpose evidence IDs must be unique.')
  }
  if (secondaryIds.size !== guide.secondaryDetailIds.length) {
    pushIssue(issues, 'author_purpose_guide_invalid', guide.passageId, 'Secondary detail IDs must be unique.')
  }
  for (const evidenceId of guide.purposeEvidenceIds) {
    if (guide.secondaryDetailIds.includes(evidenceId)) {
      pushIssue(issues, 'author_purpose_guide_invalid', guide.passageId, 'Purpose evidence and secondary detail IDs must not overlap.')
      break
    }
  }

  const requiredPurposeCount = checkpointPassageIds.has(passage.passageIdentifier) ? 4 : 3
  if (guide.purposeEvidenceIds.length < requiredPurposeCount) {
    pushIssue(issues, 'author_purpose_guide_invalid', guide.passageId, `Author purpose guides need at least ${requiredPurposeCount} purpose evidence IDs.`)
  }
  const purposeSentenceIds = guide.purposeEvidenceIds.filter((evidenceId) => sentenceIds.has(evidenceId))
  if (purposeSentenceIds.length < 2) {
    pushIssue(issues, 'author_purpose_guide_invalid', guide.passageId, 'Author purpose guides need at least two body sentence evidence references.')
  }
  if (checkpointPassageIds.has(passage.passageIdentifier)) {
    const purposeSectionIds = new Set(
      purposeSentenceIds
        .map((sentenceId) => sectionBySentenceId.get(sentenceId))
        .filter((sectionId): sectionId is string => Boolean(sectionId)),
    )
    if (purposeSectionIds.size < 2) {
      pushIssue(issues, 'author_purpose_guide_invalid', guide.passageId, 'Checkpoint purpose guides must draw clues from at least two sections.')
    }
  }

  for (const evidenceId of [...guide.purposeEvidenceIds, ...guide.secondaryDetailIds]) {
    if (!resolvePassageEvidence(passage, evidenceId)) {
      pushIssue(issues, 'invalid_informational_feature_reference', evidenceId, 'Author purpose evidence IDs must resolve to authored passage evidence.')
    }
  }
}

function validateAuthorOpinionGuideStructure(pack: ContentPack, issues: ContentPackAuditIssue[]) {
  const guides = pack.authorOpinionGuides ?? []
  const passageById = new Map(pack.passages.map((passage) => [passage.passageIdentifier, passage] as const))
  const guideByPassageId = new Map<string, NonNullable<ContentPack['authorOpinionGuides']>[number]>()
  const checkpointPassageIds = new Set(
    pack.lessons
      .filter((lesson) => lesson.selectionStatus === 'active' && lesson.lessonRole === 'CHECKPOINT')
      .flatMap((lesson) => lesson.passageIdentifiers),
  )

  if (guides.length !== pack.passages.length) {
    pushIssue(
      issues,
      'author_opinion_guide_count_mismatch',
      pack.manifest.packId,
      `Expected ${pack.passages.length} author opinion guides, found ${guides.length}.`,
    )
  }

  let oneOpinionPassageCount = 0
  let twoOpinionPassageCount = 0

  for (const guide of guides) {
    if (guideByPassageId.has(guide.passageId)) {
      pushIssue(issues, 'author_opinion_guide_invalid', guide.passageId, 'Author opinion guides must not duplicate a passage ID.')
      continue
    }
    guideByPassageId.set(guide.passageId, guide)
    const passage = passageById.get(guide.passageId)
    if (!passage) {
      pushIssue(issues, 'missing_author_opinion_guide', guide.passageId, 'Every author opinion guide must point to a real passage.')
      continue
    }

    const opinionCount = guide.opinions?.length ?? 0
    if (opinionCount === 1) oneOpinionPassageCount += 1
    if (opinionCount === 2) twoOpinionPassageCount += 1

    validateAuthorOpinionGuideAgainstPassage(pack, passage, guide, checkpointPassageIds, issues)
  }

  if (oneOpinionPassageCount < 5) {
    pushIssue(issues, 'author_opinion_guide_invalid', pack.manifest.packId, 'At least five passages must contain one focal opinion.')
  }
  if (twoOpinionPassageCount < 2) {
    pushIssue(issues, 'author_opinion_guide_invalid', pack.manifest.packId, 'At least two passages must contain two related opinions.')
  }

  for (const passage of pack.passages) {
    if (!guideByPassageId.has(passage.passageIdentifier)) {
      pushIssue(issues, 'missing_author_opinion_guide', passage.passageIdentifier, 'Every passage needs exactly one author opinion guide.')
    }
  }
}

function validateAuthorOpinionGuideAgainstPassage(
  pack: ContentPack,
  passage: ContentPack['passages'][number],
  guide: NonNullable<ContentPack['authorOpinionGuides']>[number],
  checkpointPassageIds: Set<string>,
  issues: ContentPackAuditIssue[],
) {
  const structure = passage.informationalStructure
  const features = structure?.features ?? []
  const titleFeature = features.find((feature) => feature.kind === 'title')
  const sentenceById = new Map((passage.sentences ?? []).map((sentence) => [sentence.sentenceId, sentence] as const))
  const sectionBySentenceId = new Map<string, string>()
  for (const section of structure?.sections ?? []) {
    for (const sentenceId of section.sentenceIds) {
      sectionBySentenceId.set(sentenceId, section.sectionId)
    }
  }

  if (passage.contentKind !== 'informational' || !structure || !titleFeature) {
    pushIssue(issues, 'author_opinion_guide_invalid', guide.passageId, 'Author opinion guides require an informational passage structure with a title.')
    return
  }
  if (!guide.topicLabel.trim()) {
    pushIssue(issues, 'author_opinion_guide_invalid', guide.passageId, 'Author opinion guides need a topic label.')
  }
  if (guide.opinions.length < 1 || guide.opinions.length > 2) {
    pushIssue(issues, 'author_opinion_guide_invalid', guide.passageId, 'Author opinion guides must contain one or two opinions.')
  }

  const normalizedTopic = normalizeGuideText(guide.topicLabel)
  const normalizedTitle = normalizeGuideText(titleFeature.text)
  const seenOpinionIds = new Set<string>()

  for (const opinion of guide.opinions) {
    if (!opinion.opinionId.trim()) {
      pushIssue(issues, 'author_opinion_guide_invalid', guide.passageId, 'Opinion IDs are required.')
      continue
    }
    if (seenOpinionIds.has(opinion.opinionId)) {
      pushIssue(issues, 'author_opinion_guide_invalid', opinion.opinionId, 'Opinion IDs must be unique.')
      continue
    }
    seenOpinionIds.add(opinion.opinionId)

    if (!opinion.opinionStatement.trim()) {
      pushIssue(issues, 'author_opinion_guide_invalid', opinion.opinionId, 'Opinion statements are required.')
    }
    if (!looksLikeCompleteThought(opinion.opinionStatement)) {
      pushIssue(issues, 'author_opinion_guide_invalid', opinion.opinionId, 'Opinion statements must be complete thoughts.')
    }
    if (!looksLikeOpinionStatement(opinion.opinionStatement)) {
      pushIssue(issues, 'author_opinion_guide_invalid', opinion.opinionId, 'Opinion statements must clearly express what the author thinks or recommends.')
    }

    const normalizedOpinion = normalizeGuideText(opinion.opinionStatement)
    if (normalizedTopic && normalizedOpinion === normalizedTopic) {
      pushIssue(issues, 'author_opinion_guide_invalid', opinion.opinionId, 'Opinion statements must differ from the topic.')
    }
    if (normalizedOpinion && normalizedOpinion === normalizedTitle) {
      pushIssue(issues, 'author_opinion_guide_invalid', opinion.opinionId, 'Opinion statements must differ from the title.')
    }

    if (!opinion.opinionSentenceId.trim()) {
      pushIssue(issues, 'author_opinion_guide_invalid', opinion.opinionId, 'Opinion sentence IDs are required.')
    }
    const opinionSentence = sentenceById.get(opinion.opinionSentenceId)
    if (!opinionSentence) {
      pushIssue(issues, 'invalid_author_opinion_feature_reference', opinion.opinionSentenceId, 'Opinion sentence IDs must resolve to the authored passage.')
    } else if (normalizeGuideText(opinionSentence.text) !== normalizedOpinion) {
      pushIssue(issues, 'author_opinion_guide_invalid', opinion.opinionId, 'Opinion sentence text must match the authored opinion statement.')
    }

    const evidenceIds = new Set(opinion.supportingEvidenceIds)
    if (evidenceIds.size !== opinion.supportingEvidenceIds.length) {
      pushIssue(issues, 'author_opinion_guide_invalid', opinion.opinionId, 'Supporting evidence IDs must be unique.')
    }
    const requiredEvidenceCount = checkpointPassageIds.has(passage.passageIdentifier) ? 3 : 2
    if (opinion.supportingEvidenceIds.length < requiredEvidenceCount) {
      pushIssue(issues, 'author_opinion_guide_invalid', opinion.opinionId, `Opinion evidence needs at least ${requiredEvidenceCount} evidence IDs.`)
    }
    const bodyEvidenceIds = opinion.supportingEvidenceIds.filter((evidenceId) => sentenceById.has(evidenceId))
    if (bodyEvidenceIds.length < 1) {
      pushIssue(issues, 'author_opinion_guide_invalid', opinion.opinionId, 'Every opinion needs at least one body sentence evidence reference.')
    }
    if (checkpointPassageIds.has(passage.passageIdentifier)) {
      if (bodyEvidenceIds.length < 2) {
        pushIssue(issues, 'author_opinion_guide_invalid', opinion.opinionId, 'Checkpoint opinion evidence needs at least two body sentence references.')
      }
      const relevantSectionIds = new Set(
        bodyEvidenceIds
          .map((sentenceId) => sectionBySentenceId.get(sentenceId))
          .filter((sectionId): sectionId is string => Boolean(sectionId)),
      )
      if (relevantSectionIds.size < 2) {
        pushIssue(issues, 'author_opinion_guide_invalid', opinion.opinionId, 'Checkpoint opinion evidence must span at least two sections.')
      }
    }
    if (!opinion.evidenceConnectionStatement.trim()) {
      pushIssue(issues, 'author_opinion_guide_invalid', opinion.opinionId, 'Evidence connection statements are required.')
    } else if (!/\b(because|shows|supports|helps)\b/i.test(opinion.evidenceConnectionStatement)) {
      pushIssue(issues, 'author_opinion_guide_invalid', opinion.opinionId, 'Evidence connection statements should connect the evidence to the opinion.')
    }

    if (opinion.opinionStatement.includes('<') || opinion.opinionStatement.includes('http://') || opinion.opinionStatement.includes('https://') || opinion.evidenceConnectionStatement.includes('<') || opinion.evidenceConnectionStatement.includes('http://') || opinion.evidenceConnectionStatement.includes('https://')) {
      pushIssue(issues, 'author_opinion_guide_invalid', opinion.opinionId, 'Opinion guide text must not contain raw HTML or remote URLs.')
    }

    for (const evidenceId of opinion.supportingEvidenceIds) {
      if (!resolvePassageEvidence(passage, evidenceId)) {
        pushIssue(issues, 'invalid_author_opinion_feature_reference', evidenceId, 'Opinion evidence IDs must resolve to authored passage evidence.')
      }
    }
  }

  const factEvidenceIds = new Set(guide.factEvidenceIds)
  const otherDetailIds = new Set(guide.otherDetailIds)
  if (factEvidenceIds.size !== guide.factEvidenceIds.length) {
    pushIssue(issues, 'author_opinion_guide_invalid', guide.passageId, 'Fact evidence IDs must be unique.')
  }
  if (otherDetailIds.size !== guide.otherDetailIds.length) {
    pushIssue(issues, 'author_opinion_guide_invalid', guide.passageId, 'Other detail IDs must be unique.')
  }
  if (guide.factEvidenceIds.length < 1) {
    pushIssue(issues, 'author_opinion_guide_invalid', guide.passageId, 'Author opinion guides need at least one fact evidence ID.')
  }
  if (guide.otherDetailIds.length < 1) {
    pushIssue(issues, 'author_opinion_guide_invalid', guide.passageId, 'Author opinion guides need at least one other detail ID.')
  }

  const opinionEvidenceIds = new Set(guide.opinions.flatMap((opinion) => opinion.supportingEvidenceIds))
  for (const detailId of guide.otherDetailIds) {
    if (opinionEvidenceIds.has(detailId)) {
      pushIssue(issues, 'author_opinion_guide_invalid', detailId, 'Other detail IDs must not overlap opinion evidence IDs.')
    }
  }

  if (guide.reviewStatus !== 'DRAFT') {
    pushIssue(issues, 'missing_draft_status', guide.passageId, 'Author opinion guides in this pack must remain DRAFT.')
  }
  if (guide.contentVersion !== pack.manifest.contentVersion) {
    pushIssue(issues, 'mismatched_content_version', guide.passageId, 'Author opinion guide content version must match the pack version.')
  }

  for (const evidenceId of [...guide.factEvidenceIds, ...guide.otherDetailIds]) {
    if (!resolvePassageEvidence(passage, evidenceId)) {
      pushIssue(issues, 'invalid_author_opinion_feature_reference', evidenceId, 'Author opinion guide evidence IDs must resolve to authored passage evidence.')
    }
  }
}

function validateAcademicVocabularyGuideStructure(pack: ContentPack, issues: ContentPackAuditIssue[]) {
  const guides = pack.academicVocabularyGuides ?? []
  const passageById = new Map(pack.passages.map((passage) => [passage.passageIdentifier, passage] as const))
  const guideByPassageId = new Map<string, NonNullable<ContentPack['academicVocabularyGuides']>[number]>()
  const sentenceIdsByPassageId = new Map(
    pack.passages.map((passage) => [passage.passageIdentifier, new Set((passage.sentences ?? []).map((sentence) => sentence.sentenceId))] as const),
  )
  const allowedWords = new Set([
    'compare',
    'describe',
    'explain',
    'identify',
    'observe',
    'predict',
    'reason',
    'result',
    'example',
    'detail',
    'sequence',
    'measure',
    'record',
    'category',
  ])
  const wordCounts = new Map<string, number>()

  if (guides.length !== pack.passages.length) {
    pushIssue(
      issues,
      'academic_vocabulary_guide_count_mismatch',
      pack.manifest.packId,
      `Expected ${pack.passages.length} academic vocabulary guides, found ${guides.length}.`,
    )
  }

  for (const guide of guides) {
    if (guideByPassageId.has(guide.passageId)) {
      pushIssue(issues, 'academic_vocabulary_guide_invalid', guide.passageId, 'Academic vocabulary guides must not duplicate a passage ID.')
      continue
    }
    guideByPassageId.set(guide.passageId, guide)
    const passage = passageById.get(guide.passageId)
    if (!passage) {
      pushIssue(issues, 'missing_academic_vocabulary_guide', guide.passageId, 'Every academic vocabulary guide must point to a real passage.')
      continue
    }
    const sentenceIds = sentenceIdsByPassageId.get(guide.passageId) ?? new Set<string>()

    if (guide.targets.length !== 4) {
      pushIssue(issues, 'academic_vocabulary_guide_invalid', guide.passageId, 'Academic vocabulary guides must contain exactly four targets.')
    }
    if (guide.reviewStatus !== 'DRAFT') {
      pushIssue(issues, 'missing_draft_status', guide.passageId, 'Academic vocabulary guides in this pack must remain DRAFT.')
    }
    if (guide.contentVersion !== pack.manifest.contentVersion) {
      pushIssue(issues, 'mismatched_content_version', guide.passageId, 'Academic vocabulary guide content version must match the pack version.')
    }
    if (
      guide.passageId.includes('<') || guide.passageId.includes('http://') || guide.passageId.includes('https://')
      || guide.targets.some((target) => [target.targetId, target.word, target.childFriendlyMeaning, target.speakingExample, target.writingExample].some((text) => text.includes('<') || text.includes('http://') || text.includes('https://')))
    ) {
      pushIssue(issues, 'academic_vocabulary_guide_invalid', guide.passageId, 'Academic vocabulary guide text must not contain raw HTML or remote URLs.')
    }

    const seenTargetIds = new Set<string>()
    for (const target of guide.targets) {
      if (seenTargetIds.has(target.targetId)) {
        pushIssue(issues, 'academic_vocabulary_guide_invalid', target.targetId, 'Academic vocabulary target IDs must be unique.')
      } else {
        seenTargetIds.add(target.targetId)
      }

      const word = normalizeGuideText(target.word)
      if (!allowedWords.has(word)) {
        pushIssue(issues, 'academic_vocabulary_guide_invalid', target.targetId, 'Academic vocabulary targets must use approved Phase 6E5 words.')
      }
      wordCounts.set(word, (wordCounts.get(word) ?? 0) + 1)

      if (!target.childFriendlyMeaning.trim()) {
        pushIssue(issues, 'academic_vocabulary_guide_invalid', target.targetId, 'Academic vocabulary targets need a child-friendly meaning.')
      } else if (!looksLikeCompleteThought(target.childFriendlyMeaning)) {
        pushIssue(issues, 'academic_vocabulary_guide_invalid', target.targetId, 'Academic vocabulary meanings must be complete thoughts.')
      }
      if (!target.speakingExample.trim()) {
        pushIssue(issues, 'academic_vocabulary_guide_invalid', target.targetId, 'Academic vocabulary targets need a speaking example.')
      } else if (!normalizeGuideText(target.speakingExample).includes(word)) {
        pushIssue(issues, 'academic_vocabulary_guide_invalid', target.targetId, 'Speaking examples must use the target word.')
      }
      if (!target.writingExample.trim()) {
        pushIssue(issues, 'academic_vocabulary_guide_invalid', target.targetId, 'Academic vocabulary targets need a writing example.')
      } else if (!normalizeGuideText(target.writingExample).includes(word)) {
        pushIssue(issues, 'academic_vocabulary_guide_invalid', target.targetId, 'Writing examples must use the target word.')
      }
      if (!Array.isArray(target.appropriateUseSentenceIds) || target.appropriateUseSentenceIds.length < 1) {
        pushIssue(issues, 'academic_vocabulary_guide_invalid', target.targetId, 'Academic vocabulary targets need at least one appropriate-use sentence ID.')
      }
      const subjectContexts = new Set(target.subjectContexts)
      if (subjectContexts.size < 2) {
        pushIssue(issues, 'academic_vocabulary_guide_invalid', target.targetId, 'Academic vocabulary targets need at least two subject contexts.')
      }
      const hasBodySentence = target.appropriateUseSentenceIds.some((sentenceId) => sentenceIds.has(sentenceId))
      if (!hasBodySentence) {
        pushIssue(issues, 'academic_vocabulary_guide_invalid', target.targetId, 'Academic vocabulary targets need at least one body sentence evidence reference.')
      }
      for (const sentenceId of target.appropriateUseSentenceIds) {
        const evidence = resolvePassageEvidence(passage, sentenceId)
        if (!evidence) {
          pushIssue(issues, 'invalid_informational_feature_reference', sentenceId, 'Academic vocabulary target sentences must resolve to authored passage evidence.')
          continue
        }
        if (!normalizeGuideText(evidence.text).includes(word)) {
          pushIssue(issues, 'academic_vocabulary_guide_invalid', sentenceId, 'Academic vocabulary target sentences must contain the target word.')
        }
      }
    }
  }

  if (wordCounts.size !== 14) {
    pushIssue(issues, 'academic_vocabulary_guide_invalid', pack.manifest.packId, 'Academic vocabulary packs must use exactly 14 distinct target words.')
  }
  for (const [word, count] of wordCounts) {
    if (count !== 2) {
      pushIssue(issues, 'academic_vocabulary_guide_invalid', word, 'Each academic vocabulary word must appear exactly twice across the pack.')
    }
  }

  for (const passage of pack.passages) {
    if (!guideByPassageId.has(passage.passageIdentifier)) {
      pushIssue(issues, 'missing_academic_vocabulary_guide', passage.passageIdentifier, 'Every passage needs exactly one academic vocabulary guide.')
    }
  }
}

function validateMorphologyGuideStructure(pack: ContentPack, issues: ContentPackAuditIssue[]) {
  const guides = pack.morphologyGuides ?? []
  const passageById = new Map(pack.passages.map((passage) => [passage.passageIdentifier, passage] as const))
  const guideByPassageId = new Map<string, NonNullable<ContentPack['morphologyGuides']>[number]>()
  const sentenceIdsByPassageId = new Map(
    pack.passages.map((passage) => [passage.passageIdentifier, new Set((passage.sentences ?? []).map((sentence) => sentence.sentenceId))] as const),
  )
  const allowedWords = new Set([
    'unpack',
    'rebuild',
    'preheat',
    'disagree',
    'miscount',
    'helped',
    'helping',
    'slowly',
    'helpful',
    'plants',
    'boxes',
    'preview',
    'fastest',
    'faster',
    'tallest',
    'careless',
  ])
  const requiredPrefixFamilies = new Set(['prefix-un', 'prefix-re', 'prefix-pre', 'prefix-dis', 'prefix-mis'])
  const requiredSuffixFamilies = new Set(['suffix-s-es', 'suffix-ed', 'suffix-ing', 'suffix-er-est', 'suffix-ful-less', 'suffix-ly'])
  const observedPrefixFamilies = new Set<string>()
  const observedSuffixFamilies = new Set<string>()
  const checkpointPassageIds = new Set(
    pack.lessons
      .filter((lesson) => lesson.lessonRole === 'CHECKPOINT')
      .flatMap((lesson) => lesson.passageIdentifiers),
  )
  const checkpointPassagePrefixFamilyCounts = new Map<string, Set<string>>()
  const checkpointPassageSuffixKinds = new Map<string, { inflectional: boolean; derivational: boolean }>()
  const wordCounts = new Map<string, number>()

  if (guides.length !== pack.passages.length) {
    pushIssue(
      issues,
      'morphology_guide_count_mismatch',
      pack.manifest.packId,
      `Expected ${pack.passages.length} morphology guides, found ${guides.length}.`,
    )
  }

  for (const guide of guides) {
    if (guideByPassageId.has(guide.passageId)) {
      pushIssue(issues, 'morphology_guide_invalid', guide.passageId, 'Morphology guides must not duplicate a passage ID.')
      continue
    }
    guideByPassageId.set(guide.passageId, guide)
    const passage = passageById.get(guide.passageId)
    if (!passage) {
      pushIssue(issues, 'missing_morphology_guide', guide.passageId, 'Every morphology guide must point to a real passage.')
      continue
    }
    const sentenceIds = sentenceIdsByPassageId.get(guide.passageId) ?? new Set<string>()

    if (guide.targets.length !== 4) {
      pushIssue(issues, 'morphology_guide_invalid', guide.passageId, 'Morphology guides must contain exactly four targets.')
    }
    if (guide.reviewStatus !== 'DRAFT') {
      pushIssue(issues, 'missing_draft_status', guide.passageId, 'Morphology guides in this pack must remain DRAFT.')
    }
    if (guide.contentVersion !== pack.manifest.contentVersion) {
      pushIssue(issues, 'morphology_guide_invalid', guide.passageId, 'Morphology guide content version must match the pack version.')
    }
    if (
      [guide.passageId, ...guide.targets.flatMap((target) => [
        target.targetId,
        target.surfaceWord,
        target.sentenceId,
        target.baseWord,
        target.baseMeaning,
        target.composedMeaning,
        target.affixes[0]?.affixId ?? '',
        target.affixes[0]?.surfaceForm ?? '',
        target.affixes[0]?.displayLabel ?? '',
        target.affixes[0]?.commonMeaning ?? '',
      ])].some((text) => text.includes('<') || text.includes('http://') || text.includes('https://'))
    ) {
      pushIssue(issues, 'morphology_guide_invalid', guide.passageId, 'Morphology guide text must not contain raw HTML or remote URLs.')
    }

    const seenTargetIds = new Set<string>()
    for (const target of guide.targets) {
      if (seenTargetIds.has(target.targetId)) {
        pushIssue(issues, 'morphology_guide_invalid', target.targetId, 'Morphology target IDs must be unique within a guide.')
      } else {
        seenTargetIds.add(target.targetId)
      }

      const word = normalizeGuideText(target.surfaceWord)
      if (!allowedWords.has(word)) {
        pushIssue(issues, 'morphology_guide_invalid', target.targetId, 'Morphology targets must use approved Phase 6E6 words.')
      }
      wordCounts.set(word, (wordCounts.get(word) ?? 0) + 1)

      if (!target.baseWord.trim()) {
        pushIssue(issues, 'morphology_guide_invalid', target.targetId, 'Morphology targets need a base word.')
      }
      if (!target.baseMeaning.trim()) {
        pushIssue(issues, 'morphology_guide_invalid', target.targetId, 'Morphology targets need a base-word meaning.')
      } else if (!looksLikeCompleteThought(target.baseMeaning)) {
        pushIssue(issues, 'morphology_guide_invalid', target.targetId, 'Morphology base-word meanings must be complete thoughts.')
      }
      if (!target.composedMeaning.trim()) {
        pushIssue(issues, 'morphology_guide_invalid', target.targetId, 'Morphology targets need a composed meaning.')
      } else if (!looksLikeCompleteThought(target.composedMeaning)) {
        pushIssue(issues, 'morphology_guide_invalid', target.targetId, 'Morphology composed meanings must be complete thoughts.')
      }
      if (target.transparentComposition !== true) {
        pushIssue(issues, 'morphology_guide_invalid', target.targetId, 'Morphology targets must declare transparentComposition true.')
      }
      if (!Array.isArray(target.affixes) || target.affixes.length !== 1) {
        pushIssue(issues, 'morphology_guide_invalid', target.targetId, 'Morphology targets must contain exactly one affix.')
        continue
      }

      const affix = target.affixes[0]
      if (!affix.affixId.trim()) {
        pushIssue(issues, 'morphology_guide_invalid', target.targetId, 'Morphology affixes need an affix ID.')
      }
      if (affix.kind !== 'prefix' && affix.kind !== 'suffix') {
        pushIssue(issues, 'morphology_guide_invalid', target.targetId, 'Morphology affix kind must be prefix or suffix.')
      }
      if (!affix.surfaceForm.trim()) {
        pushIssue(issues, 'morphology_guide_invalid', target.targetId, 'Morphology affixes need a surface form.')
      }
      if (!affix.displayLabel.trim()) {
        pushIssue(issues, 'morphology_guide_invalid', target.targetId, 'Morphology affixes need a display label.')
      }
      if (!affix.commonMeaning.trim()) {
        pushIssue(issues, 'morphology_guide_invalid', target.targetId, 'Morphology affixes need a common meaning.')
      } else if (!looksLikeCompleteThought(affix.commonMeaning)) {
        pushIssue(issues, 'morphology_guide_invalid', target.targetId, 'Morphology affix meanings must be complete thoughts.')
      }

      const expectedWord = affix.kind === 'prefix'
        ? `${normalizeGuideText(affix.surfaceForm)}${normalizeGuideText(target.baseWord)}`
        : `${normalizeGuideText(target.baseWord)}${normalizeGuideText(affix.surfaceForm)}`
      if (expectedWord !== word) {
        pushIssue(issues, 'morphology_guide_invalid', target.targetId, 'Morphology targets must reconstruct their surface word exactly.')
      }
      if (affix.kind === 'prefix') {
        observedPrefixFamilies.add(`prefix-${normalizeGuideText(affix.surfaceForm)}`)
      } else {
        observedSuffixFamilies.add(`suffix-${getMorphologySuffixFamilyTag(normalizeGuideText(affix.surfaceForm))}`)
      }

      const passageEvidence = resolvePassageEvidence(passage, target.sentenceId)
      if (!passageEvidence) {
        pushIssue(issues, 'invalid_informational_feature_reference', target.sentenceId, 'Morphology target sentences must resolve to authored passage evidence.')
        continue
      }
      if (!sentenceIds.has(target.sentenceId)) {
        pushIssue(issues, 'missing_support_sentence', target.targetId, 'Morphology target sentence IDs must resolve to the passage.')
      }
      if (!normalizeGuideText(passageEvidence.text).includes(word)) {
        pushIssue(issues, 'morphology_guide_invalid', target.targetId, 'Morphology target sentences must contain the target word.')
      }

      if (checkpointPassageIds.has(guide.passageId)) {
        const prefixFamilies = checkpointPassagePrefixFamilyCounts.get(guide.passageId) ?? new Set<string>()
        const suffixKinds = checkpointPassageSuffixKinds.get(guide.passageId) ?? { inflectional: false, derivational: false }
        const familyTag = getMorphologyFamilyTag(affix.kind, normalizeGuideText(affix.surfaceForm))
        if (affix.kind === 'prefix') {
          prefixFamilies.add(familyTag)
        } else {
          const normalizedSurfaceForm = normalizeGuideText(affix.surfaceForm)
          if (isMorphologyInflectionalSuffix(normalizedSurfaceForm)) {
            suffixKinds.inflectional = true
          }
          if (normalizedSurfaceForm === 'er' || normalizedSurfaceForm === 'est' || normalizedSurfaceForm === 'ful' || normalizedSurfaceForm === 'less' || normalizedSurfaceForm === 'ly') {
            suffixKinds.derivational = true
          }
          if (!isMorphologyInflectionalSuffix(normalizedSurfaceForm) && normalizedSurfaceForm !== 'er' && normalizedSurfaceForm !== 'est') {
            suffixKinds.derivational = true
          }
        }
        checkpointPassagePrefixFamilyCounts.set(guide.passageId, prefixFamilies)
        checkpointPassageSuffixKinds.set(guide.passageId, suffixKinds)
      }
    }
  }

  if (wordCounts.size !== 14) {
    pushIssue(issues, 'morphology_guide_invalid', pack.manifest.packId, 'Morphology packs must use exactly 14 distinct target words.')
  }
  for (const [word, count] of wordCounts) {
    if (count !== 2) {
      pushIssue(issues, 'morphology_guide_invalid', word, 'Each Morphology target word must appear exactly twice across the pack.')
    }
  }

  for (const family of requiredPrefixFamilies) {
    if (!observedPrefixFamilies.has(family)) {
      pushIssue(issues, 'morphology_guide_invalid', pack.manifest.packId, `Morphology packs must include ${family}.`)
    }
  }
  for (const family of requiredSuffixFamilies) {
    if (!observedSuffixFamilies.has(family)) {
      pushIssue(issues, 'morphology_guide_invalid', pack.manifest.packId, `Morphology packs must include ${family}.`)
    }
  }

  let checkpointPassagesWithMultiplePrefixFamilies = 0
  let checkpointPassagesWithDerivationalAndInflectionalSuffixes = 0
  for (const passageId of checkpointPassageIds) {
    const prefixFamilies = checkpointPassagePrefixFamilyCounts.get(passageId) ?? new Set<string>()
    const suffixKinds = checkpointPassageSuffixKinds.get(passageId) ?? { inflectional: false, derivational: false }
    if (prefixFamilies.size === 0) {
      pushIssue(issues, 'morphology_guide_invalid', passageId, 'Checkpoint passages must include at least one prefix target.')
    }
    if (prefixFamilies.size > 1) checkpointPassagesWithMultiplePrefixFamilies += 1
    if (suffixKinds.inflectional && suffixKinds.derivational) checkpointPassagesWithDerivationalAndInflectionalSuffixes += 1
    if (!suffixKinds.inflectional || !suffixKinds.derivational) {
      pushIssue(issues, 'morphology_guide_invalid', passageId, 'Checkpoint passages must include both inflectional and derivational suffix targets.')
    }
    const targetCount = guideByPassageId.get(passageId)?.targets.length ?? 0
    if (targetCount > 0 && targetCount < 4) {
      pushIssue(issues, 'morphology_guide_invalid', passageId, 'Checkpoint passages must retain exactly four morphology targets.')
    }
  }

  if (checkpointPassagesWithMultiplePrefixFamilies < 2) {
    pushIssue(issues, 'morphology_guide_invalid', pack.manifest.packId, 'At least two checkpoint passages must include more than one prefix family.')
  }
  if (checkpointPassagesWithDerivationalAndInflectionalSuffixes < 2) {
    pushIssue(issues, 'morphology_guide_invalid', pack.manifest.packId, 'At least two checkpoint passages must include both derivational and inflectional suffixes.')
  }

  for (const passage of pack.passages) {
    if (!guideByPassageId.has(passage.passageIdentifier)) {
      pushIssue(issues, 'missing_morphology_guide', passage.passageIdentifier, 'Every passage needs exactly one morphology guide.')
    }
  }
}

function validateMeaningClueGuideStructure(pack: ContentPack, issues: ContentPackAuditIssue[]) {
  const guides = pack.meaningClueGuides ?? []
  const passageById = new Map(pack.passages.map((passage) => [passage.passageIdentifier, passage] as const))
  const guideByPassageId = new Map<string, NonNullable<ContentPack['meaningClueGuides']>[number]>()
  const observedContextClueKinds = new Set<string>()
  const observedRelationshipKinds = new Set<string>()
  const requiredContextClueKinds = new Set(['definition', 'restatement', 'example', 'contrast', 'cause-effect'])
  const requiredRelationshipKinds = new Set(['synonym', 'antonym', 'category-member', 'part-whole', 'object-function'])

  if (guides.length !== pack.passages.length) {
    pushIssue(
      issues,
      'meaning_clue_guide_count_mismatch',
      pack.manifest.packId,
      `Expected ${pack.passages.length} meaning clue guides, found ${guides.length}.`,
    )
  }

  for (const guide of guides) {
    if (guideByPassageId.has(guide.passageId)) {
      pushIssue(issues, 'meaning_clue_guide_invalid', guide.passageId, 'Meaning clue guides must not duplicate a passage ID.')
      continue
    }
    guideByPassageId.set(guide.passageId, guide)
    const passage = passageById.get(guide.passageId)
    if (!passage) {
      pushIssue(issues, 'missing_meaning_clue_guide', guide.passageId, 'Every meaning clue guide must point to a real passage.')
      continue
    }

    const glossaryFeature = passage.informationalStructure?.features.find((feature) => feature.kind === 'glossary') as
      | { kind: 'glossary'; entries: { entryId: string; term: string; definition: string }[] }
      | undefined
    const sentenceIds = new Set((passage.sentences ?? []).map((sentence) => sentence.sentenceId))
    const seenTargetIds = new Set<string>()
    const seenTargetWords = new Set<string>()
    const seenStrategies = new Set<string>()

    if (guide.targets.length !== 4) {
      pushIssue(issues, 'meaning_clue_guide_invalid', guide.passageId, 'Meaning clue guides must contain exactly four targets.')
    }
    if (guide.reviewStatus !== 'DRAFT') {
      pushIssue(issues, 'missing_draft_status', guide.passageId, 'Meaning clue guides in this pack must remain DRAFT.')
    }
    if (guide.contentVersion !== pack.manifest.contentVersion) {
      pushIssue(issues, 'meaning_clue_guide_invalid', guide.passageId, 'Meaning clue guide content version must match the pack version.')
    }
    if (!glossaryFeature) {
      pushIssue(issues, 'meaning_clue_guide_invalid', guide.passageId, 'Meaning clue passages need a glossary feature.')
    } else if (glossaryFeature.entries.length < 2) {
      pushIssue(issues, 'meaning_clue_guide_invalid', guide.passageId, 'Meaning clue passages need at least two glossary entries.')
    }

    const structureTexts = [
      guide.passageId,
      ...guide.targets.flatMap((target) => [
        target.targetId,
        target.word,
        target.sentenceId,
        target.childFriendlyMeaning,
        target.strategyExplanation,
        target.contextClueKind ?? '',
        target.relationshipKind ?? '',
        ...(target.relatedWords ?? []),
        target.glossaryEntryId ?? '',
        target.backgroundKnowledgeStatement ?? '',
      ]),
      ...(glossaryFeature?.entries.flatMap((entry) => [entry.entryId, entry.term, entry.definition]) ?? []),
    ]
    if (structureTexts.some((text) => text.includes('<') || text.includes('http://') || text.includes('https://'))) {
      pushIssue(issues, 'meaning_clue_guide_invalid', guide.passageId, 'Meaning clue guide text must not contain raw HTML or remote URLs.')
    }

    for (const target of guide.targets) {
      if (seenTargetIds.has(target.targetId)) {
        pushIssue(issues, 'meaning_clue_guide_invalid', target.targetId, 'Meaning clue target IDs must be unique within a guide.')
      } else {
        seenTargetIds.add(target.targetId)
      }

      const normalizedWord = normalizeGuideText(target.word)
      if (!normalizedWord) {
        pushIssue(issues, 'meaning_clue_guide_invalid', target.targetId, 'Meaning clue targets need a word.')
      }
      if (seenTargetWords.has(normalizedWord)) {
        pushIssue(issues, 'meaning_clue_guide_invalid', target.targetId, 'Meaning clue target words must be unique within a guide.')
      } else {
        seenTargetWords.add(normalizedWord)
      }

      if (!target.childFriendlyMeaning.trim()) {
        pushIssue(issues, 'meaning_clue_guide_invalid', target.targetId, 'Meaning clue targets need a child-friendly meaning.')
      } else if (!looksLikeCompleteThought(target.childFriendlyMeaning)) {
        pushIssue(issues, 'meaning_clue_guide_invalid', target.targetId, 'Meaning clue meanings must be complete thoughts.')
      }

      if (!target.sentenceId.trim() || !sentenceIds.has(target.sentenceId)) {
        pushIssue(issues, 'missing_support_sentence', target.targetId, 'Meaning clue target sentence IDs must resolve to the passage.')
      }
      const targetSentence = resolvePassageEvidence(passage, target.sentenceId)
      if (!targetSentence) {
        pushIssue(issues, 'invalid_informational_feature_reference', target.sentenceId, 'Meaning clue target sentences must resolve to authored passage evidence.')
      } else if (!normalizeGuideText(targetSentence.text).includes(normalizedWord)) {
        pushIssue(issues, 'meaning_clue_guide_invalid', target.targetId, 'Meaning clue target sentences must contain the target word.')
      }

      if (target.clueEvidenceIds.length === 0) {
        pushIssue(issues, 'meaning_clue_guide_invalid', target.targetId, 'Meaning clue targets need at least one clue evidence ID.')
      }
      const clueEvidenceIds = new Set(target.clueEvidenceIds)
      if (clueEvidenceIds.size !== target.clueEvidenceIds.length) {
        pushIssue(issues, 'meaning_clue_guide_invalid', target.targetId, 'Meaning clue clue evidence IDs must be unique.')
      }
      for (const evidenceId of clueEvidenceIds) {
        if (!resolvePassageEvidence(passage, evidenceId)) {
          pushIssue(issues, 'invalid_informational_feature_reference', evidenceId, 'Meaning clue evidence IDs must resolve to authored passage evidence.')
        }
      }

      if (!target.strategyExplanation.trim()) {
        pushIssue(issues, 'meaning_clue_guide_invalid', target.targetId, 'Meaning clue strategy explanations are required.')
      } else if (!looksLikeCompleteThought(target.strategyExplanation)) {
        pushIssue(issues, 'meaning_clue_guide_invalid', target.targetId, 'Meaning clue strategy explanations must be complete thoughts.')
      }

      switch (target.primaryStrategy) {
        case 'context-clue':
          if (target.contextClueKind) observedContextClueKinds.add(target.contextClueKind)
          if (!target.contextClueKind) {
            pushIssue(issues, 'meaning_clue_guide_invalid', target.targetId, 'Context clue targets need a context clue kind.')
          }
          if (target.relationshipKind || (target.relatedWords?.length ?? 0) > 0 || target.glossaryEntryId || target.backgroundKnowledgeStatement) {
            pushIssue(issues, 'meaning_clue_guide_invalid', target.targetId, 'Context clue targets may not claim other primary strategy metadata.')
          }
          if (!target.clueEvidenceIds.includes(target.sentenceId)) {
            pushIssue(issues, 'meaning_clue_guide_invalid', target.targetId, 'Context clue targets need a body sentence evidence reference.')
          }
          break
        case 'word-relationship':
          if (target.relationshipKind) observedRelationshipKinds.add(target.relationshipKind)
          if (!target.relationshipKind) {
            pushIssue(issues, 'meaning_clue_guide_invalid', target.targetId, 'Word relationship targets need a relationship kind.')
          }
          if (!target.relatedWords || target.relatedWords.length === 0) {
            pushIssue(issues, 'meaning_clue_guide_invalid', target.targetId, 'Word relationship targets need related words.')
          } else if (new Set(target.relatedWords.map((word) => normalizeGuideText(word))).size !== target.relatedWords.length) {
            pushIssue(issues, 'meaning_clue_guide_invalid', target.targetId, 'Word relationship related words must be unique.')
          }
          if (target.contextClueKind || target.glossaryEntryId || target.backgroundKnowledgeStatement) {
            pushIssue(issues, 'meaning_clue_guide_invalid', target.targetId, 'Word relationship targets may not claim other primary strategy metadata.')
          }
          if (!target.clueEvidenceIds.includes(target.sentenceId)) {
            pushIssue(issues, 'meaning_clue_guide_invalid', target.targetId, 'Word relationship targets need a body sentence evidence reference.')
          }
          break
        case 'reference-material':
          if (!target.glossaryEntryId) {
            pushIssue(issues, 'meaning_clue_guide_invalid', target.targetId, 'Reference material targets need a glossary entry ID.')
          }
          if (target.contextClueKind || target.relationshipKind || (target.relatedWords?.length ?? 0) > 0 || target.backgroundKnowledgeStatement) {
            pushIssue(issues, 'meaning_clue_guide_invalid', target.targetId, 'Reference material targets may not claim other primary strategy metadata.')
          }
          if (target.glossaryEntryId) {
            const glossaryEvidence = resolvePassageEvidence(passage, target.glossaryEntryId)
            if (!glossaryEvidence) {
              pushIssue(issues, 'invalid_informational_feature_reference', target.glossaryEntryId, 'Reference material targets must resolve to a glossary entry.')
            }
            const glossaryEntry = glossaryFeature?.entries.find((entry) => entry.entryId === target.glossaryEntryId)
            if (!glossaryEntry) {
              pushIssue(issues, 'meaning_clue_guide_invalid', target.targetId, 'Reference material targets must point to a real glossary entry.')
            } else if (normalizeGuideText(glossaryEntry.term) !== normalizedWord) {
              pushIssue(issues, 'meaning_clue_guide_invalid', target.targetId, 'Reference material glossary terms must match the target word.')
            }
            if (!target.clueEvidenceIds.includes(target.glossaryEntryId)) {
              pushIssue(issues, 'meaning_clue_guide_invalid', target.targetId, 'Reference material targets need the glossary entry as evidence.')
            }
          }
          break
        case 'background-knowledge':
          if (!target.backgroundKnowledgeStatement) {
            pushIssue(issues, 'meaning_clue_guide_invalid', target.targetId, 'Background knowledge targets need a background knowledge statement.')
          } else if (!looksLikeCompleteThought(target.backgroundKnowledgeStatement)) {
            pushIssue(issues, 'meaning_clue_guide_invalid', target.targetId, 'Background knowledge statements must be complete thoughts.')
          }
          if (target.contextClueKind || target.relationshipKind || target.glossaryEntryId || (target.relatedWords?.length ?? 0) > 0) {
            pushIssue(issues, 'meaning_clue_guide_invalid', target.targetId, 'Background knowledge targets may not claim other primary strategy metadata.')
          }
          if (!target.clueEvidenceIds.includes(target.sentenceId)) {
            pushIssue(issues, 'meaning_clue_guide_invalid', target.targetId, 'Background knowledge targets need a body sentence evidence reference.')
          }
          break
      }

      seenStrategies.add(target.primaryStrategy)
    }

    if (seenStrategies.size !== 4) {
      pushIssue(issues, 'meaning_clue_guide_invalid', guide.passageId, 'Meaning clue guides must contain one of each strategy family.')
    }
  }

  for (const passage of pack.passages) {
    if (!guideByPassageId.has(passage.passageIdentifier)) {
      pushIssue(issues, 'missing_meaning_clue_guide', passage.passageIdentifier, 'Every passage needs exactly one meaning clue guide.')
      continue
    }

    const glossaryFeature = passage.informationalStructure?.features.find((feature) => feature.kind === 'glossary') as
      | { kind: 'glossary'; entries: { entryId: string; term: string; definition: string }[] }
      | undefined
    if (!glossaryFeature) {
      pushIssue(issues, 'meaning_clue_guide_invalid', passage.passageIdentifier, 'Meaning clue passages must include one glossary feature.')
      continue
    }
    if (glossaryFeature.entries.length < 2) {
      pushIssue(issues, 'meaning_clue_guide_invalid', passage.passageIdentifier, 'Meaning clue passages need at least two glossary entries.')
    }
  }

  for (const requiredContextClueKind of requiredContextClueKinds) {
    if (!observedContextClueKinds.has(requiredContextClueKind)) {
      pushIssue(issues, 'meaning_clue_guide_invalid', pack.manifest.packId, `Meaning clue packs must include ${requiredContextClueKind} context clues.`)
    }
  }
  for (const requiredRelationshipKind of requiredRelationshipKinds) {
    if (!observedRelationshipKinds.has(requiredRelationshipKind)) {
      pushIssue(issues, 'meaning_clue_guide_invalid', pack.manifest.packId, `Meaning clue packs must include ${requiredRelationshipKind} relationships.`)
    }
  }
}

function validateWordplayGuideStructure(pack: ContentPack, issues: ContentPackAuditIssue[]) {
  const guides = pack.wordplayGuides ?? []
  const passageById = new Map(pack.passages.map((passage) => [passage.passageIdentifier, passage] as const))
  const guideByPassageId = new Map<string, NonNullable<ContentPack['wordplayGuides']>[number]>()
  const observedKinds = new Set<string>()
  const observedPassageKinds = new Map<string, Set<string>>()
  const observedTags = new Set(pack.questions.flatMap((question) => question.tags ?? []))
  const forbiddenTags = new Set([
    'metaphor',
    'personification',
    'hyperbole',
    'symbolism',
    'tone',
    'mood',
    'retell',
    'paired-text',
  ])
  const likeSimileTargets = new Set<string>()
  const asSimileTargets = new Set<string>()
  const idiomExpressions = new Set<string>()
  const alliterationSounds = new Set<string>()

  if (guides.length !== pack.passages.length) {
    pushIssue(
      issues,
      'wordplay_guide_count_mismatch',
      pack.manifest.packId,
      `Expected ${pack.passages.length} wordplay guides, found ${guides.length}.`,
    )
  }

  for (const tag of forbiddenTags) {
    if (observedTags.has(tag)) {
      pushIssue(issues, 'wordplay_guide_invalid', pack.manifest.packId, `Wordplay packs must not include the ${tag} tag.`)
    }
  }

  for (const guide of guides) {
    if (guideByPassageId.has(guide.passageId)) {
      pushIssue(issues, 'wordplay_guide_invalid', guide.passageId, 'Wordplay guides must not duplicate a passage ID.')
      continue
    }
    guideByPassageId.set(guide.passageId, guide)
    const passage = passageById.get(guide.passageId)
    if (!passage) {
      pushIssue(issues, 'missing_wordplay_guide', guide.passageId, 'Every wordplay guide must point to a real passage.')
      continue
    }

    validateWordplayGuideAgainstPassage(pack, passage, guide, issues, observedKinds, observedPassageKinds, likeSimileTargets, asSimileTargets, idiomExpressions, alliterationSounds)
  }

  for (const passage of pack.passages) {
    if (!guideByPassageId.has(passage.passageIdentifier)) {
      pushIssue(issues, 'missing_wordplay_guide', passage.passageIdentifier, 'Every passage needs exactly one wordplay guide.')
    }
  }

  for (const passage of pack.passages) {
    const kinds = observedPassageKinds.get(passage.passageIdentifier)
    if (!kinds || kinds.size !== 3) {
      pushIssue(issues, 'wordplay_guide_invalid', passage.passageIdentifier, 'Every wordplay passage must include simile, idiom, and alliteration targets.')
    }
  }

  if (likeSimileTargets.size < 4) {
    pushIssue(issues, 'wordplay_guide_invalid', pack.manifest.packId, 'Wordplay packs must include at least four similes that use like.')
  }
  if (asSimileTargets.size < 4) {
    pushIssue(issues, 'wordplay_guide_invalid', pack.manifest.packId, 'Wordplay packs must include at least four similes that use as.')
  }
  if (idiomExpressions.size < 7) {
    pushIssue(issues, 'wordplay_guide_invalid', pack.manifest.packId, 'Wordplay packs must include at least seven distinct idioms.')
  }
  if (alliterationSounds.size < 5) {
    pushIssue(issues, 'wordplay_guide_invalid', pack.manifest.packId, 'Wordplay packs must include at least five distinct alliteration sounds.')
  }
}

function validateWordplayGuideAgainstPassage(
  pack: ContentPack,
  passage: ContentPack['passages'][number],
  guide: NonNullable<ContentPack['wordplayGuides']>[number],
  issues: ContentPackAuditIssue[],
  observedKinds: Set<string>,
  observedPassageKinds: Map<string, Set<string>>,
  likeSimileTargets: Set<string>,
  asSimileTargets: Set<string>,
  idiomExpressions: Set<string>,
  alliterationSounds: Set<string>,
) {
  const sentenceById = new Map((passage.sentences ?? []).map((sentence) => [sentence.sentenceId, sentence] as const))
  const seenTargetIds = new Set<string>()
  const targetKinds = new Set<string>()
  const normalizedTexts = [
    guide.passageId,
    guide.reviewStatus,
    guide.contentVersion,
    ...guide.targets.flatMap((target) => [
      target.targetId,
      target.kind,
      target.expressionText,
      target.sentenceId,
      target.explanationStatement,
      ...target.evidenceReferenceIds,
      ...(target.kind === 'simile' ? [target.signalWord, target.comparisonSubject, target.comparisonObject, target.sharedQuality] : []),
      ...(target.kind === 'idiom' ? [target.intendedMeaning, target.literalReading, ...(target.contextEvidenceIds ?? [])] : []),
      ...(target.kind === 'alliteration'
        ? [
            target.repeatedInitialSound,
            target.soundExplanation,
            ...target.alliterativeWords.flatMap((word) => [word.word, word.initialSound]),
          ]
        : []),
    ]),
  ]

  if (guide.targets.length !== 4) {
    pushIssue(issues, 'wordplay_guide_invalid', guide.passageId, 'Wordplay guides must contain exactly four targets.')
  }
  if (guide.reviewStatus !== 'DRAFT') {
    pushIssue(issues, 'missing_draft_status', guide.passageId, 'Wordplay guides in this pack must remain DRAFT.')
  }
  if (guide.contentVersion !== pack.manifest.contentVersion) {
    pushIssue(issues, 'wordplay_guide_invalid', guide.passageId, 'Wordplay guide content version must match the pack version.')
  }
  if (normalizedTexts.some((text) => text.includes('<') || text.includes('http://') || text.includes('https://'))) {
    pushIssue(issues, 'wordplay_guide_invalid', guide.passageId, 'Wordplay guide text must not contain raw HTML or remote URLs.')
  }

  for (const target of guide.targets) {
    const normalizedTargetId = normalizeGuideText(target.targetId)
    if (!normalizedTargetId) {
      pushIssue(issues, 'wordplay_guide_invalid', guide.passageId, 'Wordplay targets need an ID.')
    }
    if (seenTargetIds.has(target.targetId)) {
      pushIssue(issues, 'wordplay_guide_invalid', target.targetId, 'Wordplay target IDs must be unique within a guide.')
    } else {
      seenTargetIds.add(target.targetId)
    }
    if (observedKinds.has(target.targetId)) {
      pushIssue(issues, 'wordplay_guide_invalid', target.targetId, 'Wordplay target IDs must be unique across the pack.')
    } else {
      observedKinds.add(target.targetId)
    }

    const normalizedExpression = normalizeGuideText(target.expressionText)
    if (!normalizedExpression) {
      pushIssue(issues, 'wordplay_guide_invalid', target.targetId, 'Wordplay targets need expression text.')
    }

    const sentence = sentenceById.get(target.sentenceId)
    if (!sentence) {
      pushIssue(issues, 'missing_support_sentence', target.targetId, 'Wordplay target sentence IDs must resolve to the passage.')
    } else if (!normalizeGuideText(sentence.text).includes(normalizedExpression)) {
      pushIssue(issues, 'wordplay_guide_invalid', target.targetId, 'Wordplay target expressions must appear in the referenced sentence or line.')
    }

    if (target.evidenceReferenceIds.length === 0) {
      pushIssue(issues, 'wordplay_guide_invalid', target.targetId, 'Wordplay targets need at least one evidence reference.')
    }
    const evidenceIds = new Set(target.evidenceReferenceIds)
    if (evidenceIds.size !== target.evidenceReferenceIds.length) {
      pushIssue(issues, 'wordplay_guide_invalid', target.targetId, 'Wordplay evidence references must be unique.')
    }
    for (const evidenceId of evidenceIds) {
      if (!resolvePassageEvidence(passage, evidenceId)) {
        pushIssue(issues, 'invalid_evidence_reference', evidenceId, 'Wordplay evidence references must resolve to authored passage evidence.')
      }
    }

    if (!target.explanationStatement.trim()) {
      pushIssue(issues, 'wordplay_guide_invalid', target.targetId, 'Wordplay targets need an explanation.')
    } else if (!looksLikeCompleteThought(target.explanationStatement)) {
      pushIssue(issues, 'wordplay_guide_invalid', target.targetId, 'Wordplay explanations must be complete thoughts.')
    }

    observedPassageKinds.set(passage.passageIdentifier, observedPassageKinds.get(passage.passageIdentifier) ?? new Set<string>())
    const passageKinds = observedPassageKinds.get(passage.passageIdentifier)!
    passageKinds.add(target.kind)
    targetKinds.add(target.kind)

    switch (target.kind) {
      case 'simile': {
        const simileTarget = target as Extract<typeof target, { kind: 'simile' }>
        if (simileTarget.figurativeComparison !== true) {
          pushIssue(issues, 'wordplay_guide_invalid', target.targetId, 'Similes must be marked as figurative comparisons.')
        }
        if (!['like', 'as'].includes(simileTarget.signalWord)) {
          pushIssue(issues, 'wordplay_guide_invalid', target.targetId, 'Similes must use like or as.')
        }
        if (!simileTarget.comparisonSubject.trim() || !simileTarget.comparisonObject.trim() || !simileTarget.sharedQuality.trim()) {
          pushIssue(issues, 'wordplay_guide_invalid', target.targetId, 'Similes need the compared things and shared quality.')
        }
        if (!normalizedExpression.includes(simileTarget.signalWord)) {
          pushIssue(issues, 'wordplay_guide_invalid', target.targetId, 'Simile expressions must include the signal word.')
        }
        if (!target.evidenceReferenceIds.includes(target.sentenceId)) {
          pushIssue(issues, 'wordplay_guide_invalid', target.targetId, 'Similes need the sentence as evidence.')
        }
        if (simileTarget.signalWord === 'like') {
          likeSimileTargets.add(target.targetId)
        } else if (simileTarget.signalWord === 'as') {
          asSimileTargets.add(target.targetId)
        }
        break
      }
      case 'idiom': {
        const idiomTarget = target as Extract<typeof target, { kind: 'idiom' }>
        if (idiomTarget.nonliteral !== true) {
          pushIssue(issues, 'wordplay_guide_invalid', target.targetId, 'Idioms must be marked as nonliteral.')
        }
        if (!idiomTarget.intendedMeaning.trim() || !idiomTarget.literalReading.trim()) {
          pushIssue(issues, 'wordplay_guide_invalid', target.targetId, 'Idioms need intended and literal meanings.')
        }
        if (normalizeGuideText(idiomTarget.intendedMeaning) === normalizeGuideText(idiomTarget.literalReading)) {
          pushIssue(issues, 'wordplay_guide_invalid', target.targetId, 'Idioms need different intended and literal meanings.')
        }
        if (!idiomTarget.contextEvidenceIds?.length) {
          pushIssue(issues, 'wordplay_guide_invalid', target.targetId, 'Idioms need context evidence.')
        } else {
          const contextEvidenceIds = new Set(idiomTarget.contextEvidenceIds)
          if (contextEvidenceIds.size !== idiomTarget.contextEvidenceIds.length) {
            pushIssue(issues, 'wordplay_guide_invalid', target.targetId, 'Idioms need unique context evidence IDs.')
          }
          for (const evidenceId of contextEvidenceIds) {
            if (!resolvePassageEvidence(passage, evidenceId)) {
              pushIssue(issues, 'invalid_evidence_reference', evidenceId, 'Idioms need context evidence that resolves to the passage.')
            }
          }
        }
        if (!target.evidenceReferenceIds.includes(target.sentenceId)) {
          pushIssue(issues, 'wordplay_guide_invalid', target.targetId, 'Idioms need the sentence as evidence.')
        }
        idiomExpressions.add(normalizedExpression)
        break
      }
      case 'alliteration': {
        const alliterationTarget = target as Extract<typeof target, { kind: 'alliteration' }>
        if (!alliterationTarget.soundExplanation.trim()) {
          pushIssue(issues, 'wordplay_guide_invalid', target.targetId, 'Alliteration targets need a sound explanation.')
        }
        if (!alliterationTarget.repeatedInitialSound.trim()) {
          pushIssue(issues, 'wordplay_guide_invalid', target.targetId, 'Alliteration targets need a repeated sound.')
        }
        if (alliterationTarget.alliterativeWords.length < 3) {
          pushIssue(issues, 'wordplay_guide_invalid', target.targetId, 'Alliteration targets need at least three words.')
        }
        const initialSound = normalizeGuideText(alliterationTarget.repeatedInitialSound)
        for (const word of alliterationTarget.alliterativeWords) {
          if (!word.word.trim() || !word.initialSound.trim()) {
            pushIssue(issues, 'wordplay_guide_invalid', target.targetId, 'Alliterative words need words and initial sounds.')
          }
          if (!normalizeGuideText(sentence?.text ?? '').includes(normalizeGuideText(word.word))) {
            pushIssue(issues, 'wordplay_guide_invalid', target.targetId, 'Alliterative words must appear in the referenced sentence or line.')
          }
          if (normalizeGuideText(word.initialSound) !== initialSound) {
            pushIssue(issues, 'wordplay_guide_invalid', target.targetId, 'Alliterative words must share the same initial sound.')
          }
        }
        if (!target.evidenceReferenceIds.includes(target.sentenceId)) {
          pushIssue(issues, 'wordplay_guide_invalid', target.targetId, 'Alliteration targets need the sentence as evidence.')
        }
        alliterationSounds.add(initialSound)
        break
      }
    }
  }

  if (targetKinds.size !== 3) {
    pushIssue(issues, 'wordplay_guide_invalid', guide.passageId, 'Every wordplay passage must include simile, idiom, and alliteration targets.')
  }
}

function validateRetellGuideStructure(pack: ContentPack, issues: ContentPackAuditIssue[]) {
  const guides = pack.retellGuides ?? []
  if (guides.length === 0) {
    return
  }
  const passageById = new Map(pack.passages.map((passage) => [passage.passageIdentifier, passage] as const))
  const guideByPassageId = new Map<string, NonNullable<ContentPack['retellGuides']>[number]>()
  const literaryGuides = new Set<string>()
  const informationalGuides = new Set<string>()

  if (guides.length !== pack.passages.length) {
    pushIssue(
      issues,
      'retell_guide_count_mismatch',
      pack.manifest.packId,
      `Expected ${pack.passages.length} retell guides, found ${guides.length}.`,
    )
  }

  for (const guide of guides) {
    if (guideByPassageId.has(guide.passageId)) {
      pushIssue(issues, 'retell_guide_invalid', guide.passageId, 'Retell guides must not duplicate a passage ID.')
      continue
    }
    guideByPassageId.set(guide.passageId, guide)

    const passage = passageById.get(guide.passageId)
    if (!passage) {
      pushIssue(issues, 'missing_retell_guide', guide.passageId, 'Every retell guide must point to a real passage.')
      continue
    }
    validateRetellGuideAgainstPassage(pack, passage, guide, issues, literaryGuides, informationalGuides)
  }

  for (const passage of pack.passages) {
    if (!guideByPassageId.has(passage.passageIdentifier)) {
      pushIssue(issues, 'missing_retell_guide', passage.passageIdentifier, 'Every passage needs exactly one retell guide.')
    }
  }

  if (literaryGuides.size !== 4) {
    pushIssue(issues, 'retell_guide_invalid', pack.manifest.packId, `Retell Hall must include 4 literary guides, found ${literaryGuides.size}.`)
  }
  if (informationalGuides.size !== 3) {
    pushIssue(issues, 'retell_guide_invalid', pack.manifest.packId, `Retell Hall must include 3 informational guides, found ${informationalGuides.size}.`)
  }

  validateRetellBuilderStructure(pack, issues)
}

function validateRetellGuideAgainstPassage(
  pack: ContentPack,
  passage: ContentPack['passages'][number],
  guide: NonNullable<ContentPack['retellGuides']>[number],
  issues: ContentPackAuditIssue[],
  literaryGuides: Set<string>,
  informationalGuides: Set<string>,
) {
  const normalizedTexts = [
    guide.passageId,
    guide.textKind,
    guide.reviewStatus,
    guide.contentVersion,
    ...(guide.textKind === 'literary'
      ? [
          ...guide.mainCharacters,
          guide.settingStatement,
          guide.problemStatement,
          ...guide.importantEventStatements,
          guide.resolutionStatement,
          ...guide.minorDetailIds,
        ]
      : [
          guide.topicLabel,
          guide.centralIdeaStatement,
          ...guide.relevantDetailStatements,
          ...guide.otherTrueDetailIds,
        ]),
    ...guide.retellPieces.flatMap((piece) => [
      piece.pieceId,
      piece.text,
      piece.role,
      ...piece.evidenceReferenceIds,
    ]),
  ]
  const sentenceToSectionId = new Map<string, string>()
  if (passage.contentKind === 'informational' && passage.informationalStructure) {
    for (const section of passage.informationalStructure.sections) {
      for (const sentenceId of section.sentenceIds) {
        sentenceToSectionId.set(sentenceId, section.sectionId)
      }
    }
  }

  if (guide.reviewStatus !== 'DRAFT') {
    pushIssue(issues, 'missing_draft_status', guide.passageId, 'Retell guides in this pack must remain DRAFT.')
  }
  if (guide.contentVersion !== pack.manifest.contentVersion) {
    pushIssue(issues, 'retell_guide_invalid', guide.passageId, 'Retell guide content version must match the pack version.')
  }
  if (normalizedTexts.some((text) => text.includes('<') || text.includes('http://') || text.includes('https://'))) {
    pushIssue(issues, 'retell_guide_invalid', guide.passageId, 'Retell guide text must not contain raw HTML or remote URLs.')
  }

  if (passage.contentKind === 'prose') {
    literaryGuides.add(guide.passageId)
    if (guide.textKind !== 'literary') {
      pushIssue(issues, 'retell_guide_invalid', guide.passageId, 'Prose passages require literary retell guides.')
    }
    const literaryGuide = guide as NonNullable<ContentPack['retellGuides']>[number] & { textKind: 'literary' }
    if (!literaryGuide.mainCharacters.length) {
      pushIssue(issues, 'retell_guide_invalid', guide.passageId, 'Literary retell guides need at least one main character.')
    }
    if (new Set(literaryGuide.mainCharacters.map((value) => normalizeGuideText(value))).size !== literaryGuide.mainCharacters.length) {
      pushIssue(issues, 'retell_guide_invalid', guide.passageId, 'Literary main characters must be unique.')
    }
    if (!literaryGuide.settingStatement.trim()) {
      pushIssue(issues, 'retell_guide_invalid', guide.passageId, 'Literary retell guides need a setting statement.')
    }
    if (!literaryGuide.problemStatement.trim()) {
      pushIssue(issues, 'retell_guide_invalid', guide.passageId, 'Literary retell guides need a problem statement.')
    }
    if (!literaryGuide.importantEventStatements.length || literaryGuide.importantEventStatements.length < 2) {
      pushIssue(issues, 'retell_guide_invalid', guide.passageId, 'Literary retell guides need at least two important events.')
    }
    if (!literaryGuide.resolutionStatement.trim()) {
      pushIssue(issues, 'retell_guide_invalid', guide.passageId, 'Literary retell guides need a resolution statement.')
    }
    if (literaryGuide.retellPieces.length !== 5) {
      pushIssue(issues, 'retell_guide_invalid', guide.passageId, 'Literary retell guides must contain exactly five retell pieces.')
    }
    if (!literaryGuide.minorDetailIds.length) {
      pushIssue(issues, 'retell_guide_invalid', guide.passageId, 'Literary retell guides need at least one minor detail.')
    }

    const expectedRoles = ['Opening', 'Problem', 'Important event 1', 'Important event 2', 'Ending']
    validateRetellPieces(
      literaryGuide,
      passage,
      issues,
      expectedRoles,
      5,
      sentenceToSectionId,
      false,
    )

    const requiredEvidenceIds = new Set(literaryGuide.retellPieces.flatMap((piece) => piece.evidenceReferenceIds))
    for (const minorDetailId of literaryGuide.minorDetailIds) {
      if (!resolvePassageEvidence(passage, minorDetailId)) {
        pushIssue(issues, 'invalid_evidence_reference', minorDetailId, 'Minor detail evidence must resolve to the passage.')
      }
      if (requiredEvidenceIds.has(minorDetailId)) {
        pushIssue(issues, 'retell_guide_invalid', minorDetailId, 'Minor details must stay separate from required retell evidence.')
      }
    }
    return
  }

  if (passage.contentKind === 'informational') {
    informationalGuides.add(guide.passageId)
    if (guide.textKind !== 'informational') {
      pushIssue(issues, 'retell_guide_invalid', guide.passageId, 'Informational passages require informational retell guides.')
    }
    const informationalGuide = guide as NonNullable<ContentPack['retellGuides']>[number] & { textKind: 'informational' }
    if (!informationalGuide.topicLabel.trim()) {
      pushIssue(issues, 'retell_guide_invalid', guide.passageId, 'Informational retell guides need a topic label.')
    }
    if (!informationalGuide.centralIdeaStatement.trim()) {
      pushIssue(issues, 'retell_guide_invalid', guide.passageId, 'Informational retell guides need a central-idea statement.')
    } else if (!looksLikeCompleteThought(informationalGuide.centralIdeaStatement)) {
      pushIssue(issues, 'retell_guide_invalid', guide.passageId, 'Informational central ideas must be complete thoughts.')
    }
    if (normalizeGuideText(informationalGuide.centralIdeaStatement) === normalizeGuideText(informationalGuide.topicLabel)) {
      pushIssue(issues, 'retell_guide_invalid', guide.passageId, 'Informational central ideas must differ from the topic label.')
    }
    if (informationalGuide.relevantDetailStatements.length !== 3) {
      pushIssue(issues, 'retell_guide_invalid', guide.passageId, 'Informational retell guides must contain exactly three relevant details.')
    }
    if (informationalGuide.retellPieces.length !== 4) {
      pushIssue(issues, 'retell_guide_invalid', guide.passageId, 'Informational retell guides must contain exactly four retell pieces.')
    }
    if (!informationalGuide.otherTrueDetailIds.length) {
      pushIssue(issues, 'retell_guide_invalid', guide.passageId, 'Informational retell guides need at least one less-relevant detail.')
    }

    const expectedRoles = ['Central idea', 'Relevant detail 1', 'Relevant detail 2', 'Relevant detail 3']
    validateRetellPieces(
      informationalGuide,
      passage,
      issues,
      expectedRoles,
      4,
      sentenceToSectionId,
      false,
    )

    const requiredEvidenceIds = new Set(informationalGuide.retellPieces.flatMap((piece) => piece.evidenceReferenceIds))
    const observedSections = new Set<string>()
    for (const piece of informationalGuide.retellPieces) {
      for (const evidenceId of piece.evidenceReferenceIds) {
        const sectionId = sentenceToSectionId.get(evidenceId)
        if (sectionId) observedSections.add(sectionId)
      }
    }
    if (observedSections.size < 2) {
      pushIssue(issues, 'retell_guide_invalid', guide.passageId, 'Informational retell evidence must span at least two sections.')
    }
    for (const otherDetailId of informationalGuide.otherTrueDetailIds) {
      if (!resolvePassageEvidence(passage, otherDetailId)) {
        pushIssue(issues, 'invalid_evidence_reference', otherDetailId, 'Less-relevant detail evidence must resolve to the passage.')
      }
      if (requiredEvidenceIds.has(otherDetailId)) {
        pushIssue(issues, 'retell_guide_invalid', otherDetailId, 'Less-relevant details must stay separate from required retell evidence.')
      }
    }
  }
}

function validateRetellPieces(
  guide: NonNullable<ContentPack['retellGuides']>[number],
  passage: ContentPack['passages'][number],
  issues: ContentPackAuditIssue[],
  expectedRoles: readonly string[],
  expectedPieceCount: number,
  sentenceToSectionId: Map<string, string>,
  checkSectionSpan: boolean,
) {
  const seenPieceIds = new Set<string>()
  const seenSequenceIndices = new Set<number>()
  const requiredEvidenceIds = new Set<string>()

  for (const [index, piece] of guide.retellPieces.entries()) {
    if (!piece.pieceId.trim()) {
      pushIssue(issues, 'retell_guide_invalid', guide.passageId, 'Retell pieces need IDs.')
    }
    if (seenPieceIds.has(piece.pieceId)) {
      pushIssue(issues, 'retell_guide_invalid', piece.pieceId, 'Retell piece IDs must be unique within a guide.')
    } else {
      seenPieceIds.add(piece.pieceId)
    }
    if (piece.sequenceIndex !== index + 1) {
      pushIssue(issues, 'retell_guide_invalid', piece.pieceId, 'Retell sequence indices must be contiguous starting at 1.')
    }
    if (seenSequenceIndices.has(piece.sequenceIndex)) {
      pushIssue(issues, 'retell_guide_invalid', piece.pieceId, 'Retell sequence indices must be unique within a guide.')
    } else {
      seenSequenceIndices.add(piece.sequenceIndex)
    }
    if (piece.role !== expectedRoles[index]) {
      pushIssue(issues, 'retell_guide_invalid', piece.pieceId, 'Retell pieces must use the expected role order.')
    }
    if (!piece.text.trim()) {
      pushIssue(issues, 'retell_guide_invalid', piece.pieceId, 'Retell pieces need text.')
    } else if (!looksLikeCompleteThought(piece.text)) {
      pushIssue(issues, 'retell_guide_invalid', piece.pieceId, 'Retell pieces must be complete thoughts.')
    }
    if (!Array.isArray(piece.evidenceReferenceIds) || piece.evidenceReferenceIds.length === 0) {
      pushIssue(issues, 'retell_guide_invalid', piece.pieceId, 'Retell pieces need evidence references.')
    } else {
      const evidenceIds = new Set(piece.evidenceReferenceIds)
      if (evidenceIds.size !== piece.evidenceReferenceIds.length) {
        pushIssue(issues, 'retell_guide_invalid', piece.pieceId, 'Retell evidence references must be unique.')
      }
      for (const evidenceId of evidenceIds) {
        requiredEvidenceIds.add(evidenceId)
        if (!resolvePassageEvidence(passage, evidenceId)) {
          pushIssue(issues, 'invalid_evidence_reference', evidenceId, 'Retell evidence must resolve to the passage.')
        }
        if (checkSectionSpan && !sentenceToSectionId.has(evidenceId)) {
          pushIssue(issues, 'retell_guide_invalid', evidenceId, 'Informational retell evidence must come from passage sentences. ')
        }
      }
    }
  }

  if (guide.retellPieces.length !== expectedPieceCount) {
    pushIssue(issues, 'retell_guide_invalid', guide.passageId, `Retell guides must contain exactly ${expectedPieceCount} retell pieces.`)
  }

  if (guide.textKind === 'literary' && expectedRoles[0] === 'Opening' && guide.retellPieces.length > 0) {
    if (!guide.retellPieces[0].role.toLowerCase().includes('opening')) {
      pushIssue(issues, 'retell_guide_invalid', guide.passageId, 'Literary retell pieces must begin with the opening.')
    }
    if (!guide.retellPieces[guide.retellPieces.length - 1].role.toLowerCase().includes('ending')) {
      pushIssue(issues, 'retell_guide_invalid', guide.passageId, 'Literary retell pieces must end with the ending.')
    }
  }

  if (guide.textKind === 'informational' && guide.retellPieces.length > 0) {
    if (!guide.retellPieces[0].role.toLowerCase().includes('central idea')) {
      pushIssue(issues, 'retell_guide_invalid', guide.passageId, 'Informational retell pieces must begin with the central idea.')
    }
  }

  if (requiredEvidenceIds.size === 0) {
    pushIssue(issues, 'retell_guide_invalid', guide.passageId, 'Retell pieces need evidence references.')
  }
}

function validateRetellBuilderStructure(pack: ContentPack, issues: ContentPackAuditIssue[]) {
  const tableMatchQuestions = pack.questions.filter((question) => question.questionType === 'table_match' && question.questionContent?.type === 'table_match')

  if (tableMatchQuestions.length !== pack.lessons.length) {
    pushIssue(
      issues,
      'retell_builder_invalid',
      pack.manifest.packId,
      `Retell Hall must include one structured retell builder per lesson, found ${tableMatchQuestions.length}.`,
    )
  }

  for (const lesson of pack.lessons) {
    const lessonQuestions = pack.questions.filter((question) => question.lessonIdentifier === lesson.lessonId)
    const builderQuestions = lessonQuestions.filter((question) => question.questionType === 'table_match' && question.questionContent?.type === 'table_match')
    if (builderQuestions.length !== 1) {
      pushIssue(issues, 'retell_builder_invalid', lesson.lessonId, 'Each Retell Hall lesson must include exactly one structured retell builder.')
      continue
    }

    const builderQuestion = builderQuestions[0]
    const payload = builderQuestion.questionContent as Extract<NonNullable<typeof builderQuestion.questionContent>, { type: 'table_match' }>
    if (payload.selectionMode !== 'use_each_once') {
      pushIssue(issues, 'retell_builder_invalid', builderQuestion.questionIdentifier, 'Retell builders must use each piece only once.')
    }

    const passage = pack.passages.find((entry) => entry.passageIdentifier === builderQuestion.passageIdentifier)
    const guide = passage ? pack.retellGuides?.find((entry) => entry.passageId === passage.passageIdentifier) : undefined
    const expectedRowCount = guide?.textKind === 'informational' ? 4 : 5

    if (!guide) {
      pushIssue(issues, 'retell_builder_invalid', builderQuestion.questionIdentifier, 'Every retell builder must align to a retell guide.')
      continue
    }

    if (payload.rows.length !== expectedRowCount) {
      pushIssue(issues, 'retell_builder_invalid', builderQuestion.questionIdentifier, `Retell builders must contain exactly ${expectedRowCount} rows.`)
    }

    const normalizedPools = payload.rows.map((row) => normalizeRetellTableMatchPool(row.options))
    for (let index = 1; index < normalizedPools.length; index += 1) {
      if (!sameStringList(normalizedPools[0] ?? [], normalizedPools[index])) {
        pushIssue(issues, 'retell_builder_invalid', builderQuestion.questionIdentifier, 'Retell builder rows must share the same option pool.')
        break
      }
    }

    const uniquePoolIds = new Set(payload.rows.flatMap((row) => row.options.map((option) => option.id)))
    if (uniquePoolIds.size !== expectedRowCount + 1) {
      pushIssue(issues, 'retell_builder_invalid', builderQuestion.questionIdentifier, 'Retell builders must leave exactly one unused distractor.')
    }

    const correctChoiceIds = payload.rows.map((row) => row.correctChoiceId)
    if (new Set(correctChoiceIds).size !== expectedRowCount) {
      pushIssue(issues, 'retell_builder_invalid', builderQuestion.questionIdentifier, 'Retell builder choices must be unique across rows.')
    }

    for (const row of payload.rows) {
      if (!row.prompt.trim()) {
        pushIssue(issues, 'retell_builder_invalid', builderQuestion.questionIdentifier, 'Retell builder rows need prompts.')
      }
      if (!row.options.some((option) => option.id === row.correctChoiceId)) {
        pushIssue(issues, 'retell_builder_invalid', builderQuestion.questionIdentifier, 'Every retell row needs a resolvable correct choice.')
      }
    }
  }
}

function normalizeRetellTableMatchPool(options: { id: string; text: string }[]): string[] {
  return options
    .map((option) => `${option.id.trim()}::${normalizeGuideText(option.text)}`)
    .sort((left, right) => left.localeCompare(right))
}

function sameStringList(left: readonly string[], right: readonly string[]): boolean {
  if (left.length !== right.length) return false
  return left.every((value, index) => value === right[index])
}

function normalizeGuideText(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ')
}

function getMorphologyFamilyTag(kind: 'prefix' | 'suffix', surfaceForm: string): string {
  return `${kind === 'prefix' ? 'prefix' : 'suffix'}-${surfaceForm}`
}

function getMorphologySuffixFamilyTag(surfaceForm: string): string {
  switch (surfaceForm) {
    case 's':
    case 'es':
      return 's-es'
    case 'ed':
      return 'ed'
    case 'ing':
      return 'ing'
    case 'er':
    case 'est':
      return 'er-est'
    case 'ful':
    case 'less':
      return 'ful-less'
    case 'ly':
      return 'ly'
    default:
      return surfaceForm
  }
}

function isMorphologyInflectionalSuffix(surfaceForm: string): boolean {
  return ['s', 'es', 'ed', 'ing', 'er', 'est'].includes(surfaceForm)
}

function looksLikeCompleteThought(text: string): boolean {
  const trimmed = text.trim()
  return /^[^.?!].*[.?!]$/.test(trimmed) || trimmed.split(/\s+/).length >= 6
}

function looksLikeOpinionStatement(text: string): boolean {
  const normalized = normalizeGuideText(text)
  return /\b(should|need|needs|better|best|useful|help|helps|recommend|important|would)\b/i.test(normalized)
}

function validatePerspectivePortalGuideStructure(pack: ContentPack, issues: ContentPackAuditIssue[]) {
  const guides = pack.perspectiveGuides ?? []
  const passageById = new Map(pack.passages.map((passage) => [passage.passageIdentifier, passage] as const))
  const guideByPassageId = new Map<string, NonNullable<ContentPack['perspectiveGuides']>[number]>()

  if (guides.length !== pack.passages.length) {
    pushIssue(
      issues,
      'perspective_guide_count_mismatch',
      pack.manifest.packId,
      `Expected ${pack.passages.length} perspective guides, found ${guides.length}.`,
    )
  }

  for (const guide of guides) {
    if (guideByPassageId.has(guide.passageId)) {
      pushIssue(issues, 'perspective_guide_structure_invalid', guide.passageId, 'Perspective guides must not duplicate a passage ID.')
      continue
    }
    guideByPassageId.set(guide.passageId, guide)
    const passage = passageById.get(guide.passageId)
    if (!passage) {
      pushIssue(issues, 'missing_perspective_guide', guide.passageId, 'Every perspective guide must point to a real passage.')
      continue
    }

    validatePerspectiveGuideAgainstPassage(pack, passage, guide, issues)
  }

  for (const passage of pack.passages) {
    if (!guideByPassageId.has(passage.passageIdentifier)) {
      pushIssue(issues, 'missing_perspective_guide', passage.passageIdentifier, 'Every passage needs exactly one perspective guide.')
    }
  }
}

function validatePerspectiveGuideAgainstPassage(
  pack: ContentPack,
  passage: ContentPack['passages'][number],
  guide: NonNullable<ContentPack['perspectiveGuides']>[number],
  issues: ContentPackAuditIssue[],
) {
  const sentenceIds = new Set((passage.sentences ?? []).map((sentence) => sentence.sentenceId))
  const characters = guide.characters ?? []

  if (!guide.sharedSituation || !guide.contrastSummary) {
    pushIssue(issues, 'perspective_guide_structure_invalid', guide.passageId, 'Perspective guides need a shared situation and contrast summary.')
  }
  if (guide.narratorPointOfViewExcluded !== true) {
    pushIssue(issues, 'perspective_guide_structure_invalid', guide.passageId, 'Perspective guides must exclude narrator point of view.')
  }
  if (characters.length !== 2) {
    pushIssue(issues, 'perspective_guide_structure_invalid', guide.passageId, 'Perspective guides need exactly two focal characters.')
  }

  const characterIds = new Set<string>()
  for (const character of characters) {
    if (characterIds.has(character.characterId)) {
      pushIssue(issues, 'perspective_guide_structure_invalid', guide.passageId, 'Perspective guide characters must have unique IDs.')
      continue
    }
    characterIds.add(character.characterId)

    if (!character.characterName || !character.perspectiveStatement) {
      pushIssue(issues, 'perspective_guide_structure_invalid', guide.passageId, 'Each perspective guide character needs a name and a perspective statement.')
    }
    if (normalizePerspectiveGuideText(character.perspectiveStatement).split(' ').filter(Boolean).length < 4) {
      pushIssue(issues, 'perspective_guide_structure_invalid', guide.passageId, 'Perspective statements should be complete thoughts.')
    }
    if (character.supportingSentenceIds.length < 2) {
      pushIssue(issues, 'perspective_guide_structure_invalid', guide.passageId, 'Each perspective needs at least two supporting sentences.')
    }
    if (
      character.wordsSentenceIds.length === 0
      && character.actionSentenceIds.length === 0
      && character.feelingSentenceIds.length === 0
      && character.choiceSentenceIds.length === 0
    ) {
      pushIssue(issues, 'perspective_guide_structure_invalid', guide.passageId, 'Each perspective needs at least one evidence clue.')
    }

    for (const sentenceId of [
      ...character.supportingSentenceIds,
      ...character.wordsSentenceIds,
      ...character.actionSentenceIds,
      ...character.feelingSentenceIds,
      ...character.choiceSentenceIds,
    ]) {
      if (!sentenceId || !sentenceIds.has(sentenceId)) {
        pushIssue(issues, 'missing_support_sentence', guide.passageId, 'Perspective guide sentence IDs must resolve to the authored passage.')
      }
    }
  }

  if (guide.reviewStatus !== 'DRAFT') {
    pushIssue(issues, 'missing_draft_status', guide.passageId, 'Perspective guides in this pack must remain DRAFT.')
  }
  if (guide.contentVersion !== pack.manifest.contentVersion) {
    pushIssue(issues, 'mismatched_content_version', guide.passageId, 'Perspective guide content version must match the pack version.')
  }
}

function validatePoetryPlanetGuideStructure(pack: ContentPack, issues: ContentPackAuditIssue[]) {
  const passages = pack.passages
  const rhymeGuides = pack.rhymeSchemeGuides ?? []
  const passageById = new Map(passages.map((passage) => [passage.passageIdentifier, passage] as const))
  const guideByPassageId = new Map<string, NonNullable<ContentPack['rhymeSchemeGuides']>[number]>()
  const observedTags = new Set(pack.questions.flatMap((question) => question.tags ?? []))
  const requiredDetailedPatterns = [
    'line-end-word-identification',
    'end-rhyme-identification',
    'rhyme-by-sound',
    'notation-starts-with-a',
    'same-rhyme-same-letter',
    'new-rhyme-next-letter',
    'uppercase-rhyme-labels',
    'whole-poem-scheme',
    'scheme-supported-by-end-words',
  ]
  const forbiddenTags = [
    'poem-type-identification',
    'free-verse',
    'haiku',
    'limerick',
    'meter',
    'poetic-rhythm-analysis',
    'figurative-language-analysis',
    'rhyme-creates-meaning',
    'poetry-theme-analysis',
  ]

  if (passages.length !== 7) {
    pushIssue(issues, 'poem_structure_invalid', pack.manifest.packId, `Expected 7 poem passages, found ${passages.length}.`)
  }
  if (rhymeGuides.length !== passages.length) {
    pushIssue(
      issues,
      'rhyme_scheme_guide_count_mismatch',
      pack.manifest.packId,
      `Expected ${passages.length} rhyme scheme guides, found ${rhymeGuides.length}.`,
    )
  }

  for (const passage of passages) {
    if (passage.contentKind !== 'poem') {
      pushIssue(issues, 'missing_poem_structure', passage.passageIdentifier, 'Poetry passages must use poem contentKind.')
    }
    validatePoetryPassageStructure(pack, passage, issues)
  }

  for (const guide of rhymeGuides) {
    if (guideByPassageId.has(guide.passageId)) {
      pushIssue(issues, 'rhyme_scheme_guide_invalid', guide.passageId, 'Rhyme scheme guides must not duplicate a passage ID.')
      continue
    }
    guideByPassageId.set(guide.passageId, guide)
    const passage = passageById.get(guide.passageId)
    if (!passage) {
      pushIssue(issues, 'missing_rhyme_scheme_guide', guide.passageId, 'Every rhyme scheme guide must point to a real poem.')
      continue
    }

    validateRhymeSchemeGuideAgainstPassage(pack, passage, guide, issues)
  }

  for (const passage of passages) {
    if (!guideByPassageId.has(passage.passageIdentifier)) {
      pushIssue(issues, 'missing_rhyme_scheme_guide', passage.passageIdentifier, 'Every poem needs exactly one rhyme scheme guide.')
    }
  }

  for (const requiredPattern of requiredDetailedPatterns) {
    if (!observedTags.has(requiredPattern)) {
      pushIssue(issues, 'missing_target_pattern_coverage', pack.manifest.packId, `Poetry pack must include ${requiredPattern.replaceAll('-', ' ')} coverage.`)
    }
  }

  for (const forbiddenTag of forbiddenTags) {
    if (observedTags.has(forbiddenTag)) {
      pushIssue(issues, 'missing_target_pattern_coverage', pack.manifest.packId, `Poetry pack must not include ${forbiddenTag.replaceAll('-', ' ')} tags.`)
    }
  }
}

function validatePoetryPassageStructure(
  _pack: ContentPack,
  passage: ContentPack['passages'][number],
  issues: ContentPackAuditIssue[],
) {
  const structure = passage.poemStructure
  if (!structure) {
    pushIssue(issues, 'missing_poem_structure', passage.passageIdentifier, 'Poem passages require poemStructure.')
    return
  }

  const lines = structure.lines ?? []
  const stanzas = structure.stanzas ?? []
  if (lines.length < 4 || lines.length > 12) {
      pushIssue(issues, 'poem_structure_invalid', passage.passageIdentifier, 'Poem passages must contain 4 to 12 lines.')
  }
  if (stanzas.length < 1 || stanzas.length > 2) {
    pushIssue(issues, 'poem_structure_invalid', passage.passageIdentifier, 'Poem passages must contain 1 or 2 stanzas.')
  }

  const sentenceById = new Map((passage.sentences ?? []).map((sentence) => [sentence.sentenceId, sentence] as const))
  const stanzaById = new Map<string, { stanzaId: string; lineIds: string[] }>()
  const seenLineIds = new Set<string>()
  const expectedText = normalizePoetryText(lines.map((line) => line.text).join('\n'))
  const actualText = normalizePoetryText(passage.passageText)

  if (expectedText !== actualText) {
    pushIssue(issues, 'poem_structure_invalid', passage.passageIdentifier, 'Poem passage text must match the authored line structure.')
  }

  for (const stanza of stanzas) {
    if (!stanza.stanzaId.trim()) {
      pushIssue(issues, 'poem_structure_invalid', passage.passageIdentifier, 'Poem stanza identifiers are required.')
      continue
    }
    if (stanzaById.has(stanza.stanzaId)) {
      pushIssue(issues, 'poem_structure_invalid', passage.passageIdentifier, 'Poem stanza identifiers must be unique.')
      continue
    }
    stanzaById.set(stanza.stanzaId, stanza)
    if (!Array.isArray(stanza.lineIds) || stanza.lineIds.length === 0) {
      pushIssue(issues, 'poem_structure_invalid', passage.passageIdentifier, 'Each poem stanza must reference at least one line.')
      continue
    }
    if (new Set(stanza.lineIds).size !== stanza.lineIds.length) {
      pushIssue(issues, 'poem_structure_invalid', passage.passageIdentifier, 'Poem stanzas must not repeat line IDs.')
    }
    for (const lineId of stanza.lineIds) {
      const line = lines.find((candidate) => candidate.lineId === lineId)
      if (!line) {
        pushIssue(issues, 'poem_structure_invalid', passage.passageIdentifier, 'Poem stanza line IDs must resolve to authored lines.')
        continue
      }
      if (line.stanzaId !== stanza.stanzaId) {
        pushIssue(issues, 'poem_structure_invalid', passage.passageIdentifier, 'Poem line stanza IDs must match their stanza.')
      }
    }
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const sentence = sentenceById.get(line.lineId)

    if (!line.lineId.trim()) {
      pushIssue(issues, 'poem_structure_invalid', passage.passageIdentifier, 'Poem line identifiers are required.')
      continue
    }
    if (seenLineIds.has(line.lineId)) {
      pushIssue(issues, 'poem_structure_invalid', passage.passageIdentifier, 'Poem line identifiers must be unique.')
    } else {
      seenLineIds.add(line.lineId)
    }
    if (line.lineNumber !== index + 1) {
      pushIssue(issues, 'poem_structure_invalid', passage.passageIdentifier, 'Poem line numbers must be contiguous starting at 1.')
    }
    if (!line.stanzaId.trim() || !stanzaById.has(line.stanzaId)) {
      pushIssue(issues, 'poem_structure_invalid', passage.passageIdentifier, 'Poem lines must belong to a real stanza.')
    }
    if (!sentence) {
      pushIssue(issues, 'poem_structure_invalid', passage.passageIdentifier, 'Poem line IDs must resolve to passage sentences.')
      continue
    }
    if (sentence.text !== line.text) {
      pushIssue(issues, 'poem_structure_invalid', passage.passageIdentifier, 'Poem sentences must match their authored lines.')
    }
    if (sentence.lineNumber !== line.lineNumber) {
      pushIssue(issues, 'poem_structure_invalid', passage.passageIdentifier, 'Poem sentence line numbers must match the poem structure.')
    }
    if (sentence.stanzaId !== line.stanzaId) {
      pushIssue(issues, 'poem_structure_invalid', passage.passageIdentifier, 'Poem sentence stanza IDs must match the poem structure.')
    }
  }
}

function validateRhymeSchemeGuideAgainstPassage(
  pack: ContentPack,
  passage: ContentPack['passages'][number],
  guide: NonNullable<ContentPack['rhymeSchemeGuides']>[number],
  issues: ContentPackAuditIssue[],
) {
  const lines = passage.poemStructure?.lines ?? []
  const linesById = new Map(lines.map((line) => [line.lineId, line] as const))
  const lineIds = new Set(lines.map((line) => line.lineId))
  const schemeLabels: string[] = []
  const rhymeKeyToLabel = new Map<string, string>()
  const labelToRhymeKey = new Map<string, string>()
  let expectedLetterIndex = 0

  if (guide.reviewStatus !== 'DRAFT') {
    pushIssue(issues, 'rhyme_scheme_guide_invalid', guide.passageId, 'Rhyme scheme guides in this pack must remain DRAFT.')
  }
  if (guide.contentVersion !== pack.manifest.contentVersion) {
    pushIssue(issues, 'rhyme_scheme_guide_invalid', guide.passageId, 'Rhyme scheme guide content version must match the pack version.')
  }
  if (!guide.scheme.trim()) {
    pushIssue(issues, 'rhyme_scheme_guide_invalid', guide.passageId, 'Rhyme scheme guides need a scheme string.')
  }
  if (guide.lines.length !== lines.length) {
    pushIssue(issues, 'rhyme_scheme_guide_invalid', guide.passageId, 'Rhyme scheme guides must include every poem line exactly once.')
  }

  const guideLineIds = new Set<string>()
  for (const guideLine of guide.lines) {
    const line = linesById.get(guideLine.lineId)
    if (!guideLine.lineId.trim() || guideLineIds.has(guideLine.lineId)) {
      pushIssue(issues, 'rhyme_scheme_guide_invalid', guide.passageId, 'Rhyme scheme guide line IDs must be unique.')
      continue
    }
    guideLineIds.add(guideLine.lineId)
    if (!line || !lineIds.has(guideLine.lineId)) {
      pushIssue(issues, 'rhyme_scheme_guide_invalid', guide.passageId, 'Rhyme scheme guide line IDs must resolve to authored poem lines.')
      continue
    }
    if (guideLine.endWord.trim().toLowerCase() !== extractPoetryEndWord(line.text).toLowerCase()) {
      pushIssue(issues, 'rhyme_scheme_guide_invalid', guide.passageId, 'Rhyme scheme guide end words must match the authored poem lines.')
    }
    if (!/^[A-Z]$/.test(guideLine.rhymeLabel)) {
      pushIssue(issues, 'rhyme_scheme_guide_invalid', guide.passageId, 'Rhyme scheme labels must be single uppercase letters.')
    }
    const existingLabel = rhymeKeyToLabel.get(guideLine.rhymeKey)
    if (!existingLabel) {
      const expectedLabel = String.fromCharCode(65 + expectedLetterIndex)
      if (guideLine.rhymeLabel !== expectedLabel) {
        pushIssue(issues, 'rhyme_scheme_guide_invalid', guide.passageId, 'New rhyme keys must receive the next unused uppercase letter.')
      } else {
        expectedLetterIndex += 1
      }
      rhymeKeyToLabel.set(guideLine.rhymeKey, guideLine.rhymeLabel)
    } else if (existingLabel !== guideLine.rhymeLabel) {
      pushIssue(issues, 'rhyme_scheme_guide_invalid', guide.passageId, 'Repeated rhyme keys must reuse the same letter.')
    }
    if (labelToRhymeKey.has(guideLine.rhymeLabel) && labelToRhymeKey.get(guideLine.rhymeLabel) !== guideLine.rhymeKey) {
      pushIssue(issues, 'rhyme_scheme_guide_invalid', guide.passageId, 'Different rhyme keys must not share the same letter.')
    }
    labelToRhymeKey.set(guideLine.rhymeLabel, guideLine.rhymeKey)
    schemeLabels.push(guideLine.rhymeLabel)
  }

  if (guide.scheme !== schemeLabels.join('')) {
    pushIssue(issues, 'rhyme_scheme_guide_invalid', guide.passageId, 'Rhyme scheme text must match the line labels.')
  }
  if (!guide.lines.length || guide.lines[0]?.rhymeLabel !== 'A') {
    pushIssue(issues, 'rhyme_scheme_guide_invalid', guide.passageId, 'Rhyme schemes must begin with A.')
  }
}

function normalizePoetryText(text: string): string {
  return text.replace(/\r\n?/g, '\n').trim()
}

function extractPoetryEndWord(text: string): string {
  const words = text.trim().match(/[A-Za-z0-9']+/g)
  return words?.at(-1) ?? ''
}

function normalizePerspectiveGuideText(text: string): string {
  return text.trim().replace(/\s+/g, ' ').toLowerCase()
}

function normalizeThemeGuideText(text: string): string {
  return text.trim().replace(/\s+/g, ' ').toLowerCase()
}

function normalizeFluencySpacing(text: string): string {
  return text.trim().replace(/\s+/g, ' ')
}

function normalizeCueLabel(label: string): string {
  return label.trim().toLowerCase().replace(/[^a-z]+/g, '')
}

function getFirstCorrectPosition(question: ContentPack['questions'][number]): number | null {
  if (question.questionContent?.type === 'multiple_choice') {
    const choiceId = question.questionContent.correctChoiceIds[0]
    return question.questionContent.choices.findIndex((choice) => choice.id === choiceId)
  }
  if (question.questionContent?.type === 'multi_select') {
    const choiceId = question.questionContent.correctChoiceIds[0]
    return question.questionContent.choices.findIndex((choice) => choice.id === choiceId)
  }
  if (question.questionContent?.type === 'hot_text') {
    const segmentId = question.questionContent.correctSegmentIds[0]
    return question.questionContent.selectableSegments.findIndex((segment) => segment.id === segmentId)
  }
  if (question.questionContent?.type === 'table_match') {
    const row = question.questionContent.rows[0]
    return row?.options.findIndex((option) => option.id === row.correctChoiceId) ?? null
  }
  return null
}

function validateFluencySupportMetadata(pack: ContentPack, issues: ContentPackAuditIssue[]) {
  const requiredCueKinds = new Set([
    'questioncue',
    'exclamationcue',
    'dialoguecue',
    'listphrasingcue',
    'calminformationaltone',
    'excitedannouncementtone',
  ])
  const observedCueKinds = new Set<string>()

  for (const lesson of pack.lessons) {
    const block = lesson.fluencyPracticeBlock
    if (!block) continue
    for (const cue of block.expressionCues) {
      observedCueKinds.add(normalizeCueLabel(cue.label))
    }
  }

  for (const requiredCueKind of requiredCueKinds) {
    if (!observedCueKinds.has(requiredCueKind)) {
      pushIssue(issues, 'missing_manifest_field', pack.manifest.packId, `Fluency practice requires ${requiredCueKind} expression cues.`)
    }
  }
}
function validateCompareKeepPackStructure(pack: ContentPack, issues: ContentPackAuditIssue[]) {
  const pairedTextSets = pack.pairedTextSets ?? []
  const comparisonGuides = pack.pairedTextComparisonGuides ?? []
  const activeLessons = pack.lessons.filter((lesson) => lesson.selectionStatus === 'active')
  const passagesById = new Map(pack.passages.map((passage) => [passage.passageIdentifier, passage] as const))
  const pairById = new Map<string, NonNullable<ContentPack['pairedTextSets']>[number]>()
  const seenPairIds = new Set<string>()
  const seenPassageIds = new Set<string>()
  const seenGuideIds = new Set<string>()

  if (activeLessons.length !== 7) {
    pushIssue(issues, 'lesson_count_mismatch', pack.manifest.packId, `Expected 7 active lessons, found ${activeLessons.length}.`)
  }
  if (pack.passages.length !== 14) {
    pushIssue(issues, 'passage_count_mismatch', pack.manifest.packId, `Expected 14 passages, found ${pack.passages.length}.`)
  }
  if (pack.questions.length !== 41) {
    pushIssue(issues, 'question_count_mismatch', pack.manifest.packId, `Expected 41 questions, found ${pack.questions.length}.`)
  }
  if (pairedTextSets.length !== 7) {
    pushIssue(
      issues,
      pairedTextSets.length === 0 ? 'missing_paired_text_set' : 'paired_text_set_count_mismatch',
      pack.manifest.packId,
      pairedTextSets.length === 0
        ? 'Compare Keep requires paired text sets.'
        : `Expected 7 paired text sets, found ${pairedTextSets.length}.`,
    )
  }
  if (comparisonGuides.length !== 7) {
    pushIssue(
      issues,
      comparisonGuides.length === 0 ? 'missing_paired_text_comparison_guide' : 'paired_text_comparison_guide_count_mismatch',
      pack.manifest.packId,
      comparisonGuides.length === 0
        ? 'Compare Keep requires paired-text comparison guides.'
        : `Expected 7 paired-text comparison guides, found ${comparisonGuides.length}.`,
    )
  }
  if (activeLessons.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE').length !== 4) {
    pushIssue(issues, 'lesson_count_mismatch', pack.manifest.packId, 'Expected 4 active guided lessons.')
  }
  if (activeLessons.filter((lesson) => lesson.lessonRole === 'CHECKPOINT').length !== 3) {
    pushIssue(issues, 'lesson_count_mismatch', pack.manifest.packId, 'Expected 3 active checkpoint lessons.')
  }
  if (activeLessons.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE' && lesson.difficulty === 2).length !== 2) {
    pushIssue(issues, 'lesson_count_mismatch', pack.manifest.packId, 'Expected 2 guided lessons at difficulty 2.')
  }
  if (activeLessons.filter((lesson) => lesson.lessonRole === 'GUIDED_PRACTICE' && lesson.difficulty === 3).length !== 2) {
    pushIssue(issues, 'lesson_count_mismatch', pack.manifest.packId, 'Expected 2 guided lessons at difficulty 3.')
  }
  if (activeLessons.filter((lesson) => lesson.lessonRole === 'CHECKPOINT' && lesson.difficulty === 3).length !== 3) {
    pushIssue(issues, 'lesson_count_mismatch', pack.manifest.packId, 'Expected 3 checkpoint lessons at difficulty 3.')
  }

  const allSupportTargets = pack.passages.flatMap((passage) => passage.wordSupportTargets ?? [])
  if (allSupportTargets.length !== 28) {
    pushIssue(issues, 'support_target_count_mismatch', pack.manifest.packId, `Expected 28 support targets, found ${allSupportTargets.length}.`)
  }

  for (const passage of pack.passages) {
    const targetCount = passage.wordSupportTargets?.length ?? 0
    if (targetCount !== 2) {
      pushIssue(issues, 'support_target_count_mismatch', passage.passageIdentifier, `Expected 2 support targets per text, found ${targetCount}.`)
    }
  }

  for (const lesson of activeLessons) {
    if (!lesson.pairedTextSetId) {
      pushIssue(issues, 'missing_paired_text_set', lesson.lessonId, 'Every Compare Keep lesson needs a paired text set.')
      continue
    }
    if (lesson.passageIdentifiers.length !== 2) {
      pushIssue(issues, 'paired_text_set_invalid', lesson.lessonId, 'Paired lessons must reference exactly two passages.')
      continue
    }
    const pair = pairedTextSets.find((candidate) => candidate.pairId === lesson.pairedTextSetId)
    if (!pair) {
      pushIssue(issues, 'missing_paired_text_set', lesson.lessonId, `Missing paired text set: ${lesson.pairedTextSetId}`)
      continue
    }
    pairById.set(pair.pairId, pair)
    if (lesson.passageIdentifiers[0] !== pair.members[0].passageId || lesson.passageIdentifiers[1] !== pair.members[1].passageId) {
      pushIssue(issues, 'paired_text_set_invalid', lesson.lessonId, 'Paired lesson passages must match the pair set order.')
    }
  }

  for (const pair of pairedTextSets) {
    if (!pair.pairId.trim()) {
      pushIssue(issues, 'paired_text_set_invalid', pack.manifest.packId, 'Paired text set IDs are required.')
      continue
    }
    if (seenPairIds.has(pair.pairId)) {
      pushIssue(issues, 'paired_text_set_invalid', pair.pairId, `Duplicate paired text set: ${pair.pairId}`)
      continue
    }
    seenPairIds.add(pair.pairId)

    if (pair.reviewStatus !== 'DRAFT') {
      pushIssue(issues, 'missing_draft_status', pair.pairId, 'Paired text sets in this pack must remain DRAFT.')
    }
    if (pair.contentVersion !== pack.manifest.contentVersion) {
      pushIssue(issues, 'mismatched_content_version', pair.pairId, 'Paired text set content version must match the pack version.')
    }
    if (pair.members.length !== 2) {
      pushIssue(issues, 'paired_text_set_invalid', pair.pairId, 'Each paired text set must contain exactly two texts.')
      continue
    }
    if (pair.members[0].label !== 'Text 1' || pair.members[1].label !== 'Text 2') {
      pushIssue(issues, 'paired_text_set_invalid', pair.pairId, 'Paired text members must be labeled Text 1 and Text 2.')
    }
    if (!pair.members[0].displayTitle.trim() || !pair.members[1].displayTitle.trim()) {
      pushIssue(issues, 'paired_text_set_invalid', pair.pairId, 'Paired text display titles are required.')
    }
    if (pair.members[0].passageId === pair.members[1].passageId) {
      pushIssue(issues, 'paired_text_set_invalid', pair.pairId, 'Paired text sets must contain two distinct passages.')
    }
    if (seenPassageIds.has(pair.members[0].passageId) || seenPassageIds.has(pair.members[1].passageId)) {
      pushIssue(issues, 'paired_text_set_invalid', pair.pairId, 'Each Compare Keep passage may appear in only one active pair.')
    }
    seenPassageIds.add(pair.members[0].passageId)
    seenPassageIds.add(pair.members[1].passageId)

    const firstPassage = passagesById.get(pair.members[0].passageId)
    const secondPassage = passagesById.get(pair.members[1].passageId)
    if (!firstPassage || !secondPassage) {
      pushIssue(issues, 'paired_text_set_invalid', pair.pairId, 'Paired text set passages must resolve.')
      continue
    }
    if (!matchesPairedTextFormat(firstPassage, pair.members[0].format) || !matchesPairedTextFormat(secondPassage, pair.members[1].format)) {
      pushIssue(issues, 'paired_text_set_invalid', pair.pairId, 'Paired text formats must match the authored passage kinds.')
    }
    if (pair.formatRelationship === 'same-format' && pair.members[0].format !== pair.members[1].format) {
      pushIssue(issues, 'paired_text_set_invalid', pair.pairId, 'Same-format pairs must use matching text formats.')
    }
    if (pair.formatRelationship === 'different-format' && pair.members[0].format === pair.members[1].format) {
      pushIssue(issues, 'paired_text_set_invalid', pair.pairId, 'Different-format pairs must use different text formats.')
    }
    if (containsUnsafeText(pair.pairTitle) || pair.members.some((member) => containsUnsafeText(member.displayTitle))) {
      pushIssue(issues, 'paired_text_set_invalid', pair.pairId, 'Paired text titles must not contain raw HTML or remote URLs.')
    }
  }

  for (const guide of comparisonGuides) {
    if (!guide.pairId.trim()) {
      pushIssue(issues, 'paired_text_comparison_guide_invalid', pack.manifest.packId, 'Comparison guide pair IDs are required.')
      continue
    }
    if (seenGuideIds.has(guide.pairId)) {
      pushIssue(issues, 'paired_text_comparison_guide_count_mismatch', guide.pairId, `Duplicate comparison guide for pair: ${guide.pairId}`)
      continue
    }
    seenGuideIds.add(guide.pairId)
    const pair = pairById.get(guide.pairId)
    if (!pair) {
      pushIssue(issues, 'missing_paired_text_comparison_guide', guide.pairId, `Missing paired-text comparison guide for ${guide.pairId}.`)
      continue
    }
    if (guide.relationshipKind !== pair.relationshipKind) {
      pushIssue(issues, 'paired_text_comparison_guide_invalid', guide.pairId, 'Comparison guide relationship kind must match the pair set.')
    }
    if (guide.reviewStatus !== 'DRAFT') {
      pushIssue(issues, 'missing_draft_status', guide.pairId, 'Comparison guides in this pack must remain DRAFT.')
    }
    if (guide.contentVersion !== pack.manifest.contentVersion) {
      pushIssue(issues, 'mismatched_content_version', guide.pairId, 'Comparison guide content version must match the pack version.')
    }
    if (!guide.sharedTopicOrThemeStatement.trim()) {
      pushIssue(issues, 'paired_text_comparison_guide_invalid', guide.pairId, 'Comparison guides require a shared topic or theme statement.')
    }
    if (containsUnsafeText(guide.sharedTopicOrThemeStatement)) {
      pushIssue(issues, 'paired_text_comparison_guide_invalid', guide.pairId, 'Comparison guide text must not contain raw HTML or remote URLs.')
    }
    if (guide.text1OtherDetailIds.length === 0 || guide.text2OtherDetailIds.length === 0) {
      pushIssue(issues, 'paired_text_comparison_guide_invalid', guide.pairId, 'Comparison guides require at least one less-important detail from each text.')
    }

    const lesson = activeLessons.find((candidate) => candidate.pairedTextSetId === guide.pairId)
    const minimumPointCount = lesson?.lessonRole === 'CHECKPOINT' ? 3 : 2
    if (guide.importantSimilarities.length < minimumPointCount) {
      pushIssue(issues, 'paired_text_comparison_guide_invalid', guide.pairId, `Comparison guides need at least ${minimumPointCount} important similarities.`)
    }
    if (guide.importantDifferences.length < minimumPointCount) {
      pushIssue(issues, 'paired_text_comparison_guide_invalid', guide.pairId, `Comparison guides need at least ${minimumPointCount} important differences.`)
    }

    const seenPointIds = new Set<string>()
    validateComparisonPoints(issues, pack, pair, guide.importantSimilarities, guide.pairId, seenPointIds)
    validateComparisonPoints(issues, pack, pair, guide.importantDifferences, guide.pairId, seenPointIds)

    for (const otherDetailId of [...guide.text1OtherDetailIds, ...guide.text2OtherDetailIds]) {
      const resolvedText1 = resolveLessonEvidence(passagesById, pair.members[0].passageId, otherDetailId)
      const resolvedText2 = resolveLessonEvidence(passagesById, pair.members[1].passageId, otherDetailId)
      if (!resolvedText1 && !resolvedText2) {
        pushIssue(issues, 'paired_text_comparison_guide_invalid', guide.pairId, `Other-detail evidence must resolve: ${otherDetailId}`)
      }
    }
    if (guide.text1OtherDetailIds.some((id) => overlapsComparisonEvidence(id, guide.importantSimilarities, guide.importantDifferences))) {
      pushIssue(issues, 'paired_text_comparison_guide_invalid', guide.pairId, 'Text 1 other-detail evidence must not overlap required comparison evidence.')
    }
    if (guide.text2OtherDetailIds.some((id) => overlapsComparisonEvidence(id, guide.importantSimilarities, guide.importantDifferences))) {
      pushIssue(issues, 'paired_text_comparison_guide_invalid', guide.pairId, 'Text 2 other-detail evidence must not overlap required comparison evidence.')
    }
    if ([...guide.importantSimilarities, ...guide.importantDifferences].some((point) => containsUnsafeText(point.statement) || containsUnsafeText(point.importanceExplanation))) {
      pushIssue(issues, 'paired_text_comparison_guide_invalid', guide.pairId, 'Comparison point text must not contain raw HTML or remote URLs.')
    }
  }
}

function validateComparisonPoints(
  issues: ContentPackAuditIssue[],
  pack: ContentPack,
  pair: NonNullable<ContentPack['pairedTextSets']>[number],
  points: NonNullable<ContentPack['pairedTextComparisonGuides']>[number]['importantSimilarities'],
  itemIdentifier: string,
  seenPointIds: Set<string>,
) {
  const passagesById = new Map(pack.passages.map((passage) => [passage.passageIdentifier, passage] as const))
  for (const point of points) {
    if (!point.pointId.trim() || !point.statement.trim() || !point.importanceExplanation.trim()) {
      pushIssue(issues, 'paired_text_comparison_guide_invalid', itemIdentifier, 'Comparison points require an ID, statement, and importance explanation.')
    }
    if (seenPointIds.has(point.pointId)) {
      pushIssue(issues, 'paired_text_comparison_guide_invalid', itemIdentifier, `Duplicate comparison point ID: ${point.pointId}`)
    } else {
      seenPointIds.add(point.pointId)
    }
    if (!['character', 'setting', 'event-sequence', 'central-idea', 'important-detail', 'process'].includes(point.dimension)) {
      pushIssue(issues, 'paired_text_comparison_guide_invalid', itemIdentifier, `Invalid comparison dimension: ${point.dimension}`)
    }
    if (!point.text1EvidenceIds.length || !point.text2EvidenceIds.length) {
      pushIssue(issues, 'paired_text_comparison_guide_invalid', itemIdentifier, 'Comparison points require evidence from both texts.')
    }
    for (const evidenceId of point.text1EvidenceIds) {
      const scopedReference = parseScopedEvidenceReference(evidenceId)
      if (!scopedReference || scopedReference.passageId !== pair.members[0].passageId || !resolveLessonEvidence(passagesById, pair.members[0].passageId, evidenceId)) {
        pushIssue(issues, 'paired_text_comparison_guide_invalid', itemIdentifier, `Text 1 evidence must resolve to Text 1: ${evidenceId}`)
      }
    }
    for (const evidenceId of point.text2EvidenceIds) {
      const scopedReference = parseScopedEvidenceReference(evidenceId)
      if (!scopedReference || scopedReference.passageId !== pair.members[1].passageId || !resolveLessonEvidence(passagesById, pair.members[1].passageId, evidenceId)) {
        pushIssue(issues, 'paired_text_comparison_guide_invalid', itemIdentifier, `Text 2 evidence must resolve to Text 2: ${evidenceId}`)
      }
    }
  }
}

function overlapsComparisonEvidence(
  evidenceId: string,
  similarities: NonNullable<ContentPack['pairedTextComparisonGuides']>[number]['importantSimilarities'],
  differences: NonNullable<ContentPack['pairedTextComparisonGuides']>[number]['importantDifferences'],
): boolean {
  return [...similarities, ...differences].some((point) => point.text1EvidenceIds.includes(evidenceId) || point.text2EvidenceIds.includes(evidenceId))
}

function matchesPairedTextFormat(passage: ContentPack['passages'][number], format: string): boolean {
  switch (format) {
    case 'literary-prose':
      return passage.contentKind === 'prose'
    case 'literary-poem':
      return passage.contentKind === 'poem'
    case 'informational':
      return passage.contentKind === 'informational'
    default:
      return false
  }
}

function containsUnsafeText(text: string): boolean {
  return /https?:\/\/|www\.|<[^>]+>/i.test(text)
}

interface BridgePackExpectation {
  packId: string
  passageCount?: number
  guidedDifficultyA: number
  guidedDifficultyB: number
  checkpointPassageCount?: number
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
  if (pack.manifest.benchmarkReferences.includes('ELA.2.R.2.1') && pack.manifest.difficultyRange[0] === 0 && pack.manifest.difficultyRange[1] === 1) {
    return {
      packId: pack.manifest.packId,
      guidedDifficultyA: 0,
      guidedDifficultyB: 1,
      checkpointPatterns: ['informational-text-features', 'feature-meaning'],
      minSupportTargets: 28,
      maxSupportTargets: 28,
      minSupportTargetsPerPassage: 4,
      maxSupportTargetsPerPassage: 4,
      openConsonantLeWords: new Set<string>(),
      closedConsonantLeWords: new Set<string>(),
      forbiddenSilentEWords: new Set<string>(),
      questionTypeCounts: {
        multiple_choice: 17,
        multi_select: 7,
        hot_text: 7,
        table_match: 7,
        two_part: 3,
      },
    }
  }

  if (pack.manifest.benchmarkReferences.includes('ELA.2.R.2.2') && pack.manifest.difficultyRange[0] === 1 && pack.manifest.difficultyRange[1] === 2) {
    return {
      packId: pack.manifest.packId,
      guidedDifficultyA: 1,
      guidedDifficultyB: 2,
      checkpointPatterns: [
        'central-idea',
        'relevant-details',
        'topic-vs-central-idea',
        'central-idea-complete-thought',
        'relevant-detail-identification',
        'most-relevant-details',
        'relevant-details-across-sections',
        'central-idea-from-details',
        'central-idea-and-evidence',
      ],
      minSupportTargets: 28,
      maxSupportTargets: 28,
      minSupportTargetsPerPassage: 4,
      maxSupportTargetsPerPassage: 4,
      openConsonantLeWords: new Set<string>(),
      closedConsonantLeWords: new Set<string>(),
      forbiddenSilentEWords: new Set<string>(),
      questionTypeCounts: {
        multiple_choice: 17,
        multi_select: 7,
        hot_text: 7,
        table_match: 7,
        two_part: 3,
      },
    }
  }

  if (pack.manifest.benchmarkReferences.includes('ELA.2.R.2.3') && pack.manifest.difficultyRange[0] === 2 && pack.manifest.difficultyRange[1] === 3) {
    return {
      packId: pack.manifest.packId,
      guidedDifficultyA: 2,
      guidedDifficultyB: 3,
      checkpointPatterns: [
        'informational-author-purpose',
        'author-purpose-specific',
        'purpose-vs-topic',
        'purpose-vs-central-idea',
        'purpose-vs-detail',
        'purpose-from-text-clues',
        'purpose-from-multiple-sections',
        'purpose-supported-by-text',
      ],
      minSupportTargets: 28,
      maxSupportTargets: 28,
      minSupportTargetsPerPassage: 4,
      maxSupportTargetsPerPassage: 4,
      openConsonantLeWords: new Set<string>(),
      closedConsonantLeWords: new Set<string>(),
      forbiddenSilentEWords: new Set<string>(),
      questionTypeCounts: {
        multiple_choice: 17,
        multi_select: 7,
        hot_text: 7,
        table_match: 7,
        two_part: 3,
      },
    }
  }

  if (pack.manifest.benchmarkReferences.includes('ELA.2.R.2.4') && pack.manifest.difficultyRange[0] === 3 && pack.manifest.difficultyRange[1] === 4) {
    return {
      packId: pack.manifest.packId,
      guidedDifficultyA: 3,
      guidedDifficultyB: 4,
      checkpointPatterns: [
        'opinion',
        'supporting-evidence',
        'author-opinion-identification',
        'multiple-author-opinions',
        'fact-vs-opinion',
        'opinion-vs-topic',
        'opinion-vs-central-idea',
        'opinion-vs-author-purpose',
        'supporting-evidence-identification',
        'opinion-evidence-matching',
        'strongest-supporting-evidence',
        'evidence-connection',
        'evidence-across-sections',
      ],
      minSupportTargets: 28,
      maxSupportTargets: 28,
      minSupportTargetsPerPassage: 4,
      maxSupportTargetsPerPassage: 4,
      openConsonantLeWords: new Set<string>(),
      closedConsonantLeWords: new Set<string>(),
      forbiddenSilentEWords: new Set<string>(),
      questionTypeCounts: {
        multiple_choice: 17,
        multi_select: 7,
        hot_text: 7,
        table_match: 7,
        two_part: 3,
      },
    }
  }

  if (pack.manifest.benchmarkReferences.includes('ELA.2.V.1.1') && pack.manifest.difficultyRange[0] === 0 && pack.manifest.difficultyRange[1] === 1) {
    return {
      packId: pack.manifest.packId,
      guidedDifficultyA: 0,
      guidedDifficultyB: 1,
      checkpointPatterns: ['academic-vocabulary-use', 'speaking-vocabulary-use', 'writing-vocabulary-use', 'cross-subject-vocabulary-use'],
      minSupportTargets: 28,
      maxSupportTargets: 28,
      minSupportTargetsPerPassage: 4,
      maxSupportTargetsPerPassage: 4,
      openConsonantLeWords: new Set<string>(),
      closedConsonantLeWords: new Set<string>(),
      forbiddenSilentEWords: new Set<string>(),
      questionTypeCounts: {
        multiple_choice: 17,
        multi_select: 7,
        hot_text: 7,
        table_match: 7,
        two_part: 3,
      },
    }
  }

  if (pack.manifest.benchmarkReferences.includes('ELA.2.V.1.2') && pack.manifest.difficultyRange[0] === 1 && pack.manifest.difficultyRange[1] === 2) {
    return {
      packId: pack.manifest.packId,
      guidedDifficultyA: 1,
      guidedDifficultyB: 2,
      checkpointPatterns: [
        'base-words',
        'affixes',
        'base-word-identification',
        'base-word-meaning',
        'prefix-identification',
        'suffix-identification',
        'affix-meaning',
        'word-meaning-from-parts',
        'affix-changes-meaning',
        'word-building-for-meaning',
        'transparent-word-composition',
        'prefix-un',
        'prefix-re',
        'prefix-pre',
        'prefix-dis',
        'prefix-mis',
        'suffix-s-es',
        'suffix-ed',
        'suffix-ing',
        'suffix-er-est',
        'suffix-ful-less',
        'suffix-ly',
      ],
      minSupportTargets: 28,
      maxSupportTargets: 28,
      minSupportTargetsPerPassage: 4,
      maxSupportTargetsPerPassage: 4,
      openConsonantLeWords: new Set<string>(),
      closedConsonantLeWords: new Set<string>(),
      forbiddenSilentEWords: new Set<string>(),
      questionTypeCounts: {
        multiple_choice: 17,
        multi_select: 7,
        hot_text: 7,
        table_match: 7,
        two_part: 3,
      },
    }
  }

  if (pack.manifest.benchmarkReferences.includes('ELA.2.V.1.3') && pack.manifest.difficultyRange[0] === 2 && pack.manifest.difficultyRange[1] === 3) {
    return {
      packId: pack.manifest.packId,
      guidedDifficultyA: 2,
      guidedDifficultyB: 3,
      checkpointPatterns: [
        'context-clues',
        'word-relationships',
        'reference-materials',
        'background-knowledge',
        'context-definition',
        'context-restatement',
        'context-example',
        'context-contrast',
        'context-cause-effect',
        'relationship-synonym',
        'relationship-antonym',
        'relationship-category-member',
        'relationship-part-whole',
        'relationship-object-function',
        'glossary-reference',
        'reference-definition-selection',
        'background-knowledge-connection',
        'unknown-word-meaning',
        'strategy-selection',
        'meaning-confirmation',
      ],
      minSupportTargets: 28,
      maxSupportTargets: 28,
      minSupportTargetsPerPassage: 4,
      maxSupportTargetsPerPassage: 4,
      openConsonantLeWords: new Set<string>(),
      closedConsonantLeWords: new Set<string>(),
      forbiddenSilentEWords: new Set<string>(),
      questionTypeCounts: {
        multiple_choice: 17,
        multi_select: 7,
        hot_text: 7,
        table_match: 7,
        two_part: 3,
      },
    }
  }

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

  if (!hasB && !hasC && pack.manifest.benchmarkReferences.includes('ELA.2.R.1.4') && minDifficulty === 0 && maxDifficulty === 1) {
    return {
      packId: pack.manifest.packId,
      guidedDifficultyA: 0,
      guidedDifficultyB: 1,
      checkpointPatterns: [
        'rhyme-scheme-identification',
        'rhyme-scheme-notation',
      ],
      minSupportTargets: 28,
      maxSupportTargets: 28,
      minSupportTargetsPerPassage: 4,
      maxSupportTargetsPerPassage: 4,
      openConsonantLeWords: new Set(),
      closedConsonantLeWords: new Set(),
      forbiddenSilentEWords: new Set(),
      questionTypeCounts: {
        multiple_choice: 17,
        multi_select: 7,
        hot_text: 7,
        table_match: 7,
        two_part: 3,
      },
    }
  }

  if (!hasB && !hasC && pack.manifest.benchmarkReferences.includes('ELA.2.R.1.2') && minDifficulty === 1 && maxDifficulty === 2) {
    return {
      packId: pack.manifest.packId,
      guidedDifficultyA: 1,
      guidedDifficultyB: 2,
      checkpointPatterns: [
        'theme-identification',
        'theme-explanation',
        'theme-as-complete-thought',
        'theme-vs-topic',
        'theme-vs-summary',
        'best-supported-theme',
        'theme-supported-by-character-actions',
        'theme-supported-by-events',
        'theme-supported-by-outcome',
        'theme-supported-by-details',
      ],
      minSupportTargets: 28,
      maxSupportTargets: 28,
      minSupportTargetsPerPassage: 4,
      maxSupportTargetsPerPassage: 4,
      openConsonantLeWords: new Set(),
      closedConsonantLeWords: new Set(),
      forbiddenSilentEWords: new Set(),
      questionTypeCounts: {
        multiple_choice: 17,
        multi_select: 7,
        hot_text: 7,
        table_match: 7,
        two_part: 3,
      },
    }
  }

  if (!hasB && !hasC && pack.manifest.benchmarkReferences.includes('ELA.2.R.1.3') && minDifficulty === 2 && maxDifficulty === 3) {
    return {
      packId: pack.manifest.packId,
      guidedDifficultyA: 2,
      guidedDifficultyB: 3,
      checkpointPatterns: [
        'character-perspective-identification',
        'different-character-perspectives',
        'perspective-as-attitude',
        'shared-event-different-views',
        'perspective-from-words',
        'perspective-from-actions',
        'perspective-from-feelings',
        'perspective-from-choices',
        'perspective-from-noticing',
        'perspective-supported-by-details',
        'perspective-vs-narrator-point-of-view',
      ],
      minSupportTargets: 28,
      maxSupportTargets: 28,
      minSupportTargetsPerPassage: 4,
      maxSupportTargetsPerPassage: 4,
      openConsonantLeWords: new Set(),
      closedConsonantLeWords: new Set(),
      forbiddenSilentEWords: new Set(),
      questionTypeCounts: {
        multiple_choice: 17,
        multi_select: 7,
        hot_text: 7,
        table_match: 7,
        two_part: 3,
      },
    }
  }

  if (!hasB && !hasC && pack.manifest.benchmarkReferences.includes('ELA.2.R.1.1') && minDifficulty === 0 && maxDifficulty === 1) {
    return {
      packId: pack.manifest.packId,
      guidedDifficultyA: 0,
      guidedDifficultyB: 1,
      checkpointPatterns: [
        'plot-structure',
        'setting',
        'characters',
        'sequence-of-events',
        'plot-beginning-middle-end',
        'plot-problem-resolution',
        'setting-where',
        'setting-when',
        'character-traits',
        'character-feelings',
        'character-behaviors',
        'event-sequencing',
      ],
      minSupportTargets: 28,
      maxSupportTargets: 28,
      minSupportTargetsPerPassage: 4,
      maxSupportTargetsPerPassage: 4,
      openConsonantLeWords: new Set(),
      closedConsonantLeWords: new Set(),
      forbiddenSilentEWords: new Set(),
      questionTypeCounts: {
        multiple_choice: 17,
        multi_select: 7,
        hot_text: 7,
        table_match: 7,
        two_part: 3,
      },
    }
  }

  if (pack.manifest.benchmarkReferences.includes('ELA.2.R.3.2') && pack.manifest.difficultyRange[0] === 1 && pack.manifest.difficultyRange[1] === 2) {
    return {
      packId: pack.manifest.packId,
      guidedDifficultyA: 1,
      guidedDifficultyB: 2,
      checkpointPatterns: [
        'literary-retell',
        'informational-retell',
        'structured-retell',
        'retell-important-vs-minor',
        'retell-use-each-once',
        'literary-main-characters',
        'literary-setting',
        'literary-problem',
        'literary-important-events',
        'literary-resolution',
        'literary-logical-sequence',
        'literary-retell-completeness',
        'informational-central-idea',
        'informational-relevant-details',
        'informational-details-across-sections',
        'informational-retell-order',
        'informational-retell-completeness',
      ],
      minSupportTargets: 28,
      maxSupportTargets: 28,
      minSupportTargetsPerPassage: 4,
      maxSupportTargetsPerPassage: 4,
      openConsonantLeWords: new Set<string>(),
      closedConsonantLeWords: new Set<string>(),
      forbiddenSilentEWords: new Set<string>(),
      questionTypeCounts: {
        multiple_choice: 17,
        multi_select: 7,
        hot_text: 7,
        table_match: 7,
        two_part: 3,
      },
    }
  }

  if (pack.manifest.benchmarkReferences.includes('ELA.2.R.3.3') && pack.manifest.difficultyRange[0] === 2 && pack.manifest.difficultyRange[1] === 3) {
    return {
      packId: pack.manifest.packId,
      passageCount: 14,
      guidedDifficultyA: 2,
      guidedDifficultyB: 3,
      checkpointPassageCount: 2,
      checkpointPatterns: [
        'compare-contrast-important-details',
        'same-topic-or-theme',
        'paired-text-reading',
        'text-1-text-2-evidence',
        'important-detail-identification',
        'important-vs-minor-detail',
        'similarity-identification',
        'difference-identification',
        'comparison-evidence',
        'same-topic-pair',
        'same-theme-pair',
        'same-format-pair',
        'different-format-pair',
        'literary-character-comparison',
        'literary-setting-comparison',
        'literary-event-sequence-comparison',
        'informational-central-idea-comparison',
        'informational-detail-comparison',
        'informational-process-comparison',
        'structured-compare-contrast',
      ],
      minSupportTargets: 28,
      maxSupportTargets: 28,
      minSupportTargetsPerPassage: 2,
      maxSupportTargetsPerPassage: 2,
      openConsonantLeWords: new Set<string>(),
      closedConsonantLeWords: new Set<string>(),
      forbiddenSilentEWords: new Set<string>(),
      questionTypeCounts: {
        multiple_choice: 17,
        multi_select: 7,
        hot_text: 7,
        table_match: 7,
        two_part: 3,
      },
    }
  }

  if (pack.manifest.benchmarkReferences.includes('ELA.2.R.3.1') && pack.manifest.difficultyRange[0] === 0 && pack.manifest.difficultyRange[1] === 1) {
    return {
      packId: pack.manifest.packId,
      guidedDifficultyA: 0,
      guidedDifficultyB: 1,
      checkpointPatterns: [
        'similes',
        'idioms',
        'alliteration',
        'simile-identification',
        'simile-comparison',
        'simile-shared-quality',
        'literal-like-as-distinction',
        'idiom-identification',
        'idiom-meaning-in-context',
        'literal-vs-nonliteral',
        'alliteration-identification',
        'repeated-beginning-sound',
        'sound-not-letter',
        'wordplay-explanation',
        'prose-wordplay',
        'poetry-wordplay',
      ],
      minSupportTargets: 28,
      maxSupportTargets: 28,
      minSupportTargetsPerPassage: 4,
      maxSupportTargetsPerPassage: 4,
      openConsonantLeWords: new Set<string>(),
      closedConsonantLeWords: new Set<string>(),
      forbiddenSilentEWords: new Set<string>(),
      questionTypeCounts: {
        multiple_choice: 17,
        multi_select: 7,
        hot_text: 7,
        table_match: 7,
        two_part: 3,
      },
    }
  }

  return null
}
