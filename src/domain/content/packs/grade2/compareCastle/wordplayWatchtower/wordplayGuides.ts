import { wordplayWatchtowerPoemArtifacts } from './poems'
import { wordplayWatchtowerProseArtifacts } from './passages'

export const wordplayWatchtowerArtifacts = [
  ...wordplayWatchtowerProseArtifacts,
  ...wordplayWatchtowerPoemArtifacts,
]

export const wordplayWatchtowerPassages = wordplayWatchtowerArtifacts.map((artifact) => artifact.passage)
export const wordplayWatchtowerWordplayGuides = wordplayWatchtowerArtifacts.map((artifact) => artifact.guide)
export const wordplayWatchtowerSupportTargets = wordplayWatchtowerArtifacts.flatMap((artifact) => artifact.supportTargets)
