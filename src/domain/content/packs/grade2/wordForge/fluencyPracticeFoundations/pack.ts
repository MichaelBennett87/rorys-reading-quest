import type { ContentPack } from '../../../contentPackTypes'
import { grade2WordForgeFluencyPracticeLessons, grade2WordForgeFluencyPracticeManifest } from './manifest'
import { grade2WordForgeFluencyPracticePassages } from './passages'
import { grade2WordForgeFluencyPracticeQuestions } from './questions'

export const grade2WordForgeFluencyPracticePack: ContentPack = {
  manifest: grade2WordForgeFluencyPracticeManifest,
  passages: grade2WordForgeFluencyPracticePassages,
  questions: grade2WordForgeFluencyPracticeQuestions,
  lessons: grade2WordForgeFluencyPracticeLessons,
}
