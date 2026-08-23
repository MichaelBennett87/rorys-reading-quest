import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'

import type {
  DashboardAttentionItem,
  DashboardBenchmarkSummary,
  DashboardCategorySummary,
  DashboardRecentAttemptSummary,
  DashboardReviewEntry,
  DashboardReviewSummary,
  DashboardSnapshot,
  DashboardSkillSummary,
  DashboardWordHelpSummary,
} from '../../domain/dashboard'
import type { QuestProgressV1 } from '../../persistence'
import type { ParentRecordsState } from '../../persistence/parentRecordsStore'
import type { PrintService } from '../../services/printing'
import { ChildButton } from '../../components/ChildButton'
import {
  AccuracyMeter,
  ParentDashboardHeader,
  ParentDashboardNav,
  ParentDataNote,
  ParentEmptyState,
  ParentMetricCard,
  ParentStatusBadge,
} from '../../components/parent'
import { ParentAssessmentsView } from './ParentAssessmentsView'
import { ParentPrintSummaryView } from './ParentPrintSummaryView'
import {
  describePlannedRoute,
  FOUNDATIONAL_SKILLS_BRIDGE_NOTE,
  FLUENCY_PRACTICE_NOTE,
  formatBenchmarkReferences,
  formatAssistanceLevel,
  formatAccuracyPercent,
  formatParentDate,
  formatPercent,
  formatTrailLabel,
  resolveCurrentTrailLabel,
  resolveFriendlySkillName,
  summarizeRecentAttempts,
  type ParentDashboardView,
} from './parentDashboardView'
import type {
  ParentAssessmentCreateHandler,
  ParentAssessmentDeleteHandler,
  ParentAssessmentUpdateHandler,
} from './parentAssessmentActions'
import '../../styles/parent-dashboard.css'

interface ParentDashboardScreenProps {
  progress: QuestProgressV1
  dashboard: DashboardSnapshot
  recordsState: ParentRecordsState
  storageNotice?: string | null
  printService: PrintService
  onCreateAssessment: ParentAssessmentCreateHandler
  onUpdateAssessment: ParentAssessmentUpdateHandler
  onDeleteAssessment: ParentAssessmentDeleteHandler
  onLock: () => void
  onBackToQuest: () => void
}

type SessionKey = string

