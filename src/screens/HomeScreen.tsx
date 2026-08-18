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
}

export function HomeScreen({
  learner,
  worlds,
  onContinue,
  onWorldSelect,
  onOpenParentArea,
}: HomeScreenProps) {
  return (
    <div className="screen-shell">
      <header className="app-header">
        <div className="title-row">
          <AtlasGuide />
          <div>
            <h1>Rory&apos;s Reading Quest</h1>
            <p className="subtitle">Build reading powers one quest at a time.</p>
          </div>
        </div>
        <RewardBar xp={learner.xp} stars={learner.stars} streak={learner.questStreak} />
      </header>

      <section className="welcome-panel">
        <ChildMessage category="WELCOME" />
        <p className="small-copy">
          Current path: {learner.currentPath} · Level {learner.level}
        </p>
        <ChildButton type="button" className="primary-action" onClick={onContinue}>
          Continue Quest
        </ChildButton>
      </section>

      <section className="world-map" aria-labelledby="world-map-heading">
        <h2 id="world-map-heading">Curriculum Worlds</h2>
        <div className="world-grid">
          {worlds.map((world) => (
            <WorldCard key={world.id} world={world} onOpenWorld={onWorldSelect} />
          ))}
        </div>
      </section>

      <section className="quest-panel" aria-labelledby="daily-quest-heading">
        <h2 id="daily-quest-heading">Today&apos;s Quest</h2>
        <p>Practice 1 Word Forge unit</p>
        <p>Earn up to 3 stars</p>
      </section>

      <footer>
        <ChildButton type="button" className="parent-button" onClick={onOpenParentArea}>
          Grown-Up Area
        </ChildButton>
      </footer>
    </div>
  )
}

