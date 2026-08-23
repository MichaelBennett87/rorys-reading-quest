import type { Passage, WordSupportTarget } from '../../../../types'
import type {
  ClassicalWordPart,
  RootDecodingGuide,
  RootDecodingTarget,
  RootMorphologicalChunk,
  RootSyllableChunk,
} from '../../../contentPackTypes'
import { rootReactorContentVersion, rootReactorPassageIds } from './ids'

const part = (
  partId: string,
  surfaceForm: string,
  displayLabel: string,
  origin: ClassicalWordPart['origin'],
  kind: ClassicalWordPart['kind'],
  commonMeaning: string,
): ClassicalWordPart => ({ partId, surfaceForm, displayLabel, origin, kind, commonMeaning })

export const rootReactorClassicalParts = {
  tele: part('classical-tele', 'tele', 'tele', 'Greek', 'combining-form', 'far'),
  scope: part('classical-scope', 'scope', 'scope', 'Greek', 'root', 'look or see'),
  geo: part('classical-geo', 'geo', 'geo', 'Greek', 'combining-form', 'earth'),
  photo: part('classical-photo', 'photo', 'photo', 'Greek', 'combining-form', 'light'),
  graph: part('classical-graph', 'graph', 'graph', 'Greek', 'root', 'write or draw'),
  auto: part('classical-auto', 'auto', 'auto', 'Greek', 'combining-form', 'self'),
  bio: part('classical-bio', 'bio', 'bio', 'Greek', 'combining-form', 'life'),
  micro: part('classical-micro', 'micro', 'micro', 'Greek', 'combining-form', 'small'),
  port: part('classical-port', 'port', 'port', 'Latin', 'root', 'carry'),
  tract: part('classical-tract', 'tract', 'tract', 'Latin', 'root', 'pull'),
  rupt: part('classical-rupt', 'rupt', 'rupt', 'Latin', 'root', 'break'),
  form: part('classical-form', 'form', 'form', 'Latin', 'root', 'shape'),
  bi: part('classical-bi', 'bi', 'bi-', 'Greek/Latin', 'prefix', 'two'),
  tri: part('classical-tri', 'tri', 'tri-', 'Greek/Latin', 'prefix', 'three'),
  sub: part('classical-sub', 'sub', 'sub-', 'Latin', 'prefix', 'under'),
  trans: part('classical-trans', 'trans', 'trans-', 'Latin', 'prefix', 'across'),
  ex: part('classical-ex', 'ex', 'ex-', 'Latin', 'prefix', 'out'),
  re: part('classical-re', 're', 're-', 'Latin', 'prefix', 'again or back'),
  uni: part('classical-uni', 'uni', 'uni-', 'Latin', 'prefix', 'one'),
} as const

type PartKey = keyof typeof rootReactorClassicalParts

interface TargetSpec {
  word: string
  sentence: number
  primary: PartKey
  additional?: PartKey[]
  morphology: Array<[string, RootMorphologicalChunk['role'], PartKey?]>
  syllables: Array<[string, string]>
  decoding: string
  meaning: string
}

interface PassageSpec {
  passageId: string
  context: string
  sentences: string[]
  targets: TargetSpec[]
}

export interface RootReactorPassageArtifact {
  passage: Passage
  guide: RootDecodingGuide
  targets: RootDecodingTarget[]
}

