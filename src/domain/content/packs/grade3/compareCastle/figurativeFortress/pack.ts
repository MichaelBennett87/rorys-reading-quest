import type { ContentPack } from '../../../contentPackTypes'
import { figurativeFortressPassages, figurativeLanguageGuides } from './content'
import {
  FIGURATIVE_FORTRESS_BENCHMARK, FIGURATIVE_FORTRESS_PACK_ID, FIGURATIVE_FORTRESS_PASSAGE_IDS,
  FIGURATIVE_FORTRESS_SKILL_ID, FIGURATIVE_FORTRESS_UNIT_ID, FIGURATIVE_FORTRESS_VERSION, FIGURATIVE_FORTRESS_WORLD_ID,
} from './ids'
import { figurativeFortressLessons, figurativeFortressQuestions } from './questions'

export const figurativeFortressPack: ContentPack = {
  manifest: {
    packId: FIGURATIVE_FORTRESS_PACK_ID, packTitle: 'Grade 3 Compare Castle: Figurative Fortress', gradeBand: 3,
    worldId: FIGURATIVE_FORTRESS_WORLD_ID, unitId: FIGURATIVE_FORTRESS_UNIT_ID, primarySkillId: FIGURATIVE_FORTRESS_SKILL_ID,
    benchmarkReferences: [FIGURATIVE_FORTRESS_BENCHMARK], coverageKind: 'benchmark',
    partialBenchmarkCoverage: 'Grade 3 identification and explanation of metaphors, personification, and hyperbole across original literary prose, poetry, and informational text, including context-supported figurative meaning and literal-versus-nonliteral distinctions.',
    difficultyRange: [0, 1], contentVersion: FIGURATIVE_FORTRESS_VERSION, reviewStatus: 'DRAFT',
    coveredPatterns: ['metaphors', 'personification', 'hyperbole', 'figurative-meaning', 'literal-vs-nonliteral'],
    passageIds: [...FIGURATIVE_FORTRESS_PASSAGE_IDS], questionIds: figurativeFortressQuestions.map((question) => question.questionIdentifier),
    lessonIds: figurativeFortressLessons.map((lesson) => lesson.lessonId),
  },
  passages: figurativeFortressPassages, questions: figurativeFortressQuestions, lessons: figurativeFortressLessons,
  figurativeLanguageGuides,
}
