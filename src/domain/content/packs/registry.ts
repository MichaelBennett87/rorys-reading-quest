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
import { grade2ContextCavernMeaningClueChamberPack } from './grade2/contextCavern/meaningClueChamber'
import { grade2CompareCastleWordplayWatchtowerPack } from './grade2/compareCastle/wordplayWatchtower'
import { grade2CompareCastleRetellHallPack } from './grade2/compareCastle/retellHall'
import { grade2CompareCastleCompareKeepPack } from './grade2/compareCastle/compareKeep'
import { grade3WordForgeRootReactorPack } from './grade3/wordForge/rootReactor'
import { grade3WordForgeSuffixShifterPack } from './grade3/wordForge/suffixShifter'
import { grade3WordForgeMultisyllableMountainPack } from './grade3/wordForge/multisyllableMountain'
import { grade3WordForgeFluencyFlightPack } from './grade3/wordForge/fluencyFlight'
import { characterArcCampPack } from './grade3/storyScouts/characterArcCamp'
import { themeDevelopmentTrailPack } from './grade3/storyScouts/themeDevelopmentTrail'
import { perspectivePortalPack } from './grade3/storyScouts/perspectivePortal'
import { poemFormObservatoryPack } from './grade3/poetryPlanet/poemFormObservatory'
import { structureStationPack } from './grade3/informationDetectives/structureStation'
import { centralIdeaEnginePack } from './grade3/informationDetectives/centralIdeaEngine'
import { purposeDevelopmentPack } from './grade3/informationDetectives/purposeDevelopmentPath'
import { claimEvidenceCourtPack } from './grade3/informationDetectives/claimEvidenceCourt'
import { figurativeFortressPack } from './grade3/compareCastle/figurativeFortress'
import { summaryStrongholdPack } from './grade3/compareCastle/summaryStronghold'
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
  grade2ContextCavernMeaningClueChamberPack,
  grade2CompareCastleWordplayWatchtowerPack,
  grade2CompareCastleRetellHallPack,
  grade2CompareCastleCompareKeepPack,
  grade3WordForgeRootReactorPack,
  grade3WordForgeSuffixShifterPack,
  grade3WordForgeMultisyllableMountainPack,
  grade3WordForgeFluencyFlightPack,
  characterArcCampPack,
  themeDevelopmentTrailPack,
  perspectivePortalPack,
  poemFormObservatoryPack,
  structureStationPack,
  centralIdeaEnginePack,
  purposeDevelopmentPack,
  claimEvidenceCourtPack,
  figurativeFortressPack,
  summaryStrongholdPack,
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
    pairedTextSets: packs.flatMap((pack) => pack.pairedTextSets?.map((pair) => structuredClone(pair)) ?? []),
  } as ContentSample
}
