import type { PerspectiveGuide } from '../../../contentPackTypes'
import {
  PERSPECTIVE_PORTAL_CONTENT_VERSION,
  perspectivePortalSentenceId,
} from './ids'
import { perspectivePortalPassageBlueprints } from './passages'

function guideFromBlueprint(index: number, blueprint = perspectivePortalPassageBlueprints[index]) {
  return {
    passageId: blueprint.passageIdentifier,
    sharedSituation: blueprint.sharedSituation,
    characters: blueprint.characters.map((character) => ({
      characterId: character.characterId,
      characterName: character.characterName,
      perspectiveStatement: character.perspectiveStatement,
      supportingSentenceIds: character.supportingSentenceNumbers.map((sentenceNumber) =>
        perspectivePortalSentenceId(blueprint.passageKey, sentenceNumber),
      ),
      wordsSentenceIds: character.wordsSentenceNumbers.map((sentenceNumber) =>
        perspectivePortalSentenceId(blueprint.passageKey, sentenceNumber),
      ),
      actionSentenceIds: character.actionSentenceNumbers.map((sentenceNumber) =>
        perspectivePortalSentenceId(blueprint.passageKey, sentenceNumber),
      ),
      feelingSentenceIds: character.feelingSentenceNumbers.map((sentenceNumber) =>
        perspectivePortalSentenceId(blueprint.passageKey, sentenceNumber),
      ),
      choiceSentenceIds: character.choiceSentenceNumbers.map((sentenceNumber) =>
        perspectivePortalSentenceId(blueprint.passageKey, sentenceNumber),
      ),
    })),
    contrastSummary: blueprint.contrastSummary,
    narratorPointOfViewExcluded: true as const,
    reviewStatus: 'DRAFT' as const,
    contentVersion: PERSPECTIVE_PORTAL_CONTENT_VERSION,
  } satisfies PerspectiveGuide
}

export const perspectivePortalPerspectiveGuides: PerspectiveGuide[] = perspectivePortalPassageBlueprints.map((_, index) => guideFromBlueprint(index))
