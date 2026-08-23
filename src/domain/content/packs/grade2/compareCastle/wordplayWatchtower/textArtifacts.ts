import type { PoemStructure, Passage, WordSupportTarget } from '../../../../types'
import type {
  AlliterativeWord,
  AlliterationWordplayTarget,
  IdiomWordplayTarget,
  SimileWordplayTarget,
  WordplayGuide,
  WordplayKind,
  WordplayTarget,
} from '../../../contentPackTypes'
import { WORDPLAY_WATCHTOWER_CONTENT_VERSION } from './ids'

export interface WordplayLineDefinition {
  sentenceId: string
  text: string
  lineNumber: number
  stanzaId?: string
}

interface WordplaySupportTargetPlan {
  sentenceIndex: number
  surfaceWord: string
  split: [string, string]
}

interface WordplayTargetPlanBase {
  targetId: string
  kind: WordplayKind
  expressionText: string
  sentenceIndex: number
  evidenceSentenceIndexes: readonly number[]
  explanationStatement: string
}

interface WordplaySimilePlan extends WordplayTargetPlanBase {
  kind: 'simile'
  signalWord: 'like' | 'as'
  comparisonSubject: string
  comparisonObject: string
  sharedQuality: string
  figurativeComparison: true
}

interface WordplayIdiomPlan extends WordplayTargetPlanBase {
  kind: 'idiom'
  intendedMeaning: string
  literalReading: string
  contextEvidenceSentenceIndexes: readonly number[]
  nonliteral: true
}

interface WordplayAlliterationPlan extends WordplayTargetPlanBase {
  kind: 'alliteration'
  alliterativeWords: readonly AlliterativeWord[]
  repeatedInitialSound: string
  soundExplanation: string
}

export type WordplayTargetPlan =
  | WordplaySimilePlan
  | WordplayIdiomPlan
  | WordplayAlliterationPlan

export interface WordplayTextPlan {
  passageId: string
  title: string
  readingContext: string
  bodyKind: 'prose' | 'poem'
  lines: readonly WordplayLineDefinition[]
  supportTargets: readonly WordplaySupportTargetPlan[]
  targetPlans: readonly WordplayTargetPlan[]
  stanzas?: readonly {
    stanzaId: string
    lineNumbers: readonly number[]
  }[]
}

export interface WordplayTextArtifact {
  passage: Passage
  guide: WordplayGuide
  targets: WordplayTarget[]
  supportTargets: WordSupportTarget[]
}

function normalizeWordplayText(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ')
}

function makeSupportTarget(
  passageId: string,
  sentence: WordplayLineDefinition,
  surfaceWord: string,
  split: [string, string],
): WordSupportTarget {
  const [first, second] = split
  return {
    targetId: `${passageId}-support-${sentence.sentenceId}-${normalizeWordplayText(surfaceWord).replace(/\s+/g, '-')}`,
    passageId,
    sentenceId: sentence.sentenceId,
    surfaceWord,
    focusParts: [
      { text: first, emphasis: false },
      { text: second, emphasis: true },
    ],
    displayChunks: [
      { displayText: first, speechText: first },
      { displayText: second, speechText: second },
    ],
    spokenChunks: [
      { displayText: first, speechText: first },
      { displayText: second, speechText: second },
    ],
    blendSpeechText: surfaceWord,
    wholeWordSpeechText: surfaceWord,
    sentenceSpeechText: sentence.text,
    reviewStatus: 'DRAFT',
    contentVersion: WORDPLAY_WATCHTOWER_CONTENT_VERSION,
  }
}

