import { grade2WordForgeVariableVowelsOoEaPack } from './grade2/wordForge/variableVowelsOoEa'
import { grade2WordForgeVariableVowelsOuOiOyOwPack } from './grade2/wordForge/variableVowelsOuOiOyOw'
import { grade2WordForgeTwoSyllableOpenClosedPack } from './grade2/wordForge/twoSyllableOpenClosed'
import { grade2WordForgeConsonantLePack } from './grade2/wordForge/consonantLeIntegrated'
import { grade2WordForgeCommonPrefixesPack } from './grade2/wordForge/commonPrefixes'
import { grade2WordForgeCommonSuffixesPack } from './grade2/wordForge/commonSuffixes'
import { grade2WordForgeSilentLetterCombinationsPack } from './grade2/wordForge/silentLetterCombinations'
import { grade2WordForgeFluencyPracticePack } from './grade2/wordForge/fluencyPracticeFoundations'
import { grade2StoryScoutsPlotStructureElementsPack } from './grade2/storyScouts/plotStructureElements'
import { grade2StoryScoutsThemeTrailPack } from './grade2/storyScouts/themeTrail'
import { grade2StoryScoutsPerspectivePortalPack } from './grade2/storyScouts/perspectivePortal'
import { grade2PoetryPlanetRhymeRoutesPack } from './grade2/poetryPlanet/rhymeRoutes'
import { grade2InformationDetectivesTextFeatureHuntPack } from './grade2/informationDetectives/textFeatureHunt'
import { grade2InformationDetectivesCentralIdeaCenterPack } from './grade2/informationDetectives/centralIdeaCenter'
import { grade2InformationDetectivesPurposePathPack } from './grade2/informationDetectives/purposePath'
import { grade2InformationDetectivesOpinionEvidenceDeskPack } from './grade2/informationDetectives/opinionEvidenceDesk'
import { grade2ContextCavernAcademicWordWorkshopPack } from './grade2/contextCavern/academicWordWorkshop'
import { grade2ContextCavernMorphologyMinePack } from './grade2/contextCavern/morphologyMine'
import { legacyDevelopmentPack } from './legacyDevelopmentPack'
import type { ContentPack } from './contentPackTypes'
import type { ContentSample } from '../types'
import { buildBenchmarkCoverageAudit } from './benchmarkCoverageAudit'
import { buildContentPackAudit } from './contentPackAudit'

export const contentPacks: readonly ContentPack[] = [
  grade2WordForgeVariableVowelsOoEaPack,
  grade2WordForgeVariableVowelsOuOiOyOwPack,
  grade2WordForgeTwoSyllableOpenClosedPack,
  grade2WordForgeConsonantLePack,
  grade2WordForgeCommonPrefixesPack,
  grade2WordForgeCommonSuffixesPack,
  grade2WordForgeSilentLetterCombinationsPack,
  grade2WordForgeFluencyPracticePack,
  grade2StoryScoutsPlotStructureElementsPack,
  grade2StoryScoutsThemeTrailPack,
  grade2StoryScoutsPerspectivePortalPack,
  grade2PoetryPlanetRhymeRoutesPack,
  grade2InformationDetectivesTextFeatureHuntPack,
  grade2InformationDetectivesCentralIdeaCenterPack,
  grade2InformationDetectivesPurposePathPack,
  grade2InformationDetectivesOpinionEvidenceDeskPack,
  grade2ContextCavernAcademicWordWorkshopPack,
  grade2ContextCavernMorphologyMinePack,
  legacyDevelopmentPack,
]

export const sampleContent: ContentSample = aggregateSampleContent(contentPacks)

export const contentPackAudit = buildContentPackAudit(contentPacks)
export const benchmarkCoverageAudit = buildBenchmarkCoverageAudit(contentPacks, 'ELA.2.F.1.3a')

export function getActiveContentPacks(): readonly ContentPack[] {
  return contentPacks.filter((pack) => !pack.manifest.packId.startsWith('legacy-'))
}

export function getActiveContentRegistryTotals() {
  const activePacks = getActiveContentPacks()
  return {
    activePackCount: activePacks.length,
    activeLessonCount: activePacks.reduce((sum, pack) => sum + pack.lessons.length, 0),
    activePassageCount: activePacks.reduce((sum, pack) => sum + pack.passages.length, 0),
    activeQuestionCount: activePacks.reduce((sum, pack) => sum + pack.questions.length, 0),
    activeSupportTargetCount: activePacks.reduce(
      (sum, pack) => sum + pack.passages.reduce((passageSum, passage) => passageSum + (passage.wordSupportTargets?.length ?? 0), 0),
      0,
    ),
  }
}

function aggregateSampleContent(packs: readonly ContentPack[]): ContentSample {
  return {
    passages: packs.flatMap((pack) => pack.passages.map((passage) => structuredClone(passage))),
    questions: packs.flatMap((pack) => pack.questions.map((question) => structuredClone(question))),
  }
}
