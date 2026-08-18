# Content Model (Phase 0)

## Data Structures

### Passage

- `identifier`
- `gradeBand`
- `text`
- `sourceReference`
- `contentVersion`

### Question/Activity

The `ReadingQuestion` structure supports:

- `gradeBand`
- `benchmarkReference` (Florida benchmark or internal standard reference)
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
- `answerChoices`
- `correctAnswers`
- `explanation`
- `evidenceReference`
- `targetVocabulary`
- `soundOutChunks`
- `estimatedReadingLevel`
- `reviewStatus` (`DRAFT`, `REVIEWED`, `APPROVED`, `RETIRED`)
- `contentVersion`
- `tags`

## Validation Rules

- identifiers must be present.
- question types are limited to supported enum values.
- correct answers must exist.
- duplicate activity and question identifiers are errors.
- prerequisite ids must resolve to known skills in the content set.
- passage references must resolve to known passages.
- approved items must include explanation text.

## Current Status

Phase 0 data is marked as `DRAFT` and is intentionally small.
Reading-level labels are placeholders and are not authoritative.
