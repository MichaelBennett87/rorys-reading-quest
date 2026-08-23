import type { PoemStructure, Passage, WordSupportTarget } from '../../../../types'
import type { InformationalTextStructure } from '../../../../informationalTypes'
import { COMPARE_KEEP_CONTENT_VERSION } from './ids'

export interface SentencePlan {
  sentenceId: string
  text: string
}

export interface SupportTargetPlan {
  sentenceIndex: number
  surfaceWord: string
  chunks: [string, string]
}

export interface ProsePassagePlan {
  passageId: string
  sentences: SentencePlan[]
  supportTargetPlans: SupportTargetPlan[]
}

export interface PoemPassagePlan {
  passageId: string
  sentences: SentencePlan[]
  supportTargetPlans: SupportTargetPlan[]
  stanzas: {
    stanzaId: string
    lineNumbers: number[]
  }[]
}

export interface InformationalPassagePlan {
  passageId: string
  titleFeatureId: string
  titleText: string
  sections: {
    sectionId: string
    headingFeatureId: string
    headingText: string
    sentenceIndexes: number[]
  }[]
  sentences: SentencePlan[]
  supportTargetPlans: SupportTargetPlan[]
}

function normalizeId(text: string): string {
  return text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

function makeSupportTarget(
  passageId: string,
  sentence: SentencePlan,
  surfaceWord: string,
  chunks: [string, string],
): WordSupportTarget {
  return {
    targetId: `${passageId}-support-${normalizeId(surfaceWord)}`,
    passageId,
    sentenceId: sentence.sentenceId,
    surfaceWord,
    focusParts: [
      { text: chunks[0], emphasis: true },
      { text: chunks[1], emphasis: false },
    ],
    displayChunks: [
      { displayText: chunks[0], speechText: chunks[0] },
      { displayText: chunks[1], speechText: chunks[1] },
    ],
    spokenChunks: [
      { displayText: chunks[0], speechText: chunks[0] },
      { displayText: chunks[1], speechText: chunks[1] },
    ],
    blendSpeechText: surfaceWord,
    wholeWordSpeechText: surfaceWord,
    sentenceSpeechText: sentence.text,
    reviewStatus: 'DRAFT',
    contentVersion: COMPARE_KEEP_CONTENT_VERSION,
  }
}

export function buildProsePassage(plan: ProsePassagePlan): Passage {
  return {
    passageIdentifier: plan.passageId,
    gradeBand: 2,
    contentKind: 'prose',
    passageText: plan.sentences.map((sentence) => sentence.text).join(' '),
    sentences: plan.sentences.map((sentence, index) => ({
      sentenceId: sentence.sentenceId,
      lineNumber: index + 1,
      text: sentence.text,
    })),
    readingContext: 'Compare Castle Compare Keep',
    contentVersion: COMPARE_KEEP_CONTENT_VERSION,
    reviewStatus: 'DRAFT',
    wordSupportTargets: plan.supportTargetPlans.map((target) =>
      makeSupportTarget(
        plan.passageId,
        plan.sentences[target.sentenceIndex],
        target.surfaceWord,
        target.chunks,
      ),
    ),
  }
}

export function buildPoemPassage(plan: PoemPassagePlan): Passage {
  const lineLookup = new Map<number, SentencePlan>()
  for (let index = 0; index < plan.sentences.length; index += 1) {
    lineLookup.set(index + 1, plan.sentences[index]!)
  }

  const lines = plan.sentences.map((sentence, index) => ({
    lineId: sentence.sentenceId,
    lineNumber: index + 1,
    text: sentence.text,
    stanzaId: plan.stanzas.find((stanza) => stanza.lineNumbers.includes(index + 1))?.stanzaId ?? plan.stanzas[0]?.stanzaId ?? 'stanza-1',
  }))

  const poemStructure: PoemStructure = {
    lines,
    stanzas: plan.stanzas.map((stanza) => ({
      stanzaId: stanza.stanzaId,
      lineIds: stanza.lineNumbers.map((lineNumber) => lineLookup.get(lineNumber)!.sentenceId),
    })),
  }

  return {
    passageIdentifier: plan.passageId,
    gradeBand: 2,
    contentKind: 'poem',
    passageText: lines.map((line) => line.text).join('\n'),
    sentences: lines.map((line) => ({
      sentenceId: line.lineId,
      lineNumber: line.lineNumber,
      stanzaId: line.stanzaId,
      text: line.text,
    })),
    readingContext: 'Compare Castle Compare Keep',
    contentVersion: COMPARE_KEEP_CONTENT_VERSION,
    reviewStatus: 'DRAFT',
    poemStructure,
    wordSupportTargets: plan.supportTargetPlans.map((target) =>
      makeSupportTarget(
        plan.passageId,
        plan.sentences[target.sentenceIndex],
        target.surfaceWord,
        target.chunks,
      ),
    ),
  }
}

export function buildInformationalPassage(plan: InformationalPassagePlan): Passage {
  const structure: InformationalTextStructure = {
    titleFeatureId: plan.titleFeatureId,
    features: [
      {
        featureId: plan.titleFeatureId,
        kind: 'title',
        text: plan.titleText,
      },
      ...plan.sections.map((section) => ({
        featureId: section.headingFeatureId,
        kind: 'heading' as const,
        sectionId: section.sectionId,
        text: section.headingText,
      })),
    ],
    sections: plan.sections.map((section) => ({
      sectionId: section.sectionId,
      headingFeatureId: section.headingFeatureId,
      sentenceIds: section.sentenceIndexes.map((sentenceIndex) => plan.sentences[sentenceIndex]!.sentenceId),
      featureIds: [] as string[],
    })),
  }

  return {
    passageIdentifier: plan.passageId,
    gradeBand: 2,
    contentKind: 'informational',
    passageText: plan.sentences.map((sentence) => sentence.text).join(' '),
    sentences: plan.sentences.map((sentence, index) => ({
      sentenceId: sentence.sentenceId,
      lineNumber: index + 1,
      text: sentence.text,
    })),
    readingContext: 'Compare Castle Compare Keep',
    contentVersion: COMPARE_KEEP_CONTENT_VERSION,
    reviewStatus: 'DRAFT',
    informationalStructure: structure,
    wordSupportTargets: plan.supportTargetPlans.map((target) =>
      makeSupportTarget(
        plan.passageId,
        plan.sentences[target.sentenceIndex],
        target.surfaceWord,
        target.chunks,
      ),
    ),
  }
}
