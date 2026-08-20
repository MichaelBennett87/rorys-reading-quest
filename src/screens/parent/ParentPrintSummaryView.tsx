import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'

import { ChildButton } from '../../components/ChildButton'
import {
  AccuracyMeter,
  ParentDataNote,
  ParentEmptyState,
  ParentMetricCard,
  ParentStatusBadge,
} from '../../components/parent'
import { type DashboardSnapshot } from '../../domain/dashboard'
import { type QuestProgressV1, type ParentRecordsState } from '../../persistence'
import { type PrintService } from '../../services/printing'
import { sortAssessmentRecordsForDisplay } from '../../domain/assessment'
import {
  describePlannedRoute,
  formatAssistanceLevel,
  formatDataAvailability,
  formatParentDate,
  formatPercent,
  formatTrailLabel,
  resolveCurrentTrailLabel,
  resolveFriendlySkillName,
} from './parentDashboardView'

interface ParentPrintSummaryViewProps {
  progress: QuestProgressV1
  dashboard: DashboardSnapshot
  recordsState: ParentRecordsState
  printService: PrintService
  onBackToDashboard: () => void
  headingRef: RefObject<HTMLHeadingElement | null>
}

export function ParentPrintSummaryView({
  progress,
  dashboard,
  recordsState,
  printService,
  onBackToDashboard,
  headingRef,
}: ParentPrintSummaryViewProps) {
  const [message, setMessage] = useState<string | null>(null)
  const summaryRef = useRef<HTMLParagraphElement>(null)
  const topSkills = useMemo(() => dashboard.skillSummaries.slice(0, 10), [dashboard.skillSummaries])
  const topRecentSessions = useMemo(() => dashboard.recentAttempts.slice(0, 5), [dashboard.recentAttempts])
  const topWordHelp = useMemo(() => dashboard.wordHelpSummaries.slice(0, 10), [dashboard.wordHelpSummaries])
  const orderedAssessments = useMemo(
    () => sortAssessmentRecordsForDisplay(recordsState.officialAssessments),
    [recordsState.officialAssessments],
  )

  useEffect(() => {
    headingRef.current?.focus()
  }, [headingRef])

  useEffect(() => {
    if (message) {
      summaryRef.current?.focus()
    }
  }, [message])

  const handlePrint = () => {
    const result = printService.print()
    if (result.status === 'unavailable') {
      setMessage(result.reason)
    } else {
      setMessage('Print preview is ready in the browser print dialog.')
    }
  }

  return (
    <section className="parent-dashboard-panel parent-print-summary" aria-labelledby="parent-print-summary-heading">
      <header className="parent-panel-header">
        <h2 id="parent-print-summary-heading" ref={headingRef} tabIndex={-1}>Parent Progress Summary</h2>
        <p>Rory’s Reading Quest - local-only summary for parent review.</p>
        <p className="parent-muted-copy">Generated {formatParentDate(dashboard.generatedAt)}</p>
      </header>

      <div className="parent-card-actions parent-print-actions">
        <ChildButton
          type="button"
          className="primary-action"
          onClick={handlePrint}
          disabled={!printService.isSupported()}
        >
          Print
        </ChildButton>
        <ChildButton type="button" className="secondary-action" onClick={onBackToDashboard}>
          Back to Dashboard
        </ChildButton>
      </div>

      {message && (
        <p className="parent-status-message" ref={summaryRef} role="status" tabIndex={-1}>
          {message}
        </p>
      )}

      {!printService.isSupported() && (
        <ParentDataNote
          title="Printing is not available in this browser."
          message="The preview stays readable, but the browser cannot open the print dialog on this device."
        />
      )}

      <section className="parent-metric-grid" aria-label="Overview">
        <ParentMetricCard label="Completed sessions" value={dashboard.overview.completedSessions} />
        <ParentMetricCard label="Recent average accuracy" value={dashboard.overview.recentAverageAccuracy === null ? 'No completed sessions yet' : `${dashboard.overview.recentAverageAccuracy}%`} />
        <ParentMetricCard label="Skills represented" value={dashboard.overview.skillsRepresented} />
        <ParentMetricCard label="Independent mastery milestones" value={dashboard.overview.totalIndependentMasteryMilestones} />
        <ParentMetricCard label="Reviews due" value={dashboard.overview.reviewsCurrentlyDue} />
        <ParentMetricCard label="Active remediation routes" value={dashboard.overview.activeRemediationRoutes} />
        <ParentMetricCard label="Practice rewards" value={`${dashboard.overview.totalXp} XP / ${dashboard.overview.totalStars} stars`} note="Rewards are not mastery evidence." />
      </section>

      <section className="card parent-summary-card">
        <div className="parent-card-heading-row">
          <h3>Current learning route</h3>
          <ParentStatusBadge tone={progress.plannedNextQuest?.status === 'content_needed' ? 'attention' : 'info'}>
            {describePlannedRoute(progress)}
          </ParentStatusBadge>
        </div>
        <p>{dashboard.nextQuestExplanation}</p>
        <p className="parent-muted-copy">Current trail: {resolveCurrentTrailLabel(progress, dashboard)}</p>
      </section>

      <SectionWithHeading title="Reporting categories" description="Florida-style reporting lanes, when current data is available.">
        <div className="parent-card-grid">
          {dashboard.categorySummaries.map((summary) => (
            <article key={summary.reportingCategory} className="card parent-summary-card">
              <div className="parent-card-heading-row">
                <h4>{summary.reportingCategory}</h4>
                <ParentStatusBadge tone={summary.dataAvailability === 'no_data' ? 'info' : 'neutral'}>
                  {formatDataAvailability(summary.dataAvailability)}
                </ParentStatusBadge>
              </div>
              <p>Attempts: {summary.totalQuestionAttempts}</p>
              <ParentMetricCard label="Overall accuracy" value={formatPercent(summary.overallAccuracy)}>
                <AccuracyMeter label={`${summary.reportingCategory} overall accuracy`} value={summary.overallAccuracy} />
              </ParentMetricCard>
              <p>First-attempt accuracy: {formatPercent(summary.firstAttemptAccuracy)}</p>
              <p>Assisted-session rate: {formatPercent(summary.assistedSessionRate)}</p>
              <p className="parent-muted-copy">Most recent activity: {formatParentDate(summary.mostRecentActivityDate)}</p>
            </article>
          ))}
        </div>
        {dashboard.categorySummaries.length === 0 && (
          <ParentEmptyState
            title="No practice data yet"
            message="Reporting categories will appear after the learner completes reading quests."
          />
        )}
      </SectionWithHeading>

      <SectionWithHeading title="Skill progress" description={dashboard.skillSummaries.length > 10 ? 'Showing the first 10 skills in this summary.' : 'Current skill summaries.'}>
        {topSkills.length === 0 ? (
          <ParentEmptyState title="No skill history yet" message="Skill summaries will appear after the learner completes a quest." />
        ) : (
          <div className="parent-card-grid">
            {topSkills.map((skill) => (
              <article key={skill.skillId} className="card parent-summary-card">
                <h4>{resolveFriendlySkillName(skill.skillId)}</h4>
                <p className="parent-muted-copy">Skill ID: {skill.skillId}</p>
                <p>Category: {skill.reportingCategory}</p>
                <p>Current trail: {formatTrailLabel(skill.currentDifficulty)}</p>
                <p>Last mastered trail: {formatTrailLabel(skill.lastMasteredDifficulty)}</p>
                <p>Accuracy: {formatPercent(skill.accuracy)}</p>
                <p>Mastery evidence: {skill.distinctIndependentEvidenceCount}</p>
                <p>Next review date: {formatParentDate(skill.nextReviewDate)}</p>
                <p>{skill.parentStatusExplanation}</p>
              </article>
            ))}
          </div>
        )}
      </SectionWithHeading>

      <SectionWithHeading title="Attention items" description="Practice signals, not diagnoses.">
        {dashboard.attentionItems.length === 0 ? (
          <ParentEmptyState
            title="No practice items need special attention right now."
            message="The current trail does not need any extra parent attention."
          />
        ) : (
          <div className="parent-card-grid">
            {dashboard.attentionItems.map((item) => (
              <article key={`${item.kind}::${item.title}`} className="card parent-summary-card">
                <div className="parent-card-heading-row">
                  <h4>{item.title}</h4>
                  <ParentStatusBadge tone={item.severity === 'attention' ? 'attention' : 'info'}>
                    {item.severity === 'attention' ? 'Attention' : 'Info'}
                  </ParentStatusBadge>
                </div>
                <p>{item.explanation}</p>
                <p className="parent-muted-copy">{item.evidenceSummary}</p>
                {item.relatedSkillId && <p className="parent-muted-copy">Skill: {resolveFriendlySkillName(item.relatedSkillId)}</p>}
                {item.relatedTargetId && <p className="parent-muted-copy">Target: {item.relatedTargetId}</p>}
              </article>
            ))}
          </div>
        )}
      </SectionWithHeading>

      <SectionWithHeading title="Review schedule" description="Overdue, due now, and upcoming review quests.">
        <section className="parent-metric-grid" aria-label="Review summary">
          <ParentMetricCard label="Overdue" value={dashboard.reviewSummary.overdueReviews} />
          <ParentMetricCard label="Due now" value={dashboard.reviewSummary.dueReviews - dashboard.reviewSummary.overdueReviews} />
          <ParentMetricCard label="Upcoming" value={dashboard.reviewSummary.upcomingReviews} />
          <ParentMetricCard label="Next review date" value={formatParentDate(dashboard.reviewSummary.nextReviewDate)} />
        </section>
        {dashboard.reviewSummary.entries.length === 0 ? (
          <ParentEmptyState title="No reviews are scheduled yet." message="Review entries will appear after the learner earns review dates." />
        ) : (
          <ul className="parent-summary-list">
            {dashboard.reviewSummary.entries.slice(0, 10).map((entry) => (
              <li key={`${entry.skillId}::${entry.difficulty}::${entry.dueAt}`} className="parent-summary-list-item">
                <span>{resolveFriendlySkillName(entry.skillId)}</span>
                <span>{formatTrailLabel(entry.difficulty)}</span>
                <span>Step {entry.reviewStep}</span>
                <span>{formatParentDate(entry.dueAt)}</span>
                <ParentStatusBadge tone={entry.status === 'overdue' ? 'attention' : 'info'}>
                  {entry.status === 'overdue' ? 'Overdue' : entry.status === 'due_now' ? 'Due now' : 'Upcoming'}
                </ParentStatusBadge>
              </li>
            ))}
          </ul>
        )}
      </SectionWithHeading>

      <SectionWithHeading title="Recent sessions" description="The five newest completed reading quests.">
        {topRecentSessions.length === 0 ? (
          <ParentEmptyState title="No completed reading quests yet." message="Recent sessions will appear after a quest is finished." />
        ) : (
          <div className="parent-card-grid">
            {topRecentSessions.map((attempt) => (
              <article key={`${attempt.completionDate}::${attempt.lessonId}::${attempt.activityId}`} className="card parent-summary-card">
                <h4>{attempt.lessonTitle}</h4>
                <p className="parent-muted-copy">{formatParentDate(attempt.completionDate)}</p>
                <p>{resolveFriendlySkillName(attempt.skillId)}</p>
                <p>Trail: {formatTrailLabel(attempt.difficulty)}</p>
                <p>Accuracy: {attempt.accuracy}%</p>
                <p>Assistance used: {attempt.assistanceUsed > 0 ? 'Yes' : 'No'}</p>
                <p>{attempt.parentFriendlyExplanation}</p>
              </article>
            ))}
          </div>
        )}
      </SectionWithHeading>

      <SectionWithHeading title="Words where clues have been useful" description="Word-help summaries kept local to the browser.">
        {topWordHelp.length === 0 ? (
          <ParentEmptyState
            title="No word-help activity has been recorded yet."
            message="Word help summaries will appear after a supported word is opened."
          />
        ) : (
          <div className="parent-card-grid">
            {topWordHelp.map((summary) => (
              <article key={summary.targetId} className="card parent-summary-card">
                <h4>{summary.displayWord}</h4>
                <p className="parent-muted-copy">Target ID: {summary.targetId}</p>
                <p>Sessions where help was used: {summary.sessionsWhereHelpUsed}</p>
                <p>Unique assistance actions: {summary.totalUniqueAssistanceActions}</p>
                <p>Highest support level: {formatAssistanceLevel(summary.maximumAssistanceLevel)}</p>
                <p>Most recent use date: {formatParentDate(summary.mostRecentUseDate)}</p>
              </article>
            ))}
          </div>
        )}
      </SectionWithHeading>

      <SectionWithHeading title="Official assessments" description="Assessment values entered from official reports. Rory’s Reading Quest does not calculate or verify these values.">
        <p className="parent-muted-copy">Stored assessment records: {orderedAssessments.length}</p>
        {orderedAssessments.length === 0 ? (
          <ParentEmptyState title="No official assessment records have been entered yet." message="Assessment values can be added later from an official report." />
        ) : (
          <div className="parent-card-grid">
            {orderedAssessments.map((record) => (
              <article key={record.assessmentId} className="card parent-summary-card">
                <h4>{record.assessmentWindow} · Grade {record.gradeBand}</h4>
                <p>Scale score {record.scaleScore}</p>
                <p>Tested on {formatParentDate(record.testedOn)}</p>
                <p>Reported Level {record.reportedAchievementLevel ?? 'Not entered'}</p>
                <p>Reported Percentile {record.reportedPercentileRank ?? 'Not entered'}</p>
              </article>
            ))}
          </div>
        )}
      </SectionWithHeading>

      {dashboard.dataQuality.unclassifiedQuestionCount > 0 || dashboard.dataQuality.missingContentReferenceCount > 0 ? (
        <ParentDataNote
          title="Data quality note"
          message="Some older activity details could not be matched to the current lesson catalog. Totals remain available where possible."
        />
      ) : null}

      <p className="parent-muted-copy">
        This local summary describes practice completed in Rory’s Reading Quest. It is not an official FAST score, diagnosis, grade placement, or prediction.
      </p>
    </section>
  )
}

function SectionWithHeading({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="parent-section-stack">
      <div className="parent-card-heading-row">
        <h3>{title}</h3>
      </div>
      <p className="parent-muted-copy">{description}</p>
      {children}
    </section>
  )
}
