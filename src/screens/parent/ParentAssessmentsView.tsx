import { useEffect, useMemo, useRef, useState, type FormEvent, type RefObject } from 'react'

import { ChildButton } from '../../components/ChildButton'
import { ParentEmptyState } from '../../components/parent'
import {
  sortAssessmentRecordsForDisplay,
  type AssessmentFormError,
  type AssessmentFormValues,
  type OfficialAssessmentRecord,
} from '../../domain/assessment'
import type { ParentRecordsState } from '../../persistence'
import { formatParentDate } from './parentDashboardView'
import type {
  ParentAssessmentCreateHandler,
  ParentAssessmentDeleteHandler,
  ParentAssessmentMutationResult,
  ParentAssessmentUpdateHandler,
} from './parentAssessmentActions'

interface ParentAssessmentsViewProps {
  recordsState: ParentRecordsState
  onCreateAssessment: ParentAssessmentCreateHandler
  onUpdateAssessment: ParentAssessmentUpdateHandler
  onDeleteAssessment: ParentAssessmentDeleteHandler
  headingRef: RefObject<HTMLHeadingElement | null>
}

type AssessmentMode = 'list' | 'create' | 'edit' | 'delete'

const EMPTY_DRAFT: AssessmentFormValues = {
  assessmentWindow: '',
  gradeBand: '',
  scaleScore: '',
  testedOn: '',
  reportedAchievementLevel: '',
  reportedPercentileRank: '',
}