function buildGuideTarget(
  plan: WordplayTargetPlan,
  lines: WordplayLineDefinition[],
): WordplayTarget {
  const sentence = lines[plan.sentenceIndex]
  const evidenceReferenceIds = plan.evidenceSentenceIndexes.map((index) => lines[index]!.sentenceId)
  switch (plan.kind) {
    case 'simile':
      return {
        targetId: plan.targetId,
        kind: 'simile',
        expressionText: plan.expressionText,
        sentenceId: sentence.sentenceId,
        evidenceReferenceIds,
        explanationStatement: plan.explanationStatement,
        signalWord: plan.signalWord,
        comparisonSubject: plan.comparisonSubject,
        comparisonObject: plan.comparisonObject,
        sharedQuality: plan.sharedQuality,
        figurativeComparison: true,
      } satisfies SimileWordplayTarget
    case 'idiom':
      return {
        targetId: plan.targetId,
        kind: 'idiom',
        expressionText: plan.expressionText,
        sentenceId: sentence.sentenceId,
        evidenceReferenceIds,
        explanationStatement: plan.explanationStatement,
        intendedMeaning: plan.intendedMeaning,
        literalReading: plan.literalReading,
        contextEvidenceIds: plan.contextEvidenceSentenceIndexes.map((index) => lines[index]!.sentenceId),
        nonliteral: true,
      } satisfies IdiomWordplayTarget
    case 'alliteration':
      return {
        targetId: plan.targetId,
        kind: 'alliteration',
        expressionText: plan.expressionText,
        sentenceId: sentence.sentenceId,
        evidenceReferenceIds,
        explanationStatement: plan.explanationStatement,
        alliterativeWords: plan.alliterativeWords.map((word) => ({ ...word })),
        repeatedInitialSound: plan.repeatedInitialSound,
        soundExplanation: plan.soundExplanation,
      } satisfies AlliterationWordplayTarget
  }
}

export function buildWordplayTextArtifact(plan: WordplayTextPlan): WordplayTextArtifact {
  const lines = plan.lines.map((line) => ({ ...line }))
  const passage: Passage = {
    passageIdentifier: plan.passageId,
    gradeBand: 2,
    passageText: plan.bodyKind === 'poem'
      ? lines.map((line) => line.text).join('\n')
      : lines.map((line) => line.text).join(' '),
    contentKind: plan.bodyKind,
    sentences: lines.map((line) => ({
      sentenceId: line.sentenceId,
      lineNumber: line.lineNumber,
      stanzaId: line.stanzaId,
      text: line.text,
    })),
    poemStructure: plan.bodyKind === 'poem'
      ? buildPoemStructure(lines, plan.stanzas ?? [])
      : undefined,
    readingContext: plan.readingContext,
    contentVersion: WORDPLAY_WATCHTOWER_CONTENT_VERSION,
    reviewStatus: 'DRAFT',
    wordSupportTargets: plan.supportTargets.map((supportTarget) =>
      makeSupportTarget(plan.passageId, lines[supportTarget.sentenceIndex]!, supportTarget.surfaceWord, supportTarget.split),
    ),
  }

  const guide: WordplayGuide = {
    passageId: plan.passageId,
    targets: plan.targetPlans.map((targetPlan) => buildGuideTarget(targetPlan, lines)),
    reviewStatus: 'DRAFT',
    contentVersion: WORDPLAY_WATCHTOWER_CONTENT_VERSION,
  }

  return {
    passage,
    guide,
    targets: guide.targets,
    supportTargets: passage.wordSupportTargets ?? [],
  }
}

function buildPoemStructure(
  lines: readonly WordplayLineDefinition[],
  stanzas: readonly { stanzaId: string; lineNumbers: readonly number[] }[],
): PoemStructure {
  return {
    lines: lines.map((line) => ({
      lineId: line.sentenceId,
      lineNumber: line.lineNumber,
      stanzaId: line.stanzaId ?? stanzas[0]?.stanzaId ?? `${line.sentenceId}-stanza`,
      text: line.text,
    })),
    stanzas: stanzas.map((stanza) => ({
      stanzaId: stanza.stanzaId,
      lineIds: stanza.lineNumbers.map((lineNumber) => lines.find((line) => line.lineNumber === lineNumber)?.sentenceId ?? `${stanza.stanzaId}-${lineNumber}`),
    })),
  }
}
