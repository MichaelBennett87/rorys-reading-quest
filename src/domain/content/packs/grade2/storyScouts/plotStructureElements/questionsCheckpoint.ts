import type { ReadingQuestion } from '../../../../types'
import {
  createEvidencePairQuestion,
  createHotTextQuestion,
  createMultipleChoiceQuestion,
  createMultiselectQuestion,
  createTableMatchQuestion,
} from './questionFactories'
import {
  STORY_MAP_CHECKPOINT_TAGS,
  STORY_MAP_CONTENT_VERSION,
  STORY_MAP_LESSON_IDS,
  STORY_MAP_PASSAGE_IDS,
  STORY_MAP_PASSAGE_KEYS,
  storyMapQuestionId,
  storyMapSentenceId,
} from './ids'

interface ChoiceSpec {
  id: string
  text: string
}

interface CheckpointStorySpec {
  lessonKey: 'checkpoint-a' | 'checkpoint-b' | 'checkpoint-c'
  lessonId: string
  activityId: string
  passageId: string
  passageKey: string
  sentences: readonly string[]
  targetVocabulary: string[]
  soundOutChunks: string[]
  problem: QuestionSpec
  cause: QuestionSpec
  actions: {
    prompt: string
    explanation: string
    evidence: number[]
    choices: ChoiceSpec[]
    correctChoiceIds: string[]
  }
  resolution: {
    prompt: string
    explanation: string
    sentenceNumber: number
  }
  stages: {
    beginning: string
    problem: string
    resolution: string
    evidence: number[]
  }
  inference: {
    prompt: string
    explanation: string
    evidence: number[]
    choices: ChoiceSpec[]
    correctChoiceId: string
    evidenceChoices: ChoiceSpec[]
    correctEvidenceChoiceId: string
  }
}

interface QuestionSpec {
  prompt: string
  explanation: string
  evidence: number[]
  choices: ChoiceSpec[]
  correctChoiceId: string
}

const STORY_MAP_BASE = {
  gradeBand: 2 as const,
  benchmarkReference: 'ELA.2.R.1.1',
  skillIdentifier: 'g2-story-scouts-prose',
  reportingCategory: 'Reading Prose and Poetry',
  genre: 'literary',
  difficulty: 1,
  estimatedReadingLevel: 'Grade 2',
  reviewStatus: 'DRAFT' as const,
  contentVersion: STORY_MAP_CONTENT_VERSION,
  prerequisiteSkillIdentifiers: [] as string[],
  tags: [...STORY_MAP_CHECKPOINT_TAGS],
}