export function ParentAssessmentsView({
  recordsState,
  onCreateAssessment,
  onUpdateAssessment,
  onDeleteAssessment,
  headingRef,
}: ParentAssessmentsViewProps) {
  const [mode, setMode] = useState<AssessmentMode>('list')
  const [draft, setDraft] = useState<AssessmentFormValues>(EMPTY_DRAFT)
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<AssessmentFormError[]>([])
  const summaryRef = useRef<HTMLDivElement>(null)
  const formHeadingRef = useRef<HTMLHeadingElement>(null)
  const deleteHeadingRef = useRef<HTMLHeadingElement>(null)
  const sortedAssessments = useMemo(
    () => sortAssessmentRecordsForDisplay(recordsState.officialAssessments),
    [recordsState.officialAssessments],
  )
  const selectedAssessment = selectedAssessmentId
    ? sortedAssessments.find((record) => record.assessmentId === selectedAssessmentId) ?? null
    : null

  useEffect(() => {
    if (message) {
      summaryRef.current?.focus()
    }
  }, [message])

  useEffect(() => {
    if (mode === 'create' || mode === 'edit') {
      formHeadingRef.current?.focus()
      return
    }
    if (mode === 'delete') {
      deleteHeadingRef.current?.focus()
    }
  }, [mode])

  const openCreateForm = () => {
    setSelectedAssessmentId(null)
    setDraft(EMPTY_DRAFT)
    setFieldErrors([])
    setMessage(null)
    setMode('create')
  }

  const openEditForm = (record: OfficialAssessmentRecord) => {
    setSelectedAssessmentId(record.assessmentId)
    setDraft(fromRecord(record))
    setFieldErrors([])
    setMessage(null)
    setMode('edit')
  }

  const openDeleteConfirm = (record: OfficialAssessmentRecord) => {
    setSelectedAssessmentId(record.assessmentId)
    setFieldErrors([])
    setMessage(null)
    setMode('delete')
  }

  const cancelMutation = () => {
    setMode('list')
    setSelectedAssessmentId(null)
    setDraft(EMPTY_DRAFT)
    setFieldErrors([])
    setMessage(null)
  }

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const outcome = onCreateAssessment(draft)
    handleOutcome(outcome, 'create')
  }

  const handleUpdate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedAssessmentId) {
      return
    }
    const outcome = onUpdateAssessment(selectedAssessmentId, draft)
    handleOutcome(outcome, 'edit')
  }

  const handleDelete = () => {
    if (!selectedAssessmentId) {
      return
    }
    const outcome = onDeleteAssessment(selectedAssessmentId)
    handleOutcome(outcome, 'delete')
  }

  const fieldErrorMap = useMemo(() => {
    const map = new Map<keyof AssessmentFormValues, string>()
    for (const error of fieldErrors) {
      if (!map.has(error.field)) {
        map.set(error.field, error.message)
      }
    }
    return map
  }, [fieldErrors])

  function handleOutcome(outcome: ParentAssessmentMutationResult, mutatingMode: Exclude<AssessmentMode, 'list'>) {
    setMessage(outcome.message)
    setFieldErrors(outcome.fieldErrors)
    if (outcome.status === 'saved') {
      setMode('list')
      setSelectedAssessmentId(null)
      setDraft(EMPTY_DRAFT)
      return
    }
    if (outcome.status === 'not_found' && mutatingMode === 'delete') {
      setMode('list')
      setSelectedAssessmentId(null)
      setDraft(EMPTY_DRAFT)
    }
  }

  const renderForm = () => {
    if (mode !== 'create' && mode !== 'edit') return null
    const editing = mode === 'edit'
    return (
      <section className="card parent-detail-card" aria-labelledby="parent-assessment-form-heading">
        <h3 id="parent-assessment-form-heading" ref={formHeadingRef} tabIndex={-1}>
          {editing ? 'Edit Assessment' : 'Add Assessment'}
        </h3>
        <p className="parent-muted-copy">
          Assessment records are entered from official reports and stored only in this browser.
        </p>
        <AssessmentFormFields
          draft={draft}
          setDraft={setDraft}
          fieldErrorMap={fieldErrorMap}
          editing={editing}
          onCancel={cancelMutation}
          onSubmit={editing ? handleUpdate : handleCreate}
        />
      </section>
    )
  }

  const renderDelete = () => {
    if (mode !== 'delete' || !selectedAssessment) return null
    return (
      <section className="card parent-detail-card" aria-labelledby="parent-delete-heading">
        <h3 id="parent-delete-heading" ref={deleteHeadingRef} tabIndex={-1}>Delete Assessment?</h3>
        <p className="parent-muted-copy">
          This removes only this local assessment record. Child progress is not changed.
        </p>
        <div className="parent-summary-list">
          <div className="parent-summary-list-item">
            <span>{selectedAssessment.assessmentWindow}</span>
            <span>Grade {selectedAssessment.gradeBand}</span>
            <span>Scale score {selectedAssessment.scaleScore}</span>
            <span>{formatParentDate(selectedAssessment.testedOn)}</span>
          </div>
        </div>
        <div className="parent-card-actions">
          <ChildButton type="button" className="primary-action" onClick={handleDelete}>
            Delete Assessment
          </ChildButton>
          <ChildButton type="button" className="secondary-action" onClick={cancelMutation}>
            Keep Assessment
          </ChildButton>
        </div>
      </section>
    )
  }

  return (
    <section className="parent-dashboard-panel" aria-labelledby="parent-assessments-heading">
      <header className="parent-panel-header">
        <h2 id="parent-assessments-heading" ref={headingRef} tabIndex={-1}>Assessments</h2>
        <p>Official assessments are entered manually from official reports and stored only in this browser.</p>
      </header>

      <section className="card parent-detail-card">
        <div className="parent-card-heading-row">
          <h3>Official Assessments</h3>
          <span className="parent-muted-copy">{sortedAssessments.length} stored record{sortedAssessments.length === 1 ? '' : 's'}</span>
        </div>
        <p className="parent-muted-copy">
          Assessment entry and editing arrive in Phase 5B2.
        </p>
        <p>This area stays local to the device and never changes child progress.</p>
        <div className="parent-card-actions">
          <ChildButton type="button" className="primary-action" onClick={openCreateForm}>
            Add Assessment
          </ChildButton>
        </div>
      </section>

      <AssessmentStatusMessage message={message} fieldErrors={fieldErrors} summaryRef={summaryRef} />

      {renderForm()}
      {renderDelete()}

      {sortedAssessments.length === 0 ? (
        <ParentEmptyState
          title="No official assessment records have been entered yet."
          message="If a parent adds records later, they will appear here without changing child progress."
        />
      ) : (
        <section className="card" aria-label="Stored official assessments">
          <div className="parent-card-heading-row">
            <h3>Assessment history</h3>
            <span className="parent-muted-copy">{sortedAssessments.length}</span>
          </div>
          <div className="parent-card-grid">
            {sortedAssessments.map((record) => (
              <AssessmentRecordCard
                key={record.assessmentId}
                record={record}
                onEdit={() => openEditForm(record)}
                onDelete={() => openDeleteConfirm(record)}
              />
            ))}
          </div>
        </section>
      )}
    </section>
  )
}

