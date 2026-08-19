# Lesson Content Model (Phase 2)

## Base Entities

### Passage

- `passageIdentifier`
- `gradeBand`
- `passageText`
- `readingContext`
- `contentVersion`

### Question (shared reading item)

- `gradeBand`
- `benchmarkReference`
- `skillIdentifier`
- `prerequisiteSkillIdentifiers`
- `reportingCategory`
- `genre`
- `difficulty`
- `passageIdentifier`
- `activityIdentifier`
- `questionIdentifier`
- `questionType`
- `prompt`
- `answerChoices` (legacy compatibility)
- `correctAnswers` (legacy compatibility)
- `lessonIdentifier` (optional runtime link)
- `explanation`
- `evidenceReference` (legacy)
- `evidenceReferenceIds`
- `questionContent` (phase 2 payload)
- `reviewStatus`, `contentVersion`, `tags`

## questionType + questionContent mapping

The lesson runtime resolves `questionContent` into domain questions:

### MULTIPLE_CHOICE (`multiple_choice`)

- `choices`: array of `{ id, text }`
- `correctChoiceIds`: one item

### MULTISELECT (`multi_select`)

- `choices`: array of `{ id, text }`
- `correctChoiceIds`: one or more required IDs

### HOT_TEXT (`hot_text`)

- `selectableSegments`: array of `{ id, text }`
- `correctSegmentIds`: required selection set
- `allowMultiple` is inferred from payload (`correctSegmentIds.length > 1`) for phase 2 behavior.

### TWO_PART (`two_part`)

- `partAPrompt`
- `partAChoices`: array of `{ id, text }`
- `partACorrectChoiceId`
- `partBPrompt`
- `partBChoices`: array of `{ id, text }`
- `partBCorrectChoiceId`

### TABLE_MATCH (`table_match`)

- `rows`: one or more
- each row has `id`, `prompt`, `correctChoiceId`, and `options: [{ id, text }]`

## Validation requirements

`validateContent` now enforces:

- supported question types only
- minimum/unique choices and stable IDs
- required correct-answer data
- required payload type for all phase 2 question types
- hot-text segment presence/uniqueness and non-empty correct segments
- two-part part prompts + matching choice IDs for each correct ID
- table match rows, row IDs, prompts, options, and matching correctChoiceId
- evidence references that exist in local content IDs
- optional approved explanation requirement
- duplicate activity IDs, duplicate question IDs, missing passage links, missing review status, unknown prerequisite

## Evidence References

- `evidenceReferenceIds` should use local IDs from the payload:
  - choice IDs for multiple-choice and multiselect
  - segment IDs for hot text
  - part A and part B IDs for two-part
  - option IDs for table match

## Review States

- `DRAFT`: still present as internal development content
- `APPROVED`: requires `explanation`