const passageSpecs: PassageSpec[] = [
  {
    passageId: rootReactorPassageIds.farEarthCounts,
    context: 'Read about a museum word lab that uses familiar word parts.',
    sentences: [
      'Mara entered a science museum word lab where each display showed how familiar parts can unlock a longer word.',
      'A guide pointed to a telephone and asked visitors to notice tele before reading the whole label.',
      'On a wall map, the word geography appeared above drawings of rivers, hills, and coastlines.',
      'A bicycle wheel turned beside a sign that marked bi as the first useful part.',
      'At the shape table, a bright triangle had three straight sides and a clear tri at its start.',
      'Mara marked meaningful parts, tapped the reading chunks, and blended each complete word back into its sentence.',
    ],
    targets: [
      target('telephone', 2, 'tele', [], [['tele', 'root', 'tele'], ['phone', 'other']], [['tel', 'tell'], ['e', 'uh'], ['phone', 'fohn']], 'Find tele, then read tel - uh - fohn and blend telephone.', 'Tele means far, which makes this useful part easier to remember.'),
      target('geography', 3, 'geo', ['graph'], [['geo', 'root', 'geo'], ['graph', 'root', 'graph'], ['y', 'other']], [['ge', 'jee'], ['og', 'og'], ['ra', 'ruh'], ['phy', 'fee']], 'Find geo, then read jee - og - ruh - fee and blend geography.', 'Geo means earth, and graph is a writing or drawing part.'),
      target('bicycle', 4, 'bi', [], [['bi', 'prefix', 'bi'], ['cycle', 'other']], [['bi', 'by'], ['cy', 'sih'], ['cle', 'kuhl']], 'Find bi-, then read by - sih - kuhl and blend bicycle.', 'Bi- means two, a helpful memory clue for the beginning.'),
      target('triangle', 5, 'tri', [], [['tri', 'prefix', 'tri'], ['angle', 'other']], [['tri', 'try'], ['an', 'ang'], ['gle', 'guhl']], 'Find tri-, then read try - ang - guhl and blend triangle.', 'Tri- means three, which supports the display context.'),
    ],
  },
  {
    passageId: rootReactorPassageIds.picturesLifeTools,
    context: 'Read about picture, life-science, and flight displays.',
    sentences: [
      'In the next room, Lena joined a picture and life-science challenge with four carefully labeled exhibits.',
      'She studied a photograph made when light entered a camera and formed an image.',
      'At the living-things table, biology was printed above models of a leaf, a shell, and a feather.',
      'A microscope helped visitors view tiny details on a prepared slide without touching it.',
      'Near the ceiling, a biplane model showed two wings stacked one above the other.',
      'Lena used each bold word part as a starting clue, divided the label into reading chunks, and blended the whole word.',
    ],
    targets: [
      target('photograph', 2, 'photo', ['graph'], [['photo', 'root', 'photo'], ['graph', 'root', 'graph']], [['pho', 'foh'], ['to', 'tuh'], ['graph', 'graf']], 'Find photo, then read foh - tuh - graf and blend photograph.', 'Photo means light, and graph means write or draw.'),
      target('biology', 3, 'bio', [], [['bio', 'root', 'bio'], ['logy', 'other']], [['bi', 'by'], ['ol', 'ol'], ['o', 'uh'], ['gy', 'jee']], 'Find bio, then read by - ol - uh - jee and blend biology.', 'Bio means life, which fits the living-things display.'),
      target('microscope', 4, 'micro', ['scope'], [['micro', 'root', 'micro'], ['scope', 'root', 'scope']], [['mi', 'my'], ['cro', 'kruh'], ['scope', 'skohp']], 'Find micro, then read my - kruh - skohp and blend microscope.', 'Micro means small, and scope means look or see.'),
      target('biplane', 5, 'bi', [], [['bi', 'prefix', 'bi'], ['plane', 'other']], [['bi', 'by'], ['plane', 'playn']], 'Find bi-, then read by - playn and blend biplane.', 'Bi- means two, which helps readers remember the first part.'),
    ],
  },
  {
    passageId: rootReactorPassageIds.greekWordLab,
    context: 'Read about a team preparing labels for a Greek word-part exhibit.',
    sentences: [
      'The museum team prepared a new exhibit about tools that help people observe, record, and study the world.',
      'Nico aimed a telescope through a roof window and focused it on a distant tower.',
      'On a rock display, the label geology introduced the study station before visitors sorted stone samples.',
      'A volunteer used a photocopy of the map so every group could mark a separate route.',
      'At the guest table, an astronaut left an autograph beside a drawing of a small spacecraft.',
      'The labels had meaningful parts such as tele and graph, but the team also marked pronounceable reading chunks.',
      'Nico explained that the two kinds of breaks can look different, so readers should use both before blending the word.',
    ],
    targets: [
      target('telescope', 2, 'tele', ['scope'], [['tele', 'root', 'tele'], ['scope', 'root', 'scope']], [['tel', 'tell'], ['e', 'uh'], ['scope', 'skohp']], 'Find tele and scope, then read tell - uh - skohp and blend telescope.', 'Tele means far and scope means look or see.'),
      target('geology', 3, 'geo', [], [['geo', 'root', 'geo'], ['logy', 'other']], [['ge', 'jee'], ['ol', 'ol'], ['o', 'uh'], ['gy', 'jee']], 'Find geo, then read jee - ol - uh - jee and blend geology.', 'Geo means earth, which connects to the rock display.'),
      target('photocopy', 4, 'photo', [], [['photo', 'root', 'photo'], ['copy', 'other']], [['pho', 'foh'], ['to', 'tuh'], ['cop', 'kop'], ['y', 'ee']], 'Find photo, then read foh - tuh - kop - ee and blend photocopy.', 'Photo means light, a memory support for the opening part.'),
      target('autograph', 5, 'graph', ['auto'], [['auto', 'root', 'auto'], ['graph', 'root', 'graph']], [['au', 'aw'], ['to', 'tuh'], ['graph', 'graf']], 'Find graph, then read aw - tuh - graf and blend autograph.', 'Auto means self and graph means write or draw.'),
    ],
  },
  {
    passageId: rootReactorPassageIds.latinMovingLab,
    context: 'Read about moving equipment and a model ocean exhibit.',
    sentences: [
      'Before opening time, the exhibit crew moved models from a workroom to the main science hall.',
      'A rolling cart helped transport four heavy boxes across the smooth floor.',
      'A small tractor pulled a garden display toward the wide doors without bumping the frame.',
      'At the volcano station, red paper strips rose from a model crater to show how a volcano can erupt.',
      'The last crate held a submarine model that would rest under a clear sheet of blue plastic.',
      'The crew marked meaningful parts such as port and sub, then marked separate chunks that were easy to pronounce.',
      'They blended each complete label and reread the sentence to make sure the word fit the action or object.',
    ],
    targets: [
      target('transport', 2, 'port', ['trans'], [['trans', 'prefix', 'trans'], ['port', 'root', 'port']], [['trans', 'tranz'], ['port', 'port']], 'Find port and trans-, then read tranz - port and blend transport.', 'Port means carry and trans- means across.'),
      target('tractor', 3, 'tract', [], [['tract', 'root', 'tract'], ['or', 'suffix']], [['trac', 'trak'], ['tor', 'ter']], 'Find tract, then read trak - ter and blend tractor.', 'Tract means pull, which fits the machine action.'),
      target('erupt', 4, 'rupt', [], [['e', 'connector'], ['rupt', 'root', 'rupt']], [['e', 'ih'], ['rupt', 'rupt']], 'Find rupt, then read ih - rupt and blend erupt.', 'Rupt means break, a memory clue for the model action.'),
      target('submarine', 5, 'sub', [], [['sub', 'prefix', 'sub'], ['marine', 'other']], [['sub', 'sub'], ['ma', 'muh'], ['rine', 'reen']], 'Find sub-, then read sub - muh - reen and blend submarine.', 'Sub- means under, which fits the model under the blue surface.'),
    ],
  },
  {
    passageId: rootReactorPassageIds.scienceExhibit,
    context: 'Read about a team finishing a science exhibit for visiting classes.',
    sentences: [
      'On Friday, the museum team finished a science exhibit that combined diagrams, models, and a hands-on recording station.',
      'A large graphic showed how sunlight moved across the roof during the day, using arrows instead of a long paragraph.',
      'Every helper wore a uniform with one bright badge, so visiting students could quickly find someone who could answer a question.',
      'A camera stood on a tripod near the entrance, with its three legs spread firmly across the floor.',
      'At the recording table, students could transfer a drawing from paper to a clear display sheet by tracing its strongest lines.',
      'The crew checked the meaningful parts in each label before marking the pronounceable chunks used for reading.',
      'In uniform, the meaningful split is uni and form, while the reading chunks are u, ni, and form.',
      'That difference reminded the team that word-part boundaries and syllable boundaries do not always match.',
      'After one final reading check, the labels were ready for the visiting classes.',
    ],
    targets: [
      target('graphic', 2, 'graph', [], [['graph', 'root', 'graph'], ['ic', 'suffix']], [['graph', 'graf'], ['ic', 'ik']], 'Find graph, then read graf - ik and blend graphic.', 'Graph means write or draw, which fits the diagram.'),
      target('uniform', 3, 'form', ['uni'], [['uni', 'prefix', 'uni'], ['form', 'root', 'form']], [['u', 'you'], ['ni', 'nuh'], ['form', 'form']], 'Find form and uni-, then read you - nuh - form and blend uniform.', 'Form means shape and uni- means one.'),
      target('tripod', 4, 'tri', [], [['tri', 'prefix', 'tri'], ['pod', 'other']], [['tri', 'try'], ['pod', 'pod']], 'Find tri-, then read try - pod and blend tripod.', 'Tri- means three, which matches the three legs.'),
      target('transfer', 5, 'trans', [], [['trans', 'prefix', 'trans'], ['fer', 'other']], [['trans', 'trans'], ['fer', 'fer']], 'Find trans-, then read trans - fer and blend transfer.', 'Trans- means across, which fits moving the drawing across surfaces.'),
    ],
  },
  {
    passageId: rootReactorPassageIds.movingChanging,
    context: 'Read about a moving exhibit with a writer display and subway model.',
    sentences: [
      'A traveling exhibit arrived with cases about writers, city travel, and machines that pull or carry materials.',
      'The first case held a biography that told important events from the life of a scientist who designed safer bridges.',
      'Workers export digital copies of the exhibit guide to partner museums, sending the files out for other teams to use.',
      'A spring-loaded sign could retract into its frame when the crew needed to roll the case through a narrow doorway.',
      'Beside it, a subway model followed a track under a painted city street and stopped at three small stations.',
      'Readers first found useful parts such as bio, port, tract, and sub before dividing each complete label into speaking chunks.',
      'In biography, the meaningful parts include bio and graph, while the reading chunks are bi, og, ra, and phy.',
      'The crew tested every label in its sentence so the action and pronunciation were clear.',
      'When the doors opened, visitors could study each word without needing outside facts.',
    ],
    targets: [
      target('biography', 2, 'bio', ['graph'], [['bio', 'root', 'bio'], ['graph', 'root', 'graph'], ['y', 'other']], [['bi', 'by'], ['og', 'og'], ['ra', 'ruh'], ['phy', 'fee']], 'Find bio and graph, then read by - og - ruh - fee and blend biography.', 'Bio means life and graph means write or draw.'),
      target('export', 3, 'port', ['ex'], [['ex', 'prefix', 'ex'], ['port', 'root', 'port']], [['ex', 'eks'], ['port', 'PORT']], 'Find ex- and port, then read eks - PORT and blend the verb export.', 'Ex- means out and port means carry; the sentence clearly uses export as an action.'),
      target('retract', 4, 'tract', ['re'], [['re', 'prefix', 're'], ['tract', 'root', 'tract']], [['re', 'ree'], ['tract', 'trakt']], 'Find re- and tract, then read ree - trakt and blend retract.', 'Re- means back and tract means pull.'),
      target('subway', 5, 'sub', [], [['sub', 'prefix', 'sub'], ['way', 'other']], [['sub', 'sub'], ['way', 'way']], 'Find sub-, then read sub - way and blend subway.', 'Sub- means under, which fits the track under the street.'),
    ],
  },
  {
    passageId: rootReactorPassageIds.acrossUnder,
    context: 'Read about a garden and transit design project at the museum.',
    sentences: [
      'The final lab asked teams to design a garden display beside a model transit station without blocking the visitor path.',
      'A microphone at the planning table carried each speaker voice to a small recorder for the team notes.',
      'Loose cords could disrupt the walkway, so the team fastened them along the wall before moving any models.',
      'A folding screen could transform the plain corner into a bright garden scene when its painted panels opened.',
      'Gardeners planned to transplant one young fern from a temporary pot into the finished display bed.',
      'The labels included useful parts such as micro, rupt, form, and trans, but readers also needed pronounceable chunks.',
      'In microphone, the meaningful parts are micro and phone, while the reading chunks are mi, cro, and phone.',
      'The team read each chunk, blended the written word, and reread the full sentence to confirm it fit.',
      'Their careful word work kept the final signs clear for every visitor.',
    ],
    targets: [
      target('microphone', 2, 'micro', [], [['micro', 'root', 'micro'], ['phone', 'other']], [['mi', 'my'], ['cro', 'kruh'], ['phone', 'fohn']], 'Find micro, then read my - kruh - fohn and blend microphone.', 'Micro means small, a memory clue for the opening part.'),
      target('disrupt', 3, 'rupt', [], [['dis', 'other'], ['rupt', 'root', 'rupt']], [['dis', 'dis'], ['rupt', 'rupt']], 'Find rupt, then read dis - rupt and blend disrupt.', 'Rupt means break, which fits interrupting the clear walkway.'),
      target('transform', 4, 'form', ['trans'], [['trans', 'prefix', 'trans'], ['form', 'root', 'form']], [['trans', 'trans'], ['form', 'form']], 'Find trans- and form, then read trans - form and blend transform.', 'Trans- means across and form means shape.'),
      target('transplant', 5, 'trans', [], [['trans', 'prefix', 'trans'], ['plant', 'other']], [['trans', 'trans'], ['plant', 'plant']], 'Find trans-, then read trans - plant and blend transplant.', 'Trans- means across, which supports moving the plant to a new place.'),
    ],
  },
]

