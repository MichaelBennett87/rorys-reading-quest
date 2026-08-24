# Grade 3 Word Forge Fluency Flight Review

## Identity and scope

- Pack ID: `g3-word-forge-fluency-flight`
- Content version: `g3-wf-fluency-flight-r0.1.0`
- World: Word Forge
- Unit: `g3-wg-unit-4`
- Skill: Grade 3 Word Forge word analysis
- Benchmark support: `ELA.3.F.1.4`
- Coverage kind: supportive practice
- Review status: DRAFT
- Educational approval: DRAFT - human educational approval pending

Fluency Flight supports accurate attention to print, automatic recognition of familiar words, phrase grouping, punctuation-based phrasing, expression cues, and rereading. It does not record speech or measure oral accuracy, automaticity, pronunciation, prosody, expression, or reading rate.

## Architecture review

The pack reuses the established `FLUENCY_PRACTICE` lesson role, `FluencyPracticeBlock`, child practice screen, optional browser model listening, reflection state, and supportive progression convention from Grade 2. No competing guide or lesson runtime was added. Each of the seven lesson blocks acts as the authored fluency guide for its passage.

- Guide blocks: 7
- Guided lessons with teaching: 4
- Independent practice lessons: 3
- Checkpoint lessons: 0
- Original passages: 7
- Scored questions: 28
- Word Help targets: 21

Model listening is optional, never autoplays, and is not required to unlock scored questions. Browser voices vary by device and are not treated as authoritative human expression models. The displayed text, phrase groups, punctuation, and authored cues remain authoritative.

## Passage inventory

| Lesson | Passage form | Passage title | Primary support |
| --- | --- | --- | --- |
| Punctuation Pilot | narrative scene | The Hilltop Signal | commas, questions, exclamations |
| Phrase Formation | informational explanation | Why Paper Gliders Stay Up | connected phrase groups |
| Dialogue Voices | dialogue-rich scene | The Missing Flight Map | speaker voice and punctuation |
| Reread Route | procedure | Build a Paper Rotor | complete directions and rereading |
| Marsh Morning | descriptive paragraph | Morning Above the Marsh | calm phrasing and emphasis |
| First Launch | literary scene | Mira's First Launch | shifting character expression |
| Formation Facts | informational explanation | Why Geese Fly in a V | cause-and-effect phrasing |

Each passage is original, local, DRAFT content. Phrase groups reconstruct its complete displayed text in order. The text uses punctuation as a meaningful reading cue rather than as a trick.

## Practice review

The authored practice includes:

- phrase grouping
- punctuation pause
- punctuation stop
- question cue
- exclamation cue
- dialogue phrasing
- meaningful emphasis
- rereading a difficult phrase
- automatic recognition of familiar Grade 3 words
- avoiding word-by-word reading
- sentence-context confirmation

Child-facing language uses phrases such as "read these words together" and "pause briefly." It does not require specialist prosody or intonation terminology.

## Question review

| Question type | Count |
| --- | ---: |
| Multiple choice | 14 |
| Multiselect | 5 |
| Hot text | 5 |
| Table match | 4 |
| Total | 28 |

All questions are answerable from visible text. None requires audio, outside knowledge, timed reading, oral production, plot analysis, theme analysis, central-idea analysis, vocabulary-definition mastery, or a subjective expressive performance judgment.

The blind review found six draft choice-clarity defects before registration. Four table items reused visible option labels across rows, and two phrase-grouping items differed only by separator placement after normalization. The options were rewritten with distinct, explicit reading choices. No key, prompt, explanation, evidence reference, passage, or production evaluator required correction.

## Word Help review

The pack provides exactly three DRAFT `WordSupportTarget` records per passage and twenty-one total. Each target resolves to one source sentence, reconstructs the target word from authored chunks, highlights a useful pattern, and preserves the five accepted stages:

1. Look at the Pattern
2. Break It Apart
3. Hear the Parts
4. Hear the Word
5. Hear the Sentence

Word Help remains word-level assistance. It does not replace the passage-level phrase-group interface, reveal scored answers, restore Blend It, require audio, or create oral-mastery evidence.

## Accessibility and privacy

The existing dark Word Forge design, semantic controls, keyboard navigation, selected-state neutrality, visible focus, touch targets, correct/incorrect text and icons, and reduced-motion behavior remain intact. Model listening is optional and local to browser `SpeechSynthesis`.

The application does not persist passage text, phrase groups, expression cues, teaching text, question text, answers, explanations, or Word Help curriculum text. It adds no microphone permission, recording, backend, cloud synchronization, analytics, telemetry, external speech service, or live AI.

## Originality and provenance

All seven passages and all question, guide, teaching, and support text were authored for this repository. No commercial fluency passage, worksheet, proprietary assessment passage, or FAST item was copied.

## Remaining human review

- Review the naturalness and Grade 3 suitability of all phrase-group decisions.
- Review optional browser-model limitations on representative devices.
- Review the seven passages and twenty-eight questions for educational approval.
- Keep status DRAFT until human educational approval is recorded.
