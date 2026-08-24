import { ChildButton } from '../components/ChildButton'
import { AtlasGuide } from '../components/AtlasGuide'
import { ChildMessage } from '../components/ChildMessage'
import { RewardBar } from '../components/RewardBar'
import { WorldCard } from '../components/WorldCard'
import type { DemoLearner } from '../data/demoLearner'
import type { DemoWorld } from '../data/demoWorlds'

interface HomeScreenProps {
  learner: DemoLearner
  worlds: DemoWorld[]
  currentWorldId: string
  onStartJourney: () => void
  onOpenParentArea: () => void
  storageNotice?: string
}

export function HomeScreen({
  learner,
  worlds,
  currentWorldId,
  onStartJourney,
  onOpenParentArea,
  storageNotice,
}: HomeScreenProps) {
  const currentWorldIndex = worlds.findIndex((world) => world.id === currentWorldId)
  const upNextWorldId = currentWorldIndex >= 0
    ? worlds.slice(currentWorldIndex + 1).find((world) => world.status !== 'coming-later')?.id ?? null
    : null

  return (
    <div className="screen-shell child-experience home-screen" data-appearance="dark">
      <header className="app-header">
        <div className="title-row">
          <AtlasGuide />
          <div>
            <p className="eyebrow">Your reading journey</p>
            <h1>Rory&apos;s Reading Quest</h1>
            <p className="subtitle">Ready to continue your journey?</p>
          </div>
        </div>
        <RewardBar xp={learner.xp} stars={learner.stars} streak={learner.questStreak} />
      </header>

      <section className="welcome-panel current-quest-card" aria-labelledby="current-quest-heading">
        <p className="quest-kicker">Today&apos;s trail</p>
        <h2 id="current-quest-heading">Ready for your next quest?</h2>
        <ChildMessage category="WELCOME" />
        <p className="small-copy">
          Current path: {learner.currentPath} · Level {learner.level}
        </p>
        <p className="small-copy">Completed quests: {learner.questStreak}</p>
        {storageNotice && <p className="storage-notice" role="status">{storageNotice}</p>}
        <ChildButton type="button" className="primary-action" onClick={onStartJourney}>
          Start Journey
        </ChildButton>
      </section>

      <section className="world-map" aria-labelledby="world-map-heading">
        <p className="eyebrow">See where your journey leads</p>
        <h2 id="world-map-heading">Your Reading Journey</h2>
        <div className="world-grid">
          {worlds.map((world) => (
            <WorldCard
              key={world.id}
              world={world}
              isCurrent={world.id === currentWorldId}
              isUpNext={world.id === upNextWorldId}
            />
          ))}
        </div>
      </section>

      <section className="quest-panel daily-quest-card" aria-labelledby="daily-quest-heading">
        <h2 id="daily-quest-heading">Today&apos;s Quest</h2>
        <div className="quest-goal-row">
          <p><span aria-hidden="true">🗺️</span> Complete your next reading quest.</p>
          <p><span aria-hidden="true">⭐</span> Earn up to three stars</p>
        </div>
      </section>

      <footer>
        <ChildButton type="button" className="parent-button" onClick={onOpenParentArea}>
          Parent Area
        </ChildButton>
      </footer>
    </div>
  )
}
