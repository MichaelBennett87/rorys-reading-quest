import { describe, expect, it } from 'vitest'

import { wordplayWatchtowerPoemArtifacts } from '../../src/domain/content/packs/grade2/compareCastle/wordplayWatchtower/poems'
import { wordplayWatchtowerProseArtifacts } from '../../src/domain/content/packs/grade2/compareCastle/wordplayWatchtower/passages'
import { wordplayWatchtowerCheckpointLessonQuestions } from '../../src/domain/content/packs/grade2/compareCastle/wordplayWatchtower/questionsCheckpoint'

describe('Wordplay Watchtower Batch 68 answer uniqueness corrections', () => {
  it('uses source-owned expressions with one defensible wordplay classification', () => {
    const correctedContent = JSON.stringify({
      poems: wordplayWatchtowerPoemArtifacts,
      prose: wordplayWatchtowerProseArtifacts,
      checkpointB: wordplayWatchtowerCheckpointLessonQuestions.checkpointB,
      checkpointC: wordplayWatchtowerCheckpointLessonQuestions.checkpointC,
    })

    expect(correctedContent).toContain('Path posts pointed past pine trees.')
    expect(correctedContent).toContain('Path posts pointed uses alliteration because the words begin with the /p/ sound.')
    expect(correctedContent).toContain('The seed moved like a drifting feather through the soil.')
    expect(correctedContent).toContain('I had to sit tight while the rain drum rolled.')
    expect(correctedContent).toContain('Green gates guarded uses alliteration because the words begin with the /g/ sound.')
    expect(correctedContent).toContain('like a friendly arrow')

    expect(correctedContent).not.toContain('Path markers pointed')
    expect(correctedContent).not.toContain('path markers pointed')
    expect(correctedContent).not.toContain('as soft as snow')
    expect(correctedContent).not.toContain('hold your horses')
  })

  it('keeps the checkpoint inventory unchanged while removing overlapping answers', () => {
    expect(wordplayWatchtowerCheckpointLessonQuestions.checkpointB).toHaveLength(7)
    expect(wordplayWatchtowerCheckpointLessonQuestions.checkpointC).toHaveLength(7)

    const checkpointB = JSON.stringify(wordplayWatchtowerCheckpointLessonQuestions.checkpointB)
    const checkpointC = JSON.stringify(wordplayWatchtowerCheckpointLessonQuestions.checkpointC)

    expect(checkpointB).toContain('Green gates guarded')
    expect(checkpointB).toContain('like a friendly arrow')
    expect(checkpointB).not.toContain('Path markers pointed')

    expect(checkpointC).toContain('like a drifting feather')
    expect(checkpointC).toContain('sit tight')
    expect(checkpointC).not.toContain('as soft as snow')
    expect(checkpointC).not.toContain('hold your horses')
  })
})