export function ParentDashboardScreen({
  progress,
  dashboard,
  recordsState,
  storageNotice,
  printService,
  onCreateAssessment,
  onUpdateAssessment,
  onDeleteAssessment,
  onLock,
  onBackToQuest,
}: ParentDashboardScreenProps) {
  const [activeView, setActiveView] = useState<ParentDashboardView>('overview')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null)
  const [selectedSessionKey, setSelectedSessionKey] = useState<SessionKey | null>(null)

  const overviewHeadingRef = useRef<HTMLHeadingElement>(null)
  const progressHeadingRef = useRef<HTMLHeadingElement>(null)
  const sessionsHeadingRef = useRef<HTMLHeadingElement>(null)
  const reviewsHeadingRef = useRef<HTMLHeadingElement>(null)
  const wordHelpHeadingRef = useRef<HTMLHeadingElement>(null)
  const assessmentsHeadingRef = useRef<HTMLHeadingElement>(null)
  const printSummaryHeadingRef = useRef<HTMLHeadingElement>(null)
  const skillDetailHeadingRef = useRef<HTMLHeadingElement>(null)
  const sessionDetailHeadingRef = useRef<HTMLHeadingElement>(null)

  const currentTrailLabel = resolveCurrentTrailLabel(progress, dashboard)
  const routeLabel = describePlannedRoute(progress)

  const handleChangeView = (view: ParentDashboardView) => {
    setActiveView(view)
    if (view !== 'progress') {
      setSelectedSkillId(null)
    }
    if (view !== 'sessions') {
      setSelectedSessionKey(null)
    }
  }

  useEffect(() => {
    if (activeView === 'overview') {
      overviewHeadingRef.current?.focus()
      return
    }
    if (activeView === 'progress' && selectedSkillId) {
      skillDetailHeadingRef.current?.focus()
      return
    }
    if (activeView === 'progress') {
      progressHeadingRef.current?.focus()
      return
    }
    if (activeView === 'sessions' && selectedSessionKey) {
      sessionDetailHeadingRef.current?.focus()
      return
    }
    if (activeView === 'sessions') {
      sessionsHeadingRef.current?.focus()
      return
    }
    if (activeView === 'reviews') {
      reviewsHeadingRef.current?.focus()
      return
    }
    if (activeView === 'word-help') {
      wordHelpHeadingRef.current?.focus()
      return
    }
    if (activeView === 'assessments') {
      assessmentsHeadingRef.current?.focus()
      return
    }
    if (activeView === 'print-summary') {
      printSummaryHeadingRef.current?.focus()
    }
  }, [activeView, selectedSessionKey, selectedSkillId])

  const filteredBenchmarks = useMemo(
    () => dashboard.benchmarkSummaries.filter((summary) => (
      selectedCategory === 'all' || summary.reportingCategory === selectedCategory
    )),
    [dashboard.benchmarkSummaries, selectedCategory],
  )

  const selectedSkill = selectedSkillId
    ? dashboard.skillSummaries.find((entry) => entry.skillId === selectedSkillId) ?? null
    : null

  const selectedSession = selectedSessionKey
    ? dashboard.recentAttempts.find((attempt) => sessionKey(attempt) === selectedSessionKey) ?? null
    : null

  const relatedSessions = selectedSkill
    ? dashboard.recentAttempts.filter((attempt) => attempt.skillId === selectedSkill.skillId)
    : []
  const relatedAttentionItems = selectedSkill
    ? dashboard.attentionItems.filter((item) => item.relatedSkillId === selectedSkill.skillId)
    : []

  const visibleCategories = dashboard.categorySummaries
  const showDataNote = dashboard.dataQuality.unclassifiedQuestionCount > 0
    || dashboard.dataQuality.missingContentReferenceCount > 0
  const mostRecentSessions = dashboard.recentAttempts.slice(0, 3)
  const reviewPreview = dashboard.reviewSummary.entries.slice(0, 3)

  return (
    <section className="screen-shell parent-dashboard-shell" aria-labelledby="parent-dashboard-title">
      <ParentDashboardHeader
        title="Parent Area"
        subtitle="Local-only progress, review, and support summaries."
        currentTrail={currentTrailLabel}
        storageNotice={storageNotice ?? null}
        onOpenPrintSummary={() => handleChangeView('print-summary')}
        onLock={onLock}
        onBackToQuest={onBackToQuest}
      />

      <ParentDashboardNav activeView={activeView} onChangeView={handleChangeView} />

      <main className="parent-dashboard-main">
        {activeView === 'overview' && (
          <section className="parent-dashboard-panel" aria-labelledby="parent-overview-heading">
            <header className="parent-panel-header">
              <h2 id="parent-overview-heading" ref={overviewHeadingRef} tabIndex={-1}>Overview</h2>
              <p>What is happening in the app right now.</p>
            </header>

            <section className="parent-metric-grid" aria-label="Progress overview">
              <ParentMetricCard label="Completed sessions" value={dashboard.overview.completedSessions} note="Completed reading quests" />
              <ParentMetricCard label="Recent average accuracy" value={formatAccuracyPercent(dashboard.overview.recentAverageAccuracy)} note="Most recent 10 completed sessions" />
              <ParentMetricCard label="Total XP" value={dashboard.overview.totalXp} note="Local reward total" />
              <ParentMetricCard label="Total stars" value={dashboard.overview.totalStars} note="Stars never decrease" />
              <ParentMetricCard label="Skills represented" value={dashboard.overview.skillsRepresented} note="Skills with history" />
              <ParentMetricCard label="Independent mastery milestones" value={dashboard.overview.totalIndependentMasteryMilestones} note="Distinct strong completions" />
              <ParentMetricCard label="Reviews currently due" value={dashboard.overview.reviewsCurrentlyDue} note="Due or overdue review quests" />
              <ParentMetricCard label="Active remediation routes" value={dashboard.overview.activeRemediationRoutes} note="Skills rebuilding a prerequisite" />
            </section>

            <section className="card parent-route-card" aria-label="Current learning route">
              <div className="parent-card-heading-row">
                <h3>Current learning route</h3>
                <ParentStatusBadge tone={progress.plannedNextQuest?.status === 'content_needed' ? 'attention' : 'info'}>
                  {routeLabel}
                </ParentStatusBadge>
              </div>
              <p>{dashboard.nextQuestExplanation}</p>
              <p className="parent-muted-copy">Current trail: {currentTrailLabel}</p>
            </section>

            <section className="parent-section-stack" aria-labelledby="parent-fluency-heading">
              <div className="parent-card-heading-row">
                <h3 id="parent-fluency-heading">Fluency practice</h3>
                <span className="parent-muted-copy">Practice only, no oral scoring</span>
              </div>
              <ParentDataNote
                title="Fluency Flight"
                message={`${FLUENCY_PRACTICE_NOTE} Supports ELA.2.F.1.4 as practice only.`}
              />
              <div className="parent-card-grid">
                <article className="card parent-summary-card">
                  <h4>Practice summary</h4>
                  <p>Completed sessions: {dashboard.fluencyPracticeSummary.completedFluencyPracticeSessions}</p>
                  <p>Distinct activities: {dashboard.fluencyPracticeSummary.distinctFluencyActivitiesCompleted}</p>
                  <p>Model reads: {dashboard.fluencyPracticeSummary.modelReadSessions}</p>
                  <p>Phrase practice uses: {dashboard.fluencyPracticeSummary.phrasePracticeSessions}</p>
                  <p>Completed rereads: {dashboard.fluencyPracticeSummary.totalCompletedReads}</p>
                  <p>Last practice date: {formatParentDate(dashboard.fluencyPracticeSummary.lastFluencyPracticeDate)}</p>
                  <p>Practice complete: {dashboard.fluencyPracticeSummary.practiceComplete ? 'Yes' : 'No'}</p>
                  <p className="parent-muted-copy">Oral reading measured: No</p>
                </article>
                <article className="card parent-summary-card">
                  <h4>Reflection mix</h4>
                  <p>Smooth: {dashboard.fluencyPracticeSummary.reflectionCounts.smooth}</p>
                  <p>Some pauses: {dashboard.fluencyPracticeSummary.reflectionCounts.some_pauses}</p>
                  <p>Try again: {dashboard.fluencyPracticeSummary.reflectionCounts.try_again}</p>
                </article>
              </div>
            </section>

            <section className="parent-section-stack" aria-labelledby="parent-attention-heading">
              <div className="parent-card-heading-row">
                <h3 id="parent-attention-heading">Attention items</h3>
                <span className="parent-muted-copy">{dashboard.attentionItems.length} item{dashboard.attentionItems.length === 1 ? '' : 's'}</span>
              </div>
              {dashboard.attentionItems.length === 0 ? (
                <ParentEmptyState
                  title="No practice items need special attention right now."
                  message="The current trail does not need any extra parent attention."
                />
              ) : (
                <div className="parent-card-grid">
                  {dashboard.attentionItems.map((item) => (
                    <AttentionCard key={`${item.kind}::${item.title}`} item={item} />
                  ))}
                </div>
              )}
            </section>

            <section className="parent-two-column">
              <section className="card parent-preview-card" aria-labelledby="parent-recent-preview-heading">
                <div className="parent-card-heading-row">
                  <h3 id="parent-recent-preview-heading">Recent activity preview</h3>
                  <span className="parent-muted-copy">{summarizeRecentAttempts(mostRecentSessions)}</span>
                </div>
                {mostRecentSessions.length === 0 ? (
                  <ParentEmptyState
                    title="No completed reading quests yet."
                    message="Once a quest is finished, the latest session will appear here."
                  />
                ) : (
                  <div className="parent-card-grid">
                    {mostRecentSessions.map((attempt) => (
                      <RecentAttemptCard
                        key={sessionKey(attempt)}
                        attempt={attempt}
                        onOpen={() => {
                          setActiveView('sessions')
                          setSelectedSessionKey(sessionKey(attempt))
                        }}
                      />
                    ))}
                  </div>
                )}
              </section>

              <section className="card parent-preview-card" aria-labelledby="parent-review-preview-heading">
                <div className="parent-card-heading-row">
                  <h3 id="parent-review-preview-heading">Review preview</h3>
                  <span className="parent-muted-copy">
                    {dashboard.reviewSummary.overdueReviews} overdue · {dashboard.reviewSummary.dueReviews} due · {dashboard.reviewSummary.upcomingReviews} upcoming
                  </span>
                </div>
                <ParentMetricCard
                  label="Next review date"
                  value={formatParentDate(dashboard.reviewSummary.nextReviewDate)}
                  note="Earliest review shown first"
                />
                {reviewPreview.length === 0 ? (
                  <ParentEmptyState
                    title="No reviews are scheduled yet."
                    message="Fresh review dates will appear after a skill is ready."
                  />
                ) : (
                  <ul className="parent-summary-list">
                    {reviewPreview.map((entry) => (
                      <li key={`${entry.skillId}::${entry.difficulty}::${entry.dueAt}`} className="parent-summary-list-item">
                        <span>{resolveReviewLabel(entry)} · {formatTrailLabel(entry.difficulty)}</span>
                        <span className="parent-muted-copy">{formatParentDate(entry.dueAt)}</span>
                        <span className="parent-muted-copy">{formatReviewStatusLabel(entry.status)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="parent-card-actions">
                  <ChildButton type="button" className="parent-button" onClick={() => setActiveView('reviews')}>
                    Open Review Schedule
                  </ChildButton>
                </div>
              </section>
            </section>

            {showDataNote && (
              <ParentDataNote
                title="Data quality note"
                message="Some older activity details could not be matched to the current lesson catalog. Totals remain available where possible."
              />
            )}
          </section>
        )}

        {activeView === 'progress' && !selectedSkill && (
          <section className="parent-dashboard-panel" aria-labelledby="parent-progress-heading">
            <header className="parent-panel-header">
              <h2 id="parent-progress-heading" ref={progressHeadingRef} tabIndex={-1}>Progress</h2>
              <p>Reporting categories, benchmarks, and skills.</p>
            </header>

            <section className="parent-section-stack" aria-labelledby="parent-categories-heading">
              <div className="parent-card-heading-row">
                <h3 id="parent-categories-heading">Reporting categories</h3>
                <span className="parent-muted-copy">Filtered by current lesson data</span>
              </div>
              <ParentDataNote
                title="Foundational Skills Bridge"
                message={FOUNDATIONAL_SKILLS_BRIDGE_NOTE}
              />
              <div className="parent-card-grid">
                {visibleCategories.map((summary) => (
                  <CategoryCard key={summary.reportingCategory} summary={summary} />
                ))}
              </div>
            </section>

            <section className="card parent-section-stack" aria-labelledby="parent-benchmarks-heading">
              <div className="parent-card-heading-row parent-benchmark-header">
                <h3 id="parent-benchmarks-heading">Benchmarks</h3>
                <label className="parent-inline-field">
                  <span className="parent-muted-copy">Filter by category</span>
                  <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
                    <option value="all">All categories</option>
                    {visibleCategories.map((summary) => (
                      <option key={summary.reportingCategory} value={summary.reportingCategory}>{summary.reportingCategory}</option>
                    ))}
                  </select>
                </label>
              </div>
              {filteredBenchmarks.length === 0 ? (
                <ParentEmptyState
                  title="No practice data yet"
                  message="Benchmarks will appear after the learner completes a quest."
                />
              ) : (
                <div className="parent-card-grid">
                  {filteredBenchmarks.map((summary) => (
                    <BenchmarkCard key={`${summary.benchmarkReference}::${summary.skillIdentifier}`} summary={summary} />
                  ))}
                </div>
              )}
            </section>

            <section className="parent-section-stack" aria-labelledby="parent-skills-heading">
              <div className="parent-card-heading-row">
                <h3 id="parent-skills-heading">Skills</h3>
                <span className="parent-muted-copy">{dashboard.skillSummaries.length} skill{dashboard.skillSummaries.length === 1 ? '' : 's'}</span>
              </div>
              {dashboard.skillSummaries.length === 0 ? (
                <ParentEmptyState
                  title="No skill history yet"
                  message="Skill summaries will appear after the learner completes a quest."
                />
              ) : (
                <div className="parent-card-grid">
                  {dashboard.skillSummaries.map((summary) => (
                    <SkillSummaryCard
                      key={summary.skillId}
                      summary={summary}
                      onOpen={() => {
                        setActiveView('progress')
                        setSelectedSkillId(summary.skillId)
                      }}
                    />
                  ))}
                </div>
              )}
            </section>
          </section>
        )}

        {activeView === 'progress' && selectedSkill && (
          <SkillDetailView
            skill={selectedSkill}
            relatedSessions={relatedSessions}
            relatedAttentionItems={relatedAttentionItems}
            onBack={() => setSelectedSkillId(null)}
            headingRef={skillDetailHeadingRef}
          />
        )}

        {activeView === 'sessions' && !selectedSession && (
          <section className="parent-dashboard-panel" aria-labelledby="parent-sessions-heading">
            <header className="parent-panel-header">
              <h2 id="parent-sessions-heading" ref={sessionsHeadingRef} tabIndex={-1}>Sessions</h2>
              <p>The latest ten completed reading quests, newest first.</p>
            </header>
            {dashboard.recentAttempts.length === 0 ? (
              <ParentEmptyState
                title="No completed reading quests yet."
                message="Once a quest is finished, session details will appear here."
              />
            ) : (
              <div className="parent-card-grid">
                {dashboard.recentAttempts.map((attempt) => (
                  <SessionCard
                    key={sessionKey(attempt)}
                    attempt={attempt}
                    onOpen={() => {
                      setActiveView('sessions')
                      setSelectedSessionKey(sessionKey(attempt))
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {activeView === 'sessions' && selectedSession && (
          <SessionDetailView
            attempt={selectedSession}
            onBack={() => setSelectedSessionKey(null)}
            headingRef={sessionDetailHeadingRef}
          />
        )}

        {activeView === 'reviews' && (
          <ReviewsView
            reviewSummary={dashboard.reviewSummary}
            headingRef={reviewsHeadingRef}
          />
        )}

        {activeView === 'word-help' && (
          <WordHelpView
            summaries={dashboard.wordHelpSummaries}
            headingRef={wordHelpHeadingRef}
          />
        )}

        {activeView === 'assessments' && (
          <AssessmentsPlaceholderView
            recordsState={recordsState}
            headingRef={assessmentsHeadingRef}
            onCreateAssessment={onCreateAssessment}
            onUpdateAssessment={onUpdateAssessment}
            onDeleteAssessment={onDeleteAssessment}
          />
        )}

        {activeView === 'print-summary' && (
          <ParentPrintSummaryView
            progress={progress}
            dashboard={dashboard}
            recordsState={recordsState}
            printService={printService}
            onBackToDashboard={() => handleChangeView('overview')}
            headingRef={printSummaryHeadingRef}
          />
        )}
      </main>
    </section>
  )
}

function CategoryCard({ summary }: { summary: DashboardCategorySummary }) {
  return (
    <article className="card parent-summary-card">
      <div className="parent-card-heading-row">
        <h4>{summary.reportingCategory}</h4>
        <ParentStatusBadge tone={summary.dataAvailability === 'no_data' ? 'info' : 'neutral'}>
          {summary.dataAvailability === 'no_data' ? 'No data yet' : 'Ready'}
        </ParentStatusBadge>
      </div>
      <p className="parent-muted-copy">Reporting lane</p>
      <ParentMetricCard label="Question attempts" value={summary.totalQuestionAttempts} />
      <ParentMetricCard label="Overall accuracy" value={formatPercent(summary.overallAccuracy)}>
        <AccuracyMeter label={`${summary.reportingCategory} overall accuracy`} value={summary.overallAccuracy} />
      </ParentMetricCard>
      <ParentMetricCard label="First-attempt accuracy" value={formatPercent(summary.firstAttemptAccuracy)} />
      <ParentMetricCard label="Assisted session rate" value={formatPercent(summary.assistedSessionRate)} />
      <p className="parent-muted-copy">Most recent activity: {formatParentDate(summary.mostRecentActivityDate)}</p>
    </article>
  )
}

function BenchmarkCard({ summary }: { summary: DashboardBenchmarkSummary }) {
  return (
    <article className="card parent-summary-card">
      <div className="parent-card-heading-row">
        <h4>{summary.benchmarkReference}</h4>
        <ParentStatusBadge tone={summary.dataAvailability === 'no_data' ? 'info' : 'neutral'}>
          {summary.dataAvailability === 'no_data' ? 'No data yet' : 'Ready'}
        </ParentStatusBadge>
      </div>
      <p className="parent-muted-copy">{summary.reportingCategory}</p>
      <p>{resolveFriendlySkillName(summary.skillIdentifier)}</p>
      <p className="parent-muted-copy">Skill ID: {summary.skillIdentifier}</p>
      <p className="parent-muted-copy">Grade band: {summary.gradeBand ?? 'Archived'}</p>
      {summary.benchmarkReference === 'ELA.3.F.1.3' && (
        <ParentDataNote title="Partial curriculum coverage" message="Root Reactor practices Greek and Latin root and affix decoding. Later Grade 3 word-analysis units are still required for full ELA.3.F.1.3 coverage." />
      )}
      <ParentMetricCard label="Attempts" value={summary.questionAttempts} />
      <ParentMetricCard label="Accuracy" value={formatPercent(summary.accuracy)} />
      <ParentMetricCard label="First-attempt accuracy" value={formatPercent(summary.firstAttemptAccuracy)} />
      <ParentMetricCard label="Assisted-session rate" value={formatPercent(summary.assistedSessionRate)} />
      <p className="parent-muted-copy">Current trail: {formatTrailLabel(summary.currentDifficulty)}</p>
      <p>{summary.parentStatusExplanation}</p>
    </article>
  )
}

function SkillSummaryCard({
  summary,
  onOpen,
}: {
  summary: DashboardSkillSummary
  onOpen: () => void
}) {
  return (
    <article className="card parent-summary-card">
      <div className="parent-card-heading-row">
        <h4>{resolveFriendlySkillName(summary.skillId)}</h4>
        <ParentStatusBadge tone={summary.dataAvailability === 'no_data' ? 'info' : 'neutral'}>
          {summary.dataAvailability === 'no_data' ? 'No data yet' : 'Ready'}
        </ParentStatusBadge>
      </div>
      <p className="parent-muted-copy">Skill ID: {summary.skillId}</p>
      <p className="parent-muted-copy">Benchmark references: {formatBenchmarkReferences(summary.benchmarkReferences)}</p>
      <p className="parent-muted-copy">Category: {summary.reportingCategory}</p>
      {summary.benchmarkReferences.includes('ELA.3.F.1.3') && (
        <p className="parent-muted-copy">Curriculum coverage: Partial. Root Reactor covers root and affix decoding only.</p>
      )}
      <p>Current trail: {formatTrailLabel(summary.currentDifficulty)}</p>
      <p>Last mastered trail: {formatTrailLabel(summary.lastMasteredDifficulty)}</p>
      <p>Mastery evidence: {summary.distinctIndependentEvidenceCount}</p>
      <p>Current learning status: {summary.parentStatusExplanation}</p>
      <p>Next review date: {formatParentDate(summary.nextReviewDate)}</p>
      <ParentMetricCard label="Accuracy" value={formatPercent(summary.accuracy)} />
      <div className="parent-card-actions">
        <ChildButton type="button" className="parent-button" onClick={onOpen}>
          View Skill Details
        </ChildButton>
      </div>
    </article>
  )
}

function SkillDetailView({
  skill,
  relatedSessions,
  relatedAttentionItems,
  onBack,
  headingRef,
}: {
  skill: DashboardSkillSummary
  relatedSessions: DashboardRecentAttemptSummary[]
  relatedAttentionItems: DashboardAttentionItem[]
  onBack: () => void
  headingRef: RefObject<HTMLHeadingElement | null>
}) {
  return (
    <section className="parent-dashboard-panel" aria-labelledby="parent-skill-detail-heading">
      <header className="parent-panel-header">
        <h2 id="parent-skill-detail-heading" ref={headingRef} tabIndex={-1}>{resolveFriendlySkillName(skill.skillId)}</h2>
        <p>How this skill is doing right now.</p>
      </header>

      <section className="card parent-detail-card">
        <p className="parent-muted-copy">Skill ID: {skill.skillId}</p>
        <p className="parent-muted-copy">Benchmark references: {formatBenchmarkReferences(skill.benchmarkReferences)}</p>
        <p className="parent-muted-copy">Reporting category: {skill.reportingCategory}</p>
        <p>Grade band: {skill.gradeBand ?? 'Archived'}</p>
        {skill.benchmarkReferences.includes('ELA.3.F.1.3') && (
          <ParentDataNote title="Partial curriculum coverage" message="Root Reactor covers common Greek and Latin root and affix decoding. It does not yet complete ELA.3.F.1.3." />
        )}
        <p>Question attempts: {skill.questionAttempts}</p>
        <p>Overall accuracy: {formatPercent(skill.accuracy)}</p>
        <p>First-attempt accuracy: {formatPercent(skill.firstAttemptAccuracy)}</p>
        <p>Assisted-session rate: {formatPercent(skill.assistedSessionRate)}</p>
        <p>Current trail: {formatTrailLabel(skill.currentDifficulty)}</p>
        <p>Last mastered trail: {formatTrailLabel(skill.lastMasteredDifficulty)}</p>
        <p>Distinct independent evidence count: {skill.distinctIndependentEvidenceCount}</p>
        <p>Current learning state: {skill.parentStatusExplanation}</p>
        <p>Next review date: {formatParentDate(skill.nextReviewDate)}</p>
        <p>Remediation route: {skill.activeRemediationTarget ?? 'None'}</p>
        <section className="parent-explainer-box" aria-label="How to read this skill summary">
          <p><strong>Accuracy</strong> measures all correct answers.</p>
          <p><strong>First-attempt accuracy</strong> measures first tries only.</p>
          <p><strong>Mastery evidence</strong> counts distinct independent qualifying activities.</p>
          <p><strong>Assistance use</strong> does not reduce rewards, but it means the app still needs independent evidence.</p>
        </section>
      </section>

      <section className="parent-two-column">
        <section className="card" aria-labelledby="related-sessions-heading">
          <div className="parent-card-heading-row">
            <h3 id="related-sessions-heading">Related recent sessions</h3>
            <span className="parent-muted-copy">{relatedSessions.length}</span>
          </div>
          {relatedSessions.length === 0 ? (
            <ParentEmptyState
              title="No related sessions yet."
              message="The learner has not completed a session for this skill recently."
            />
          ) : (
            <ul className="parent-summary-list">
              {relatedSessions.map((attempt) => (
                <li key={sessionKey(attempt)} className="parent-summary-list-item">
                  <span>{attempt.lessonTitle}</span>
                  <span className="parent-muted-copy">{formatParentDate(attempt.completionDate)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card" aria-labelledby="related-attention-heading">
          <div className="parent-card-heading-row">
            <h3 id="related-attention-heading">Related attention items</h3>
            <span className="parent-muted-copy">{relatedAttentionItems.length}</span>
          </div>
          {relatedAttentionItems.length === 0 ? (
            <ParentEmptyState
              title="No related attention items."
              message="This skill does not currently need any extra parent attention."
            />
          ) : (
            <div className="parent-card-grid">
              {relatedAttentionItems.map((item) => (
                <AttentionCard key={`${item.kind}::${item.title}`} item={item} />
              ))}
            </div>
          )}
        </section>
      </section>

      <div className="parent-card-actions">
        <ChildButton type="button" className="parent-button" onClick={onBack}>
          Back to Progress
        </ChildButton>
      </div>
    </section>
  )
}

function SessionCard({
  attempt,
  onOpen,
}: {
  attempt: DashboardRecentAttemptSummary
  onOpen: () => void
}) {
  return (
    <article className="card parent-summary-card">
      <h4>{attempt.lessonTitle}</h4>
      <p className="parent-muted-copy">{formatParentDate(attempt.completionDate)}</p>
      <p className="parent-muted-copy">{resolveFriendlySkillName(attempt.skillId)}</p>
      <p>Trail: {formatTrailLabel(attempt.difficulty)}</p>
      <ParentMetricCard label="Accuracy" value={formatAccuracyPercent(attempt.accuracy)} />
      <ParentMetricCard label="First-attempt accuracy" value={formatAccuracyPercent(attempt.firstAttemptAccuracy)} />
      <p>Assistance used: {attempt.assistanceUsed > 0 ? 'Yes' : 'No'}</p>
      <p>Highest support step: {attempt.maximumAssistanceLevel > 0 ? formatAssistanceLevel(attempt.maximumAssistanceLevel) : 'No support used'}</p>
      <p>{attempt.parentFriendlyExplanation}</p>
      <div className="parent-card-actions">
        <ChildButton type="button" className="parent-button" onClick={onOpen}>
          Open Session Details
        </ChildButton>
      </div>
    </article>
  )
}

function SessionDetailView({
  attempt,
  onBack,
  headingRef,
}: {
  attempt: DashboardRecentAttemptSummary
  onBack: () => void
  headingRef: RefObject<HTMLHeadingElement | null>
}) {
  return (
    <section className="parent-dashboard-panel" aria-labelledby="parent-session-detail-heading">
      <header className="parent-panel-header">
        <h2 id="parent-session-detail-heading" ref={headingRef} tabIndex={-1}>{attempt.lessonTitle}</h2>
        <p>Privacy-safe details for one completed reading quest.</p>
      </header>

      <section className="card parent-detail-card">
        <p>Completion date: {formatParentDate(attempt.completionDate)}</p>
        <p>Activity identifier: {attempt.activityId}</p>
        <p>Skill: {resolveFriendlySkillName(attempt.skillId)}</p>
        <p>Trail: {formatTrailLabel(attempt.difficulty)}</p>
        <p>Accuracy: {formatAccuracyPercent(attempt.accuracy)}</p>
        <p>First-attempt accuracy: {formatAccuracyPercent(attempt.firstAttemptAccuracy)}</p>
        <p>Assistance used: {attempt.assistanceUsed > 0 ? 'Yes' : 'No'}</p>
        <p>Supported targets used: {attempt.supportedTargetCount}</p>
        <p>Highest support step: {attempt.maximumAssistanceLevel > 0 ? formatAssistanceLevel(attempt.maximumAssistanceLevel) : 'No support used'}</p>
        <p>Progression explanation: {attempt.parentFriendlyExplanation}</p>
        <p>Next review date: {formatParentDate(attempt.nextReviewDate)}</p>
        <p>Classification status: {attempt.classificationStatus === 'classified' ? 'Classified' : 'Unclassified'}</p>
        {attempt.classificationStatus === 'unclassified' && (
          <ParentDataNote
            title="Unclassified history"
            message="Some details for this older activity are no longer available in the current lesson catalog."
          />
        )}
      </section>

      <div className="parent-card-actions">
        <ChildButton type="button" className="parent-button" onClick={onBack}>
          Back to Sessions
        </ChildButton>
      </div>
    </section>
  )
}

function ReviewsView({
  reviewSummary,
  headingRef,
}: {
  reviewSummary: DashboardReviewSummary
  headingRef: RefObject<HTMLHeadingElement | null>
}) {
  return (
    <section className="parent-dashboard-panel" aria-labelledby="parent-reviews-heading">
      <header className="parent-panel-header">
        <h2 id="parent-reviews-heading" ref={headingRef} tabIndex={-1}>Reviews</h2>
        <p>When review sessions are due, due now, or still upcoming.</p>
      </header>

      <section className="parent-metric-grid" aria-label="Review summary">
        <ParentMetricCard label="Overdue" value={reviewSummary.overdueReviews} />
        <ParentMetricCard label="Due now" value={reviewSummary.dueReviews - reviewSummary.overdueReviews} />
        <ParentMetricCard label="Upcoming" value={reviewSummary.upcomingReviews} />
        <ParentMetricCard label="Next review date" value={formatParentDate(reviewSummary.nextReviewDate)} />
      </section>
      {reviewSummary.dataQualityNote && (
        <ParentDataNote
          title="Review affinity note"
          message={reviewSummary.dataQualityNote}
        />
      )}

      {reviewSummary.entries.length === 0 ? (
        <ParentEmptyState
          title="No reviews are scheduled yet."
          message="Review entries will appear after the learner earns review dates."
        />
      ) : (
        <section className="card" aria-label="Review entries">
          <div className="parent-card-heading-row">
            <h3>Review entries</h3>
            <span className="parent-muted-copy">{reviewSummary.entries.length}</span>
          </div>
          <ul className="parent-summary-list">
            {reviewSummary.entries.map((entry) => (
              <li key={`${entry.skillId}::${entry.difficulty}::${entry.dueAt}`} className="parent-summary-list-item">
                <span>{resolveReviewLabel(entry)}</span>
                <span>{formatTrailLabel(entry.difficulty)}</span>
                <span>Step {entry.reviewStep}</span>
                <span>{formatParentDate(entry.dueAt)}</span>
                <ParentStatusBadge tone={entry.status === 'overdue' ? 'attention' : 'info'}>
                  {formatReviewStatusLabel(entry.status)}
                </ParentStatusBadge>
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  )
}

function WordHelpView({
  summaries,
  headingRef,
}: {
  summaries: DashboardWordHelpSummary[]
  headingRef: RefObject<HTMLHeadingElement | null>
}) {
  return (
    <section className="parent-dashboard-panel" aria-labelledby="parent-word-help-heading">
      <header className="parent-panel-header">
        <h2 id="parent-word-help-heading" ref={headingRef} tabIndex={-1}>Word Help</h2>
        <p>Words where clues have been useful.</p>
      </header>

      {summaries.length === 0 ? (
        <ParentEmptyState
          title="No word-help activity has been recorded yet."
          message="Word help summaries will appear after a supported word is opened."
        />
      ) : (
        <div className="parent-card-grid">
          {summaries.map((summary) => (
            <article key={summary.targetId} className="card parent-summary-card">
              <h3>{summary.displayWord}</h3>
              <p className="parent-muted-copy">Target ID: {summary.targetId}</p>
              <p>Sessions where help was used: {summary.sessionsWhereHelpUsed}</p>
              <p>Unique assistance actions: {summary.totalUniqueAssistanceActions}</p>
              <p>Highest support level: {formatAssistanceLevel(summary.maximumAssistanceLevel)}</p>
              <p>Most recent use date: {formatParentDate(summary.mostRecentUseDate)}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function AssessmentsPlaceholderView({
  recordsState,
  headingRef,
  onCreateAssessment,
  onUpdateAssessment,
  onDeleteAssessment,
}: {
  recordsState: ParentRecordsState
  headingRef: RefObject<HTMLHeadingElement | null>
  onCreateAssessment: ParentAssessmentCreateHandler
  onUpdateAssessment: ParentAssessmentUpdateHandler
  onDeleteAssessment: ParentAssessmentDeleteHandler
}) {
  return (
    <ParentAssessmentsView
      recordsState={recordsState}
      headingRef={headingRef}
      onCreateAssessment={onCreateAssessment}
      onUpdateAssessment={onUpdateAssessment}
      onDeleteAssessment={onDeleteAssessment}
    />
  )
}

function AttentionCard({ item }: { item: DashboardAttentionItem }) {
  return (
    <article className="card parent-summary-card">
      <div className="parent-card-heading-row">
        <h4>{item.title}</h4>
        <ParentStatusBadge tone={item.severity === 'attention' ? 'attention' : 'info'}>
          {item.severity === 'attention' ? 'Attention' : 'Info'}
        </ParentStatusBadge>
      </div>
      <p>{item.explanation}</p>
      <p className="parent-muted-copy">{item.evidenceSummary}</p>
      {item.relatedSkillId && <p className="parent-muted-copy">Skill: {resolveFriendlySkillName(item.relatedSkillId)} ({item.relatedSkillId})</p>}
      {item.relatedTargetId && <p className="parent-muted-copy">Target: {item.relatedTargetId}</p>}
    </article>
  )
}

function RecentAttemptCard({
  attempt,
  onOpen,
}: {
  attempt: DashboardRecentAttemptSummary
  onOpen: () => void
}) {
  return (
    <article className="card parent-summary-card">
      <h4>{attempt.lessonTitle}</h4>
      <p className="parent-muted-copy">{formatParentDate(attempt.completionDate)}</p>
      <p>{resolveFriendlySkillName(attempt.skillId)}</p>
      <p>Trail: {formatTrailLabel(attempt.difficulty)}</p>
      <ParentMetricCard label="Accuracy" value={formatAccuracyPercent(attempt.accuracy)}>
        <AccuracyMeter label={`${attempt.lessonTitle} accuracy`} value={attempt.accuracy} />
      </ParentMetricCard>
      <p>Assistance: {attempt.assistanceUsed > 0 ? 'Used' : 'No support used'}</p>
      <p>{attempt.parentFriendlyExplanation}</p>
      <div className="parent-card-actions">
        <ChildButton type="button" className="parent-button" onClick={onOpen}>
          Open Session Details
        </ChildButton>
      </div>
    </article>
  )
}

function formatReviewStatusLabel(status: DashboardReviewEntry['status']): string {
  if (status === 'overdue') return 'Overdue'
  if (status === 'due_now') return 'Due now'
  return 'Upcoming'
}

function resolveReviewLabel(entry: DashboardReviewEntry): string {
  return entry.unitLabel ?? resolveFriendlySkillName(entry.skillId)
}

function sessionKey(attempt: DashboardRecentAttemptSummary): SessionKey {
  return `${attempt.completionDate}::${attempt.lessonId}::${attempt.activityId}::${attempt.difficulty}`
}
