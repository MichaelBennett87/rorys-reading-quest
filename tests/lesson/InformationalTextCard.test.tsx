import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { InformationalTextCard } from '../../src/components/lesson/InformationalTextCard'
import { grade2InformationDetectivesTextFeatureHuntPack } from '../../src/domain/content/packs/grade2/informationDetectives/textFeatureHunt'

afterEach(() => {
  cleanup()
})

function findPassageWithKinds(requiredKinds: readonly string[]) {
  const passage = grade2InformationDetectivesTextFeatureHuntPack.passages.find((entry) =>
    requiredKinds.every((kind) => entry.informationalStructure?.features.some((feature) => feature.kind === kind)),
  )

  expect(passage).toBeTruthy()
  return passage!
}

describe('InformationalTextCard', () => {
  test('renders graph and glossary information with accessible word support', () => {
    const passage = findPassageWithKinds(['graph', 'glossary'])
    const structure = passage.informationalStructure!
    const titleFeature = structure.features.find((feature) => feature.kind === 'title')
    const graphFeature = structure.features.find((feature) => feature.kind === 'graph')
    const glossaryFeature = structure.features.find((feature) => feature.kind === 'glossary')
    expect(passage.wordSupportTargets).toBeTruthy()
    const wordSupportTargets = passage.wordSupportTargets!
    const firstTarget = wordSupportTargets[0]
    const onOpenWordSupport = vi.fn()

    expect(titleFeature).toBeTruthy()
    expect(graphFeature).toBeTruthy()
    expect(glossaryFeature).toBeTruthy()
    expect(firstTarget).toBeTruthy()

    render(
      <InformationalTextCard
        heading="Text Feature Hunt"
        passage={passage}
        wordSupportTargets={wordSupportTargets}
        onOpenWordSupport={onOpenWordSupport}
      />,
    )

    expect(screen.getByRole('heading', { name: /Text Feature Hunt/i })).toBeTruthy()
    expect(screen.getByLabelText('Title').textContent).toBe(titleFeature!.text)
    expect(screen.getAllByRole('heading', { level: 3 }).length).toBeGreaterThanOrEqual(2)
    expect(screen.getByRole('heading', { name: graphFeature!.title, level: 4 })).toBeTruthy()
    expect(screen.getByRole('table', { name: `${graphFeature!.title} data table` })).toBeTruthy()
    expect(screen.getByRole('heading', { name: /Glossary/i, level: 4 })).toBeTruthy()
    expect(screen.getByText(glossaryFeature!.entries[0].definition)).toBeTruthy()
    expect(screen.getByRole('button', { name: `Open word help for ${firstTarget.surfaceWord}` })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: `Open word help for ${firstTarget.surfaceWord}` }))
    expect(onOpenWordSupport).toHaveBeenCalledWith(expect.objectContaining(firstTarget))
  })

  test('renders map and illustration features with captions and body structure', () => {
    const passage = findPassageWithKinds(['map', 'illustration'])
    const structure = passage.informationalStructure!
    const mapFeature = structure.features.find((feature) => feature.kind === 'map')
    const illustrationFeature = structure.features.find((feature) => feature.kind === 'illustration')
    const captionFeature = structure.features.find((feature) => feature.kind === 'caption')

    expect(mapFeature).toBeTruthy()
    expect(illustrationFeature).toBeTruthy()
    expect(captionFeature).toBeTruthy()

    render(<InformationalTextCard heading="Text Feature Hunt" passage={passage} />)

    expect(screen.getByLabelText('Title').textContent).toBe(structure.features.find((feature) => feature.kind === 'title')!.text)
    expect(screen.getAllByRole('heading', { level: 3 }).length).toBeGreaterThanOrEqual(2)
    expect(screen.getByRole('img', { name: `${mapFeature!.title} map` })).toBeTruthy()
    expect(screen.getByText(captionFeature!.text)).toBeTruthy()
    expect(screen.getByRole('heading', { name: illustrationFeature!.title, level: 4 })).toBeTruthy()
    expect(screen.getByText(illustrationFeature!.accessibleDescription)).toBeTruthy()
  })
})