const checkpointStories: readonly CheckpointStorySpec[] = [
  {
    lessonKey: 'checkpoint-a',
    lessonId: STORY_MAP_LESSON_IDS.checkpointA,
    activityId: 'activity-story-map-checkpoint-a',
    passageId: STORY_MAP_PASSAGE_IDS.neighborhoodCleanup,
    passageKey: STORY_MAP_PASSAGE_KEYS.neighborhoodCleanup,
    sentences: [
      "On a sunny Saturday morning, Tia met three neighbors beside the block's littered sidewalk.",
      "Wind had spread snack wrappers and cans left after Friday's picnic.",
      'Tia carefully decided to collect the light wrappers first so they could not blow farther.',
      'She asked two helpers to hold open bags while she and Malik picked up paper.',
      'Then the group sorted cans into a recycling bin and tied every bag.',
      'When the sidewalk was clear, Tia proudly thanked everyone for following the plan.',
    ],
    targetVocabulary: ['wrappers', 'helpers', 'recycling', 'proudly'],
    soundOutChunks: ['wrap', 'pers'],
    problem: {
      prompt: "What problem does Tia's group need to solve?",
      explanation: "Wind has spread picnic wrappers and cans across the block's sidewalk.",
      evidence: [2],
      choices: [
        { id: 'a-problem', text: 'Wind has spread wrappers and cans across the sidewalk.' },
        { id: 'a-no-bags', text: 'The group cannot find any bags for the cleanup.' },
        { id: 'a-no-helpers', text: 'The neighbors refuse to help Tia.' },
        { id: 'a-already-clear', text: 'The sidewalk is already clear when Tia arrives.' },
      ],
      correctChoiceId: 'a-problem',
    },
    cause: {
      prompt: 'Why does Tia decide to collect the light wrappers first?',
      explanation: 'She wants to stop the wind from blowing the light wrappers even farther.',
      evidence: [3],
      choices: [
        { id: 'a-wind', text: 'The wind could carry the light wrappers farther.' },
        { id: 'a-cans', text: 'Collecting wrappers will make the cans heavier.' },
        { id: 'a-bags', text: 'The helpers are not allowed to hold the bags yet.' },
        { id: 'a-evening', text: 'The group must wait until evening to begin.' },
      ],
      correctChoiceId: 'a-wind',
    },
    actions: {
      prompt: 'Which two actions help the group clean the sidewalk?',
      explanation: 'Holding bags open and sorting cans are both parts of the cleanup plan.',
      evidence: [4, 5],
      choices: [
        { id: 'a-hold-bags', text: 'Two helpers hold open the bags.' },
        { id: 'a-sort-cans', text: 'The group sorts cans into a recycling bin.' },
        { id: 'a-leave-wrappers', text: 'The group leaves the wrappers in the wind.' },
        { id: 'a-untie-bags', text: 'The group unties every full bag.' },
      ],
      correctChoiceIds: ['a-hold-bags', 'a-sort-cans'],
    },
    resolution: {
      prompt: 'Which sentence shows that the sidewalk is clean at the end?',
      explanation: 'The final sentence directly says that the sidewalk is clear.',
      sentenceNumber: 6,
    },
    stages: {
      beginning: 'Tia meets three neighbors beside a littered sidewalk.',
      problem: 'Wind has spread picnic trash across the sidewalk.',
      resolution: 'The group follows the plan until the sidewalk is clear.',
      evidence: [1, 2, 6],
    },
    inference: {
      prompt: "What does Tia's work show about her?",
      explanation: 'Tia plans an order for the work and organizes helpers, so she is a careful leader.',
      evidence: [3, 4],
      choices: [
        { id: 'a-leader', text: 'She plans carefully and helps the group work together.' },
        { id: 'a-wait', text: 'She wants to leave the cleanup for another day.' },
        { id: 'a-confused', text: 'She is confused about what the group should do.' },
      ],
      correctChoiceId: 'a-leader',
      evidenceChoices: [
        { id: 'a-plan-evidence', text: 'Tia carefully decided what to collect first, then asked helpers to hold open bags.' },
        { id: 'a-picnic-evidence', text: "The trash was left after Friday's picnic." },
        { id: 'a-thanks-evidence', text: 'Tia thanked everyone when the sidewalk was clear.' },
      ],
      correctEvidenceChoiceId: 'a-plan-evidence',
    },
  },
  {
    lessonKey: 'checkpoint-b',
    lessonId: STORY_MAP_LESSON_IDS.checkpointB,
    activityId: 'activity-story-map-checkpoint-b',
    passageId: STORY_MAP_PASSAGE_IDS.bridgeModel,
    passageKey: STORY_MAP_PASSAGE_KEYS.bridgeModel,
    sentences: [
      'After lunch in the classroom, Carlos and Emmi studied their model bridge for the science fair.',
      'The middle beam sagged, so the paper road dipped low.',
      'Carlos suggested adding a stronger brace beneath the beam.',
      'He slid the brace into place while Emmi taped the sides and checked each corner.',
      'They tested the bridge with three wooden blocks; the road stayed level and the bridge stood steady.',
      'The friends laughed quietly and placed the repaired model on a blue tray.',
    ],
    targetVocabulary: ['beam', 'brace', 'taped', 'steady'],
    soundOutChunks: ['strong', 'er'],
    problem: {
      prompt: 'What problem do Carlos and Emmi notice in their model bridge?',
      explanation: 'The middle beam sags, which makes the paper road dip low.',
      evidence: [2],
      choices: [
        { id: 'b-sag', text: 'The middle beam sags and the paper road dips.' },
        { id: 'b-blocks', text: 'The wooden test blocks are missing.' },
        { id: 'b-tray', text: 'The blue tray is too small for the model.' },
        { id: 'b-fair', text: 'The science fair has been canceled.' },
      ],
      correctChoiceId: 'b-sag',
    },
    cause: {
      prompt: 'Why do the friends add a stronger brace beneath the beam?',
      explanation: 'The brace supports the sagging beam so the paper road can stay level.',
      evidence: [2, 3, 5],
      choices: [
        { id: 'b-support', text: 'They want to support the beam so the road can stay level.' },
        { id: 'b-decorate', text: 'They want to decorate the bridge for lunch.' },
        { id: 'b-lighten', text: 'They want to make the wooden blocks lighter.' },
        { id: 'b-hide', text: 'They want to hide the bridge under the tray.' },
      ],
      correctChoiceId: 'b-support',
    },
    actions: {
      prompt: 'Which two actions do the friends use to repair the bridge?',
      explanation: 'Carlos slides in the brace while Emmi tapes and checks the sides.',
      evidence: [4],
      choices: [
        { id: 'b-slide-brace', text: 'Carlos slides the brace beneath the beam.' },
        { id: 'b-tape-sides', text: 'Emmi tapes the sides and checks the corners.' },
        { id: 'b-remove-road', text: 'They throw away the paper road.' },
        { id: 'b-outdoors', text: 'They move the model outdoors in the rain.' },
      ],
      correctChoiceIds: ['b-slide-brace', 'b-tape-sides'],
    },
    resolution: {
      prompt: 'Which sentence proves that the repair works during the test?',
      explanation: 'The fifth sentence says the road stays level and the bridge stands steady during the block test.',
      sentenceNumber: 5,
    },
    stages: {
      beginning: 'Carlos and Emmi study their model bridge after lunch.',
      problem: 'The middle beam sags and the paper road dips low.',
      resolution: 'The repaired bridge holds the blocks and stays steady.',
      evidence: [1, 2, 5],
    },
    inference: {
      prompt: 'What does the repair show about Carlos and Emmi?',
      explanation: 'They take different jobs at the same time, so they cooperate to solve the problem.',
      evidence: [4],
      choices: [
        { id: 'b-teamwork', text: 'They combine different jobs to repair the bridge.' },
        { id: 'b-alone', text: 'Carlos repairs the bridge without Emmi.' },
        { id: 'b-stop', text: 'They stop working when they see the sagging beam.' },
      ],
      correctChoiceId: 'b-teamwork',
      evidenceChoices: [
        { id: 'b-team-evidence', text: 'Carlos slid the brace into place while Emmi taped the sides and checked each corner.' },
        { id: 'b-problem-evidence', text: 'The middle beam sagged, so the paper road dipped low.' },
        { id: 'b-tray-evidence', text: 'The friends placed the repaired model on a blue tray.' },
      ],
      correctEvidenceChoiceId: 'b-team-evidence',
    },
  },
  {
    lessonKey: 'checkpoint-c',
    lessonId: STORY_MAP_LESSON_IDS.checkpointC,
    activityId: 'activity-story-map-checkpoint-c',
    passageId: STORY_MAP_PASSAGE_IDS.seedlingsRain,
    passageKey: STORY_MAP_PASSAGE_KEYS.seedlingsRain,
    sentences: [
      'During a rainy afternoon in the school garden, Harper saw the young seedlings leaning in the wind.',
      'A plastic cover had slipped off their tray, and rainwater was collecting beside the wet soil.',
      'Harper worried that more rain could wash the soil away from the roots.',
      'Harper put the cover back, moved the tray under the awning, and patted the leaves dry.',
      'Soon the seedlings stood upright, and the teacher said they were safe.',
      'Harper felt calm and helpful after acting quickly.',
    ],
    targetVocabulary: ['seedlings', 'rainwater', 'awning', 'helpful'],
    soundOutChunks: ['seed', 'lings'],
    problem: {
      prompt: 'What problem does Harper find in the school garden?',
      explanation: 'The cover has slipped off, and rain is threatening the seedlings and their soil.',
      evidence: [2, 3],
      choices: [
        { id: 'c-rain', text: 'The cover has slipped off while rain threatens the seedlings.' },
        { id: 'c-dry', text: 'The seedlings have no water and the soil is dry.' },
        { id: 'c-missing', text: 'The teacher cannot find the tray.' },
        { id: 'c-awning', text: 'The awning has fallen into the garden.' },
      ],
      correctChoiceId: 'c-rain',
    },
    cause: {
      prompt: 'Why does Harper move the tray under the awning after worrying about the roots?',
      explanation: 'The awning protects the tray from more rain that could wash soil away from the roots.',
      evidence: [3, 4],
      choices: [
        { id: 'c-protect', text: 'She wants to protect the tray from more rain.' },
        { id: 'c-wind', text: 'She wants the wind to lean the seedlings farther.' },
        { id: 'c-water', text: 'She wants more rainwater to collect in the tray.' },
        { id: 'c-request', text: 'The teacher asks her to move it before she notices the problem.' },
      ],
      correctChoiceId: 'c-protect',
    },
    actions: {
      prompt: 'Which two actions help Harper protect the seedlings from more rain?',
      explanation: 'Putting the cover back and moving the tray under the awning protect the plants from more rain.',
      evidence: [4],
      choices: [
        { id: 'c-cover', text: 'Harper puts the cover back on the tray.' },
        { id: 'c-move', text: 'Harper moves the tray under the awning.' },
        { id: 'c-leave', text: 'Harper leaves the uncovered tray in the rain.' },
        { id: 'c-pour', text: 'Harper pours more water beside the wet soil.' },
      ],
      correctChoiceIds: ['c-cover', 'c-move'],
    },
    resolution: {
      prompt: 'Which sentence shows that the seedlings are safe after Harper acts?',
      explanation: 'The fifth sentence says the seedlings stand upright and the teacher confirms that they are safe.',
      sentenceNumber: 5,
    },
    stages: {
      beginning: 'Harper sees seedlings leaning during a rainy afternoon.',
      problem: 'The tray is uncovered, and more rain could wash away soil.',
      resolution: 'Harper protects the tray, and the seedlings stand safely upright.',
      evidence: [1, 2, 5],
    },
    inference: {
      prompt: "What does Harper's response show about Harper?",
      explanation: 'Harper notices a risk and acts quickly to protect the plants.',
      evidence: [3, 4, 6],
      choices: [
        { id: 'c-responsible', text: 'Harper takes quick action to protect the plants.' },
        { id: 'c-ignore', text: 'Harper ignores the seedlings until the rain stops.' },
        { id: 'c-harm', text: 'Harper wants the rain to wash away the soil.' },
      ],
      correctChoiceId: 'c-responsible',
      evidenceChoices: [
        { id: 'c-action-evidence', text: 'Harper put the cover back, moved the tray under the awning, and patted the leaves dry.' },
        { id: 'c-weather-evidence', text: 'It was a rainy afternoon in the school garden.' },
        { id: 'c-safe-evidence', text: 'The teacher said the seedlings were safe.' },
      ],
      correctEvidenceChoiceId: 'c-action-evidence',
    },
  },
]