function target(
  word: string,
  sentence: number,
  primary: PartKey,
  additional: PartKey[],
  morphology: TargetSpec['morphology'],
  syllables: TargetSpec['syllables'],
  decoding: string,
  meaning: string,
): TargetSpec {
  return { word, sentence, primary, additional, morphology, syllables, decoding, meaning }
}

function buildArtifact(spec: PassageSpec): RootReactorPassageArtifact {
  const sentenceIds = spec.sentences.map((_, index) => `${spec.passageId}-sentence-${index + 1}`)
  const targets: RootDecodingTarget[] = spec.targets.map((item) => ({
    targetId: `${spec.passageId}-target-${item.word}`,
    surfaceWord: item.word,
    sentenceId: sentenceIds[item.sentence - 1],
    primaryPart: { ...rootReactorClassicalParts[item.primary] },
    additionalParts: (item.additional ?? []).map((key) => ({ ...rootReactorClassicalParts[key] })),
    morphologicalChunks: item.morphology.map(([text, role, key]) => ({
      text,
      role,
      partId: key ? rootReactorClassicalParts[key].partId : undefined,
    })),
    syllableChunks: item.syllables.map(([displayText, speechText]): RootSyllableChunk => ({ displayText, speechText })),
    decodingStatement: item.decoding,
    meaningSupportStatement: item.meaning,
  }))
  const sentenceTextById = new Map(sentenceIds.map((id, index) => [id, spec.sentences[index]] as const))
  const supportTargets: WordSupportTarget[] = targets.map((item) => ({
    targetId: item.targetId,
    passageId: spec.passageId,
    sentenceId: item.sentenceId,
    surfaceWord: item.surfaceWord,
    focusParts: item.morphologicalChunks.map((chunk) => ({ text: chunk.text, emphasis: chunk.partId === item.primaryPart.partId })),
    displayChunks: item.syllableChunks.map((chunk) => ({ ...chunk })),
    spokenChunks: item.syllableChunks.map((chunk) => ({ ...chunk })),
    blendSpeechText: item.syllableChunks.map((chunk) => chunk.speechText).join(' - '),
    wholeWordSpeechText: item.surfaceWord,
    sentenceSpeechText: sentenceTextById.get(item.sentenceId) ?? '',
    reviewStatus: 'DRAFT',
    contentVersion: rootReactorContentVersion,
  }))
  return {
    passage: {
      passageIdentifier: spec.passageId,
      gradeBand: 3,
      passageText: spec.sentences.join(' '),
      contentKind: 'prose',
      sentences: spec.sentences.map((text, index) => ({ sentenceId: sentenceIds[index], text })),
      readingContext: spec.context,
      contentVersion: rootReactorContentVersion,
      reviewStatus: 'DRAFT',
      wordSupportTargets: supportTargets,
    },
    guide: {
      passageId: spec.passageId,
      targets,
      reviewStatus: 'DRAFT',
      contentVersion: rootReactorContentVersion,
    },
    targets,
  }
}

export const rootReactorPassageArtifacts = passageSpecs.map(buildArtifact)
export const rootReactorPassages = rootReactorPassageArtifacts.map((artifact) => artifact.passage)
export const rootReactorGuides = rootReactorPassageArtifacts.map((artifact) => artifact.guide)
export const rootReactorTargets = rootReactorPassageArtifacts.flatMap((artifact) => artifact.targets)
export const rootReactorSupportTargets = rootReactorPassages.flatMap((passage) => passage.wordSupportTargets ?? [])

export function getRootReactorArtifact(passageId: string): RootReactorPassageArtifact {
  const artifact = rootReactorPassageArtifacts.find((candidate) => candidate.passage.passageIdentifier === passageId)
  if (!artifact) throw new Error(`Unknown Root Reactor passage: ${passageId}`)
  return artifact
}
