import { RETELL_HALL_CONTENT_VERSION } from './ids'

export function buildCommonQuestionFields(
  genre: 'literary' | 'informational',
  tags: string[],
  difficulty: 1 | 2,
  passageIdentifier: string,
  lessonIdentifier: string,
  questionIdentifier: string,
) {
  return {
    benchmarkReference: 'ELA.2.R.3.2' as const,
    skillIdentifier: 'g2-across-genres-reading' as const,
    reportingCategory: 'Reading Across Genres and Vocabulary' as const,
    genre,
    gradeBand: 2 as const,
    estimatedReadingLevel: 'Grade 2' as const,
    reviewStatus: 'DRAFT' as const,
    contentVersion: RETELL_HALL_CONTENT_VERSION,
    difficulty,
    passageIdentifier,
    lessonIdentifier,
    questionIdentifier,
    targetVocabulary: [] as string[],
    soundOutChunks: [] as string[],
    tags: [...tags],
  }
}

export const joinWords = (text: string) => text.split(/\s+/).filter(Boolean)
