import type { AssistanceSummary } from '../assistance'
import type { LearningState, NextQuestPlan } from '../progression'

export interface ExplainProgressionDecisionInput {
  decisionState: LearningState | 'CONTENT_NEEDED' | null
  nextQuest: NextQuestPlan | null
  assistanceSummary?: AssistanceSummary | null
}

export function explainProgressionDecision(input: ExplainProgressionDecisionInput): string {
  const assisted = Boolean(input.assistanceSummary && input.assistanceSummary.totalUniqueEvents > 0)

  if (input.nextQuest?.status === 'content_needed' || input.decisionState === 'CONTENT_NEEDED') {
    return 'All fresh eligible quests for this trail are used right now. Progress is safe, and the app will wait for new content.'
  }

  switch (input.decisionState) {
    case 'VERIFY_MASTERY':
      return assisted
        ? 'The score was strong and rewards were preserved, but word help was used, so a fresh independent activity is still needed for mastery evidence.'
        : 'One strong independent activity was completed. A different activity at the same level is needed before this skill advances.'
    case 'ADVANCE':
      return 'This skill advanced one trail after two different activities were completed independently at the mastery threshold.'
    case 'RETRY_SAME_DIFFICULTY':
      return 'The learner is close to mastery and will receive a fresh activity at the same difficulty.'
    case 'GUIDED_PRACTICE':
      return 'The first lower-scoring checkpoint triggered another guided activity at the same difficulty.'
    case 'REMEDIATE_PREREQUISITE':
      return 'The app is rebuilding a prerequisite skill before returning to the original trail.'
    case 'SPACED_REVIEW':
      return 'This skill is scheduled for review so the reading power stays strong over time.'
    case 'MASTERED':
      return 'This skill has reached the current mastery trail and is waiting for the next planned quest.'
    default:
      if (assisted) {
        return 'The score was strong and rewards were preserved, but word help was used, so a fresh independent activity is still needed for mastery evidence.'
      }
      return 'A fresh quest is being prepared for the next safe step.'
  }
}
