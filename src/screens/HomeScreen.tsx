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
  onContinue: () => void
  onWorldSelect: (worldId: string) => void
  onOpenParentArea: () => void
  storageNotice?: string
}

export function HomeScreen({
  learner,
  worlds,
  onContinue,
  onWorldSelect,
  onOpenParentArea,
  storageNotice,
}: HomeScreenProps) {
  return (
    <div className="screen-shell child-experience home-screen" data-appearance="dark">
      <header className="app-header">
        <div className="title-row">
          <AtlasGuide />
          <div>
            <p className="eyebrow">Choose your next reading adventure</p>
            <h1>Rory&apos;s Reading Quest</h1>
            <p className="subtitle">Build reading powers one quest at a time.</p>
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
        <ChildButton type="button" className="primary-action" onClick={onContinue}>
          Continue Quest
        </ChildButton>
      </section>

      <section className="world-map" aria-labelledby="world-map-heading">
        <p className="eyebrow">Your adventure map</p>
        <h2 id="world-map-heading">Curriculum Worlds</h2>
        <div className="world-grid">
          {worlds.map((world) => (
            <WorldCard key={world.id} world={world} onOpenWorld={onWorldSelect} />
          ))}
        </div>
      </section>

      <section className="quest-panel daily-quest-card" aria-labelledby="daily-quest-heading">
        <h2 id="daily-quest-heading">Today&apos;s Quest</h2>
        <div className="quest-goal-row">
          <p><span aria-hidden="true">🗺️</span> Practice one available unit</p>
          <p><span aria-hidden="true">⭐</span> Earn up to three stars</p>
        </div>
      </section>

      <footer>
        <ChildButton type="button" className="parent-button" onClick={onOpenParentArea}>
          Grown-Up Area
        </ChildButton>
      </footer>
    </div>
  )
}
