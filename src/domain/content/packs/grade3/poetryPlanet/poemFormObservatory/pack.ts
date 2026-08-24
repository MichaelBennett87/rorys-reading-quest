import type { ContentPack } from '../../../contentPackTypes'
import { POEM_FORM_BENCHMARK, POEM_FORM_PACK_ID, POEM_FORM_SKILL_ID, POEM_FORM_UNIT_ID, POEM_FORM_VERSION, POEM_FORM_WORLD_ID } from './ids'
import { poemFormGuides, poemFormPassages } from './poems'
import { poemFormLessons, poemFormQuestions } from './questions'

export const poemFormObservatoryPack: ContentPack = {
  manifest: {
    packId: POEM_FORM_PACK_ID,
    packTitle: 'Grade 3 Poetry Planet: Poem Form Observatory',
    gradeBand: 3, worldId: POEM_FORM_WORLD_ID, unitId: POEM_FORM_UNIT_ID,
    primarySkillId: POEM_FORM_SKILL_ID, benchmarkReferences: [POEM_FORM_BENCHMARK], coverageKind: 'benchmark',
    partialBenchmarkCoverage: 'Grade 3 identification of free verse, rhymed verse, haiku, and limerick using multiple learner-visible structural clues and text evidence.',
    difficultyRange: [0, 1], contentVersion: POEM_FORM_VERSION, reviewStatus: 'DRAFT',
    coveredPatterns: ['free-verse', 'rhymed-verse', 'haiku', 'limerick'],
    passageIds: poemFormPassages.map((passage) => passage.passageIdentifier),
    questionIds: poemFormQuestions.map((question) => question.questionIdentifier),
    lessonIds: poemFormLessons.map((lesson) => lesson.lessonId),
  },
  passages: poemFormPassages, questions: poemFormQuestions, lessons: poemFormLessons, poemFormGuides,
}