export const storyMapCheckpointQuestions: ReadingQuestion[] = checkpointStories.flatMap(buildCheckpointQuestions)

function buildCheckpointQuestions(story: CheckpointStorySpec): ReadingQuestion[] {
  const sentenceIds = (numbers: number[]) => numbers.map((number) => storyMapSentenceId(story.passageKey, number))
  const segments = story.sentences.map((text, index) => ({
    id: storyMapSentenceId(story.passageKey, index + 1),
    text,
  }))
  const stageOptions = [
    { id: `${story.lessonKey}-beginning`, text: story.stages.beginning },
    { id: `${story.lessonKey}-problem`, text: story.stages.problem },
    { id: `${story.lessonKey}-resolution`, text: story.stages.resolution },
  ]
  const base = (questionKey: string, evidenceReference: string, evidence: number[]) => ({
    ...STORY_MAP_BASE,
    passageIdentifier: story.passageId,
    lessonIdentifier: story.lessonId,
    activityIdentifier: story.activityId,
    questionIdentifier: storyMapQuestionId(story.lessonKey, questionKey),
    evidenceReference,
    evidenceReferenceIds: sentenceIds(evidence),
    targetVocabulary: [...story.targetVocabulary],
    soundOutChunks: [...story.soundOutChunks],
  })

  return [
    createMultipleChoiceQuestion({
      ...base('q1', 'story-problem', story.problem.evidence),
      prompt: story.problem.prompt,
      explanation: story.problem.explanation,
      choices: story.problem.choices,
      correctChoiceIds: [story.problem.correctChoiceId],
    }),
    createMultipleChoiceQuestion({
      ...base('q2', 'cause-and-effect', story.cause.evidence),
      prompt: story.cause.prompt,
      explanation: story.cause.explanation,
      choices: story.cause.choices,
      correctChoiceIds: [story.cause.correctChoiceId],
    }),
    createMultiselectQuestion({
      ...base('q3', 'character-actions', story.actions.evidence),
      prompt: story.actions.prompt,
      explanation: story.actions.explanation,
      choices: story.actions.choices,
      correctChoiceIds: story.actions.correctChoiceIds,
      allowMultiple: true,
    }),
    createHotTextQuestion({
      ...base('q4', 'resolution-clue', [story.resolution.sentenceNumber]),
      prompt: story.resolution.prompt,
      explanation: story.resolution.explanation,
      selectableSegments: segments,
      correctSegmentIds: [storyMapSentenceId(story.passageKey, story.resolution.sentenceNumber)],
    }),
    createTableMatchQuestion({
      ...base('q5', 'story-structure', story.stages.evidence),
      prompt: 'Match each story part to the detail that belongs there.',
      explanation: 'The beginning introduces the situation, the problem names what goes wrong, and the resolution shows how it is fixed.',
      rows: [
        {
          id: `${story.lessonKey}-row-beginning`,
          prompt: 'Beginning',
          correctChoiceId: `${story.lessonKey}-beginning`,
          options: stageOptions,
        },
        {
          id: `${story.lessonKey}-row-problem`,
          prompt: 'Problem',
          correctChoiceId: `${story.lessonKey}-problem`,
          options: stageOptions,
        },
        {
          id: `${story.lessonKey}-row-resolution`,
          prompt: 'Resolution',
          correctChoiceId: `${story.lessonKey}-resolution`,
          options: stageOptions,
        },
      ],
    }),
    createEvidencePairQuestion({
      ...base('q6', 'character-inference', story.inference.evidence),
      prompt: story.inference.prompt,
      explanation: story.inference.explanation,
      partAChoices: story.inference.choices,
      partACorrectChoiceId: story.inference.correctChoiceId,
      partBChoices: story.inference.evidenceChoices,
      partBCorrectChoiceId: story.inference.correctEvidenceChoiceId,
    }),
  ]
}