function AssessmentStatusMessage({
  message,
  fieldErrors,
  summaryRef,
}: {
  message: string | null
  fieldErrors: AssessmentFormError[]
  summaryRef: RefObject<HTMLDivElement | null>
}) {
  if (!message && fieldErrors.length === 0) return null
  return (
    <div className="parent-status-message" ref={summaryRef} role={fieldErrors.length > 0 ? 'alert' : 'status'} tabIndex={-1}>
      {message && <p>{message}</p>}
      {fieldErrors.length > 0 && (
        <ul className="parent-validation-list">
          {fieldErrors.map((error) => (
            <li key={`${error.field}::${error.code}`}>{error.message}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

function AssessmentRecordCard({
  record,
  onEdit,
  onDelete,
}: {
  record: OfficialAssessmentRecord
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <article className="card parent-summary-card">
      <h4>{record.assessmentWindow} · Grade {record.gradeBand}</h4>
      <p className="parent-muted-copy">Tested on {formatParentDate(record.testedOn)}</p>
      <p>Scale score {record.scaleScore}</p>
      <p>Reported Level {record.reportedAchievementLevel ?? 'Not entered'}</p>
      <p>Reported Percentile {record.reportedPercentileRank ?? 'Not entered'}</p>
      <div className="parent-card-actions">
        <ChildButton type="button" className="secondary-action" onClick={onEdit}>
          Edit
        </ChildButton>
        <ChildButton type="button" className="secondary-action" onClick={onDelete}>
          Delete
        </ChildButton>
      </div>
    </article>
  )
}

function AssessmentFormFields({
  draft,
  setDraft,
  fieldErrorMap,
  editing,
  onCancel,
  onSubmit,
}: {
  draft: AssessmentFormValues
  setDraft: (draft: AssessmentFormValues) => void
  fieldErrorMap: Map<keyof AssessmentFormValues, string>
  editing: boolean
  onCancel: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  const windowError = fieldErrorMap.get('assessmentWindow')
  const gradeError = fieldErrorMap.get('gradeBand')
  const scoreError = fieldErrorMap.get('scaleScore')
  const testedOnError = fieldErrorMap.get('testedOn')
  const levelError = fieldErrorMap.get('reportedAchievementLevel')
  const percentileError = fieldErrorMap.get('reportedPercentileRank')
  return (
    <form className="parent-assessment-form" onSubmit={onSubmit}>
      <div className="parent-form-grid">
        <label className="parent-inline-field" htmlFor="assessment-window">
          <span>Assessment Window</span>
          <select
            id="assessment-window"
            value={draft.assessmentWindow}
            onChange={(event) => setDraft({ ...draft, assessmentWindow: event.target.value })}
            aria-invalid={windowError ? 'true' : undefined}
            aria-describedby={windowError ? 'assessment-window-error' : undefined}
          >
            <option value="">Choose a window</option>
            <option value="PM1">PM1</option>
            <option value="PM2">PM2</option>
            <option value="PM3">PM3</option>
          </select>
          <span className="parent-muted-copy">Progress Monitoring window reported on the official assessment.</span>
          {windowError && <span id="assessment-window-error" className="parent-field-error">{windowError}</span>}
        </label>

        <label className="parent-inline-field" htmlFor="assessment-grade">
          <span>Grade</span>
          <select
            id="assessment-grade"
            value={draft.gradeBand}
            onChange={(event) => setDraft({ ...draft, gradeBand: event.target.value })}
            aria-invalid={gradeError ? 'true' : undefined}
            aria-describedby={gradeError ? 'assessment-grade-error' : undefined}
          >
            <option value="">Choose a grade</option>
            <option value="2">Grade 2</option>
            <option value="3">Grade 3</option>
            <option value="4">Grade 4</option>
          </select>
          {gradeError && <span id="assessment-grade-error" className="parent-field-error">{gradeError}</span>}
        </label>

        <label className="parent-inline-field" htmlFor="assessment-score">
          <span>Scale Score</span>
          <input
            id="assessment-score"
            type="text"
            inputMode="numeric"
            min="0"
            max="999"
            value={draft.scaleScore}
            onChange={(event) => setDraft({ ...draft, scaleScore: event.target.value })}
            aria-invalid={scoreError ? 'true' : undefined}
            aria-describedby={scoreError ? 'assessment-score-error' : undefined}
          />
          <span className="parent-muted-copy">Enter the official scale score shown on the report.</span>
          {scoreError && <span id="assessment-score-error" className="parent-field-error">{scoreError}</span>}
        </label>

        <label className="parent-inline-field" htmlFor="assessment-tested-on">
          <span>Tested On</span>
          <input
            id="assessment-tested-on"
            type="date"
            value={draft.testedOn}
            onChange={(event) => setDraft({ ...draft, testedOn: event.target.value })}
            aria-invalid={testedOnError ? 'true' : undefined}
            aria-describedby={testedOnError ? 'assessment-tested-on-error' : undefined}
          />
          {testedOnError && <span id="assessment-tested-on-error" className="parent-field-error">{testedOnError}</span>}
        </label>

        <label className="parent-inline-field" htmlFor="assessment-level">
          <span>Reported Achievement Level</span>
          <select
            id="assessment-level"
            value={draft.reportedAchievementLevel}
            onChange={(event) => setDraft({ ...draft, reportedAchievementLevel: event.target.value })}
            aria-invalid={levelError ? 'true' : undefined}
            aria-describedby={levelError ? 'assessment-level-error' : undefined}
          >
            <option value="">Not entered</option>
            <option value="1">Level 1</option>
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
            <option value="4">Level 4</option>
            <option value="5">Level 5</option>
          </select>
          <span className="parent-muted-copy">Enter this only when it appears on the official report.</span>
          {levelError && <span id="assessment-level-error" className="parent-field-error">{levelError}</span>}
        </label>

        <label className="parent-inline-field" htmlFor="assessment-percentile">
          <span>Reported Percentile Rank</span>
          <input
            id="assessment-percentile"
            type="text"
            inputMode="numeric"
            value={draft.reportedPercentileRank}
            onChange={(event) => setDraft({ ...draft, reportedPercentileRank: event.target.value })}
            aria-invalid={percentileError ? 'true' : undefined}
            aria-describedby={percentileError ? 'assessment-percentile-error' : undefined}
          />
          <span className="parent-muted-copy">Enter this only when it appears on the official report.</span>
          {percentileError && <span id="assessment-percentile-error" className="parent-field-error">{percentileError}</span>}
        </label>
      </div>

      <div className="parent-card-actions">
        <ChildButton type="submit" className="primary-action">
          {editing ? 'Save Changes' : 'Save Assessment'}
        </ChildButton>
        <ChildButton type="button" className="secondary-action" onClick={onCancel}>
          Cancel
        </ChildButton>
      </div>
    </form>
  )
}

function fromRecord(record: OfficialAssessmentRecord): AssessmentFormValues {
  return {
    assessmentWindow: record.assessmentWindow,
    gradeBand: String(record.gradeBand),
    scaleScore: String(record.scaleScore),
    testedOn: record.testedOn,
    reportedAchievementLevel: record.reportedAchievementLevel == null ? '' : String(record.reportedAchievementLevel),
    reportedPercentileRank: record.reportedPercentileRank == null ? '' : String(record.reportedPercentileRank),
  }
}
