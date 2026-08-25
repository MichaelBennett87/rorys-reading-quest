import type { ContentPack } from '../../../contentPackTypes'
import {
  CLAIM_EVIDENCE_BENCHMARK, CLAIM_EVIDENCE_PACK_ID, CLAIM_EVIDENCE_PASSAGE_IDS,
  CLAIM_EVIDENCE_SKILL_ID, CLAIM_EVIDENCE_UNIT_ID, CLAIM_EVIDENCE_VERSION, CLAIM_EVIDENCE_WORLD_ID,
} from './ids'
import { authorClaimGuides, claimEvidencePassages } from './passages'
import { claimEvidenceLessons, claimEvidenceQuestions } from './questions'

export const claimEvidenceCourtPack: ContentPack = {
  manifest: {
    packId: CLAIM_EVIDENCE_PACK_ID, packTitle: 'Grade 3 Information Detectives: Claim and Evidence Court', gradeBand: 3,
    worldId: CLAIM_EVIDENCE_WORLD_ID, unitId: CLAIM_EVIDENCE_UNIT_ID, primarySkillId: CLAIM_EVIDENCE_SKILL_ID,
    benchmarkReferences: [CLAIM_EVIDENCE_BENCHMARK], coverageKind: 'benchmark',
    partialBenchmarkCoverage: 'Authored DRAFT coverage of identifying an explicit author claim, distinguishing reasons from evidence, and explaining claim-evidence connections.',
    difficultyRange: [3, 4], contentVersion: CLAIM_EVIDENCE_VERSION, reviewStatus: 'DRAFT',
    coveredPatterns: ['author-claim', 'reasons', 'evidence', 'claim-evidence-connection'],
    passageIds: [...CLAIM_EVIDENCE_PASSAGE_IDS], questionIds: claimEvidenceQuestions.map((question) => question.questionIdentifier),
    lessonIds: claimEvidenceLessons.map((lesson) => lesson.lessonId),
  },
  passages: claimEvidencePassages, questions: claimEvidenceQuestions, lessons: claimEvidenceLessons,
  authorClaimGuides,
}
