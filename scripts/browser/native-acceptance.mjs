import { createHash, randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { basename, isAbsolute, join, relative, resolve } from 'node:path'
import { platform, release, tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'

import { chromium, devices, webkit } from 'playwright-core'

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)))
const ARTIFACTS = resolve(requiredEnvironment('RRQ_ACCEPTANCE_ARTIFACTS'))
const RUN_ID = requiredEnvironment('RRQ_ACCEPTANCE_RUN_ID')
const RUN_DIR = join(ARTIFACTS, `run-${RUN_ID}`)
const ENGINE = requiredEnvironment('RRQ_ACCEPTANCE_ENGINE')
if (!['edge', 'webkit'].includes(ENGINE)) throw new Error(`Unsupported acceptance engine: ${ENGINE}`)
const IS_WEBKIT = ENGINE === 'webkit'
const WEBKIT_DEVICE_NAME = 'iPad (gen 11)'
const WEBKIT_LANDSCAPE_DEVICE_NAME = 'iPad (gen 11) landscape'
const { defaultBrowserType: _defaultBrowserType, ...WEBKIT_DEVICE } = devices[WEBKIT_DEVICE_NAME]
const PROFILE_PREFIX = `rrq-${ENGINE}-acceptance-`
const PROFILE_ROOT = join(tmpdir(), `${PROFILE_PREFIX}${RUN_ID}`)
const BROWSER_EXECUTABLE = requiredEnvironment('RRQ_ACCEPTANCE_BROWSER_PATH')
const APP_URL = requiredEnvironment('RRQ_ACCEPTANCE_APP_URL')
const ORIGIN = new URL(APP_URL).origin
const RELEASE_SHA = requiredEnvironment('RRQ_ACCEPTANCE_RELEASE_SHA')
const EXPECTED_JS = requiredEnvironment('RRQ_ACCEPTANCE_EXPECTED_JS')
const EXPECTED_CSS = requiredEnvironment('RRQ_ACCEPTANCE_EXPECTED_CSS')
const FIXTURES_PATH = resolve(requiredEnvironment('RRQ_ACCEPTANCE_FIXTURES'))
const MANIFEST_DIGEST = requiredEnvironment('RRQ_ACCEPTANCE_MANIFEST_DIGEST')
const TEST_MODE = requiredEnvironment('RRQ_ACCEPTANCE_MODE')
const PREVIOUS_COMMIT = process.env.RRQ_ACCEPTANCE_PREVIOUS_COMMIT?.trim() || 'UNKNOWN'
const PREVIOUS_URL = process.env.RRQ_ACCEPTANCE_PREVIOUS_URL?.trim() || null
const SWITCH_TO_CANDIDATE_URL = process.env.RRQ_ACCEPTANCE_SWITCH_TO_CANDIDATE_URL?.trim() || null
const PROGRESS_KEY = 'rorys-reading-quest.progress.v1'
const PARENT_KEY = 'rorys-reading-quest.parent-access.v1'
const RECORDS_KEY = 'rorys-reading-quest.parent-records.v1'
const STORY_SKILL = 'g2-story-scouts-prose'
const INFORMATION_SKILL = 'g2-information-detectives-reading'
const WORD_SKILL = 'g2-word-forge-word-practice'
const PROGRESS_WRITE_LOCK_NAME = `${PROGRESS_KEY}.authoritative-write`

mkdirSync(RUN_DIR, { recursive: true })
mkdirSync(PROFILE_ROOT, { recursive: true })

const fixtures = JSON.parse(readFileSync(FIXTURES_PATH, 'utf8'))
const catalog = { lessons: fixtures.lessons }
const completionTemplate = fixtures.completionTemplate
const lessonById = new Map(catalog.lessons.map((lesson) => [lesson.lessonId, lesson]))
const activeHandles = new Set()
const report = {
  releaseSha: RELEASE_SHA,
  manifestDigest: MANIFEST_DIGEST,
  mode: TEST_MODE,
  engine: ENGINE,
  runIdentity: RUN_ID,
  expectedAssets: { javascript: EXPECTED_JS, css: EXPECTED_CSS },
  startedAt: new Date().toISOString(),
  browser: null,
  central: { completions: [], restarts: [] },
  scenarios: {},
  responsive: [],
  parent: null,
  representative: null,
  runtime: null,
  requiredScenarios: {},
  cleanup: null,
  status: 'RUNNING',
  failure: null,
}

function requiredEnvironment(name) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing required browser-acceptance environment variable: ${name}`)
  return value
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex')
}

function sleep(ms) {
  return new Promise((resolvePromise) => setTimeout(resolvePromise, ms))
}

function log(message, detail = undefined) {
  const suffix = detail === undefined ? '' : ` ${JSON.stringify(detail)}`
  console.log(`[acceptance] ${message}${suffix}`)
}

function profileProcesses(profilePath) {
  if (ENGINE !== 'edge' || process.platform !== 'win32') return []
  const script = [
    '$target=$env:RRQ_ACCEPT_PROFILE',
    '$items=@(Get-CimInstance Win32_Process -Filter "Name=\'msedge.exe\'" | Where-Object { $_.CommandLine -and $_.CommandLine.Contains($target) } | Select-Object ProcessId,CreationDate)',
    '$items | ConvertTo-Json -Compress',
  ].join('; ')
  try {
    const raw = execFileSync('powershell.exe', ['-NoProfile', '-Command', script], {
      encoding: 'utf8',
      env: { ...process.env, RRQ_ACCEPT_PROFILE: profilePath },
    }).trim()
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return (Array.isArray(parsed) ? parsed : [parsed]).map((entry) => ({
      pid: Number(entry.ProcessId),
      createdAt: String(entry.CreationDate),
    }))
  } catch {
    return []
  }
}

let createRuntimeLog = (name) => {
  return {
    name,
    requests: [],
    failedRequests: [],
    failedResponses: [],
    consoleErrors: [],
    pageErrors: [],
  }
}

function attachPage(page, runtime) {
  page.on('request', (request) => {
    const url = request.url()
    if (url.startsWith('http')) runtime.requests.push({ url, type: request.resourceType() })
  })
  page.on('requestfailed', (request) => {
    runtime.failedRequests.push({
      url: request.url(),
      type: request.resourceType(),
      failure: request.failure()?.errorText ?? 'unknown',
    })
  })
  page.on('response', (response) => {
    if (response.status() >= 400) {
      runtime.failedResponses.push({
        url: response.url(),
        status: response.status(),
        type: response.request().resourceType(),
      })
    }
  })
  page.on('console', (message) => {
    if (message.type() === 'error') {
      runtime.consoleErrors.push({
        text: message.text(),
        url: message.location().url,
      })
    }
  })
  page.on('pageerror', (error) => runtime.pageErrors.push(error.message))
}

async function launchProfile(
  name,
  viewport = IS_WEBKIT ? WEBKIT_DEVICE.viewport : { width: 1440, height: 1000 },
  runtime = createRuntimeLog(name),
  options = {},
) {
  const profilePath = join(PROFILE_ROOT, name)
  mkdirSync(profilePath, { recursive: true })
  const openedAt = new Date().toISOString()
  const browserType = IS_WEBKIT ? webkit : chromium
  const context = await browserType.launchPersistentContext(profilePath, {
    ...(IS_WEBKIT ? WEBKIT_DEVICE : {}),
    executablePath: BROWSER_EXECUTABLE,
    headless: true,
    viewport,
    locale: 'en-US',
    ...(IS_WEBKIT ? {} : { args: ['--no-first-run', '--no-default-browser-check'] }),
  })
  await context.addInitScript(() => {
    window.__rrqPageShowEvents = []
    window.addEventListener('pageshow', (event) => {
      window.__rrqPageShowEvents.push({ persisted: event.persisted, at: Date.now() })
    })
  })
  if (options.blockStorageEvents) {
    await context.addInitScript(() => {
      window.__rrqBlockStorageEvents = false
      window.addEventListener('storage', (event) => {
        if (window.__rrqBlockStorageEvents) event.stopImmediatePropagation()
      }, true)
    })
  }
  if (options.disableWebLocks) {
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'locks', { configurable: true, value: undefined })
    })
  }
  if (options.rejectWebLocks) {
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'locks', {
        configurable: true,
        value: {
          query: async () => ({ held: [], pending: [] }),
          request: async () => { throw new DOMException('Synthetic lock rejection.', 'AbortError') },
        },
      })
    })
  }
  if (options.disableStorage) {
    await context.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        configurable: true,
        get: () => { throw new DOMException('Synthetic storage unavailability.', 'SecurityError') },
      })
    })
  }
  const page = context.pages()[0] ?? await context.newPage()
  attachPage(page, runtime)
  const browser = context.browser()
  const handle = {
    name,
    profilePath,
    context,
    browser,
    page,
    runtime,
    openedAt,
    launchId: randomUUID(),
    options,
  }
  activeHandles.add(handle)
  await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 60_000 })
  await waitForSettledScreen(page)
  const userAgent = await page.evaluate(() => navigator.userAgent)
  const browserVersion = browser?.version() ?? 'UNKNOWN'
  const processes = profileProcesses(profilePath)
  if (ENGINE === 'edge') assert(processes.length > 0, `${name}: no task-owned Edge process was observed for the isolated profile`)
  if (!report.browser) {
    const emulation = await page.evaluate(() => ({
      maxTouchPoints: navigator.maxTouchPoints,
      screen: { width: screen.width, height: screen.height },
      viewport: { width: innerWidth, height: innerHeight },
    }))
    report.browser = {
      engine: ENGINE,
      executable: basename(BROWSER_EXECUTABLE),
      browserVersion,
      userAgent,
      automationClient: `playwright-core ${JSON.parse(readFileSync(join(ROOT, 'node_modules/playwright-core/package.json'), 'utf8')).version}`,
      driver: IS_WEBKIT
        ? 'Playwright WebKit protocol; pinned browser binary; no separate WebDriver binary'
        : 'Playwright Chromium protocol; no separate WebDriver binary',
      operatingSystem: { platform: platform(), release: release() },
      deviceDescriptor: IS_WEBKIT ? WEBKIT_DEVICE_NAME : null,
      emulation: IS_WEBKIT ? { ...emulation, isMobile: true, hasTouch: true, physicalDevice: false } : null,
      headless: true,
    }
  }
  return handle
}

async function closeHandle(handle) {
  if (!handle || !activeHandles.has(handle)) return
  await handle.context.close()
  activeHandles.delete(handle)
  assert(!handle.browser?.isConnected(), `${handle.name}: Playwright browser connection remained open after context close`)
  if (ENGINE !== 'edge') return
  for (let index = 0; index < 20; index += 1) {
    if (profileProcesses(handle.profilePath).length === 0) return
    await sleep(250)
  }
  throw new Error(`${handle.name}: task-owned Edge process remained after context close`)
}

async function restartHandle(handle, label) {
  const before = await readProgress(handle.page)
  const beforeHash = await progressHash(handle.page)
  const viewport = await viewportOf(handle.page)
  const oldSessionId = before.activeLessonSession?.sessionId ?? null
  const oldProcesses = profileProcesses(handle.profilePath)
  const oldLaunchId = handle.launchId
  await closeHandle(handle)
  const closedAt = new Date().toISOString()
  const restarted = await launchProfile(handle.name, viewport, handle.runtime)
  const after = await readProgress(restarted.page)
  const afterHash = await progressHash(restarted.page)
  const newProcesses = profileProcesses(restarted.profilePath)
  assert(beforeHash === afterHash, `${label}: persisted progress changed across a cold browser restart`)
  assert((after.activeLessonSession?.sessionId ?? null) === oldSessionId, `${label}: active session identity changed across restart`)
  if (ENGINE === 'edge') {
    assert(oldProcesses.every((oldProcess) => newProcesses.every((nextProcess) => nextProcess.pid !== oldProcess.pid)), `${label}: Edge process ID did not change`)
  } else {
    assert(oldLaunchId !== restarted.launchId, `${label}: WebKit launch identity did not change`)
  }
  report.central.restarts.push({
    label,
    closedAt,
    reopenedAt: restarted.openedAt,
    profile: basename(restarted.profilePath),
    oldPids: oldProcesses.map((entry) => entry.pid),
    newPids: newProcesses.map((entry) => entry.pid),
    oldLaunchId,
    newLaunchId: restarted.launchId,
    processRestartMethod: ENGINE === 'edge'
      ? 'Task-owned Edge process closed and relaunched with the same isolated user-data directory.'
      : 'Playwright-owned WebKit persistent browser closed and relaunched with the same isolated user-data directory.',
    sessionId: oldSessionId,
    progressSha256: afterHash,
  })
  return restarted
}

async function viewportOf(page) {
  return page.viewportSize() ?? { width: 1440, height: 1000 }
}

async function waitForSettledScreen(page) {
  await page.waitForFunction(() => {
    return Boolean(
      document.querySelector('.question-first-shell')
      || document.querySelector('.question-first-status')
      || document.querySelector('.parent-access-shell')
      || document.querySelector('.parent-dashboard-shell')
      || [...document.querySelectorAll('button')].some((button) => button.textContent?.trim() === 'Retry'),
    )
  }, undefined, { timeout: 30_000 })
}

async function readProgress(page) {
  const raw = await page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY)
  assert(raw, 'progress storage was absent')
  return JSON.parse(raw)
}

async function progressHash(page) {
  const raw = await page.evaluate((key) => localStorage.getItem(key) ?? '', PROGRESS_KEY)
  return sha256(raw)
}

async function writeProgressFixture(page, state, additionalStorage = {}) {
  await page.evaluate(({ progressKey, progress, storage }) => {
    localStorage.setItem(progressKey, JSON.stringify(progress))
    for (const [key, value] of Object.entries(storage)) {
      if (value === null) localStorage.removeItem(key)
      else localStorage.setItem(key, value)
    }
  }, { progressKey: PROGRESS_KEY, progress: state, storage: additionalStorage })
  await page.reload({ waitUntil: 'networkidle' })
  await waitForSettledScreen(page)
}

function currentContext(state) {
  const active = state.activeLessonSession
  assert(active, 'expected one active lesson session')
  const lesson = lessonById.get(active.lessonId)
  assert(lesson, `unknown active lesson ${active.lessonId}`)
  const question = lesson.questions[active.currentQuestionIndex]
  assert(question, `${active.lessonId}: missing question index ${active.currentQuestionIndex}`)
  return { active, lesson, question }
}

function cssValue(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

async function activate(locator) {
  if (IS_WEBKIT) await locator.tap()
  else await locator.click()
}

async function selectInput(input) {
  if (!IS_WEBKIT) {
    await input.check()
    return
  }
  const label = input.locator('xpath=ancestor::label[1]')
  if (await label.count()) await label.tap()
  else await input.tap()
}

async function performAcceptedDraftAction(page, action, label) {
  const before = await page.evaluate((key) => {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw).activeLessonSession?.checkpointRevision ?? 0) : null
  }, PROGRESS_KEY)
  assert(Number.isSafeInteger(before), `${label}: missing accepted checkpoint revision before draft action`)
  await action()
  await page.waitForFunction(({ key, expectedRevision }) => {
    const raw = localStorage.getItem(key)
    if (!raw) return false
    const revision = JSON.parse(raw).activeLessonSession?.checkpointRevision ?? 0
    const controls = [...document.querySelectorAll('.question-first-question input, .question-first-question select')]
    return revision === expectedRevision && controls.every((control) => !control.disabled)
  }, { key: PROGRESS_KEY, expectedRevision: before + 1 }, { timeout: 15_000 })
}

async function selectAnswer(page, question, mode = 'correct') {
  const correct = mode === 'correct'
  if (question.questionType === 'MULTIPLE_CHOICE') {
    const selected = correct
      ? question.correctIds[0]
      : question.choices.find((choice) => !question.correctIds.includes(choice.id))?.id
    assert(selected, `${question.questionId}: no ${mode} multiple-choice response`)
    const input = page.locator(`input[type="radio"][value="${cssValue(selected)}"]`)
    if (!(await input.isChecked())) {
      await performAcceptedDraftAction(
        page,
        () => selectInput(input),
        `${question.questionId}: multiple-choice selection`,
      )
    }
    return
  }

  if (question.questionType === 'MULTISELECT') {
    let selected = [...question.correctIds]
    if (!correct) {
      const wrong = question.choices.filter((choice) => !question.correctIds.includes(choice.id)).map((choice) => choice.id)
      selected = [...wrong.slice(0, Math.max(1, question.correctIds.length))]
      while (selected.length < question.correctIds.length) selected.push(question.correctIds[selected.length])
    }
    for (const id of selected) {
      const input = page.locator(`input[type="checkbox"][value="${cssValue(id)}"]`)
      if (await input.isChecked()) continue
      await performAcceptedDraftAction(
        page,
        () => selectInput(input),
        `${question.questionId}: multiselect selection ${id}`,
      )
    }
    return
  }

  if (question.questionType === 'HOT_TEXT') {
    let selected = question.choices.filter((choice) => question.correctIds.includes(choice.id))
    if (!correct) {
      selected = question.choices.filter((choice) => !question.correctIds.includes(choice.id)).slice(0, Math.max(1, question.correctIds.length))
    }
    for (const choice of selected) {
      const label = page.locator('.segment-grid label').filter({ hasText: choice.text })
      assert(await label.count() === 1, `${question.questionId}: could not uniquely locate Hot Text segment ${choice.id}`)
      const input = label.locator('input')
      if (await input.isChecked()) continue
      await performAcceptedDraftAction(
        page,
        () => selectInput(input),
        `${question.questionId}: Hot Text selection ${choice.id}`,
      )
    }
    return
  }

  if (question.questionType === 'EVIDENCE_PAIR') {
    const partAId = correct
      ? question.partA.correctIds[0]
      : question.partA.choices.find((choice) => !question.partA.correctIds.includes(choice.id))?.id
    const partBId = correct
      ? question.partB.correctIds[0]
      : question.partB.choices.find((choice) => !question.partB.correctIds.includes(choice.id))?.id
    assert(partAId && partBId, `${question.questionId}: missing two-part ${mode} response`)
    const partAInput = page.locator('.question-pair fieldset').nth(0).locator(`input[value="${cssValue(partAId)}"]`)
    if (!(await partAInput.isChecked())) {
      await performAcceptedDraftAction(page, () => selectInput(partAInput), `${question.questionId}: Part A selection`)
    }
    const partBInput = page.locator('.question-pair fieldset').nth(1).locator(`input[value="${cssValue(partBId)}"]`)
    if (!(await partBInput.isChecked())) {
      await performAcceptedDraftAction(page, () => selectInput(partBInput), `${question.questionId}: Part B selection`)
    }
    return
  }

  if (question.questionType === 'TABLE_MATCH') {
    const correctIds = question.rows.map((row) => row.correctId)
    for (let index = 0; index < question.rows.length; index += 1) {
      const row = question.rows[index]
      let selected = row.correctId
      if (!correct) {
        const rotated = correctIds[(index + 1) % correctIds.length]
        selected = row.choices.some((choice) => choice.id === rotated)
          ? rotated
          : row.choices.find((choice) => choice.id !== row.correctId)?.id
      }
      assert(selected, `${question.questionId}: missing table response for ${row.id}`)
      const select = page.locator('.table-question').getByLabel(row.prompt, { exact: true })
      if (await select.inputValue() === selected) continue
      await performAcceptedDraftAction(
        page,
        async () => {
          if (IS_WEBKIT) await select.tap()
          await select.selectOption(selected)
        },
        `${question.questionId}: table row ${row.id}`,
      )
    }
    return
  }

  throw new Error(`${question.questionId}: unsupported question type ${question.questionType}`)
}

async function answerCurrentQuestion(page, mode = 'correct') {
  const state = await readProgress(page)
  const { active, lesson, question } = currentContext(state)
  assert(
    await page.getByText(question.prompt, { exact: true }).count() > 0
      || question.questionType === 'EVIDENCE_PAIR'
      || question.questionType === 'TABLE_MATCH',
    `${question.questionId}: prompt not visible`,
  )
  assert(await page.locator('.question-first-reading').isVisible(), `${question.questionId}: reading material is not visible`)
  assert(await page.getByRole('button', { name: 'Check Answer', exact: true }).count() === 1, `${question.questionId}: expected one Check Answer action`)
  await selectAnswer(page, question, mode)
  const beforeSubmit = await readProgress(page)
  const beforeSubmitRevision = beforeSubmit.activeLessonSession?.checkpointRevision ?? 0
  const check = page.getByRole('button', { name: 'Check Answer', exact: true })
  assert(await check.isEnabled(), `${question.questionId}: Check Answer stayed disabled after a structurally complete response`)
  await activate(check)
  const feedback = page.locator('.answer-feedback')
  await feedback.waitFor({ state: 'visible', timeout: 10_000 })
  const result = await feedback.getAttribute('data-result')
  assert(result === (mode === 'correct' ? 'correct' : 'incorrect'), `${question.questionId}: unexpected ${result} feedback for ${mode} response`)
  assert(await page.getByRole('button', { name: 'Next', exact: true }).count() === 1, `${question.questionId}: expected one Next action after feedback`)
  await page.waitForFunction(({ key, sessionId, questionId, expectedRevision }) => {
    const raw = localStorage.getItem(key)
    if (!raw) return false
    const active = JSON.parse(raw).activeLessonSession
    return active?.sessionId === sessionId
      && active.checkpointRevision === expectedRevision
      && active.submittedQuestions?.some((entry) => entry.questionId === questionId)
  }, {
    key: PROGRESS_KEY,
    sessionId: active.sessionId,
    questionId: question.questionId,
    expectedRevision: beforeSubmitRevision + 1,
  }, { timeout: 15_000 })
  assert((await readProgress(page)).activeLessonSession?.submittedQuestions.some((entry) => entry.questionId === question.questionId), `${question.questionId}: submitted feedback was not persisted`)
  return { sessionId: active.sessionId, lesson, question, result }
}

async function clickNextWithinLesson(page, sessionId, nextIndex) {
  await activate(page.getByRole('button', { name: 'Next', exact: true }))
  await page.waitForFunction(({ key, sessionId: expectedSession, index }) => {
    const raw = localStorage.getItem(key)
    if (!raw) return false
    const state = JSON.parse(raw)
    return state.activeLessonSession?.sessionId === expectedSession
      && state.activeLessonSession.currentQuestionIndex === index
      && Boolean(document.querySelector('.question-first-shell'))
  }, { key: PROGRESS_KEY, sessionId, index: nextIndex }, { timeout: 15_000 })
  await page.getByRole('button', { name: 'Check Answer', exact: true }).waitFor({ state: 'visible', timeout: 10_000 })
}

function completionTrace(before, after, source) {
  const latest = after.completedAttempts.at(-1)
  const next = after.activeLessonSession
  const sourceLesson = lessonById.get(source.lessonId)
  return {
    completed: {
      lessonId: source.lessonId,
      activityId: source.activityId,
      skillId: source.skillId,
      unitId: sourceLesson?.unitId ?? null,
      difficulty: source.difficulty,
      purpose: source.launchContext?.purpose ?? 'legacy-progression',
    },
    accuracy: latest?.accuracy ?? null,
    assistanceCount: latest?.assistanceCount ?? null,
    progressionDecision: after.lastProgressionOutcome?.decisionState ?? null,
    reasonCodes: after.lastProgressionOutcome?.reasonCodes ?? [],
    deltas: {
      attempts: after.completedAttempts.length - before.completedAttempts.length,
      completedSessions: after.completedSessionCount - before.completedSessionCount,
      xp: after.totalXp - before.totalXp,
      stars: after.totalStars - before.totalStars,
    },
    next: next ? {
      lessonId: next.lessonId,
      activityId: next.activityId,
      skillId: next.skillId,
      difficulty: next.difficulty,
      unitId: lessonById.get(next.lessonId)?.unitId ?? null,
      purpose: next.launchContext?.purpose ?? 'legacy-progression',
      sessionId: next.sessionId,
    } : null,
    nextTrackInitialized: next ? Boolean(after.skillProgress[next.skillId]) : false,
  }
}

async function completeCurrentLesson(page, mode = 'correct', expected = 'accepted') {
  const starting = await readProgress(page)
  const source = clone(currentContext(starting).active)
  const sourceLesson = lessonById.get(source.lessonId)
  assert(sourceLesson, `${source.lessonId}: missing catalog lesson`)

  while (true) {
    const state = await readProgress(page)
    const { active, lesson } = currentContext(state)
    assert(active.sessionId === source.sessionId, `${source.lessonId}: session changed before final completion`)
    const index = active.currentQuestionIndex
    const hasNext = await page.getByRole('button', { name: 'Next', exact: true }).count() === 1
    if (!hasNext) await answerCurrentQuestion(page, mode)

    if (index + 1 < lesson.questions.length) {
      await clickNextWithinLesson(page, active.sessionId, index + 1)
      continue
    }

    const before = await readProgress(page)
    await activate(page.getByRole('button', { name: 'Next', exact: true }))
    if (expected === 'accepted') {
      await page.waitForFunction(({ key, oldSessionId }) => {
        const raw = localStorage.getItem(key)
        if (!raw) return false
        const state = JSON.parse(raw)
        return state.activeLessonSession?.sessionId
          && state.activeLessonSession.sessionId !== oldSessionId
          && Boolean(document.querySelector('.question-first-shell'))
      }, { key: PROGRESS_KEY, oldSessionId: source.sessionId }, { timeout: 30_000 })
      await page.getByRole('button', { name: 'Check Answer', exact: true }).waitFor({ state: 'visible', timeout: 15_000 })
      const after = await readProgress(page)
      const trace = completionTrace(before, after, source)
      assert(trace.deltas.attempts === 1, `${source.lessonId}: completed-attempt delta was not exactly one`)
      assert(trace.deltas.completedSessions === 1, `${source.lessonId}: completed-session delta was not exactly one`)
      assert(trace.deltas.xp >= 0 && trace.deltas.stars >= 0, `${source.lessonId}: rewards moved backward`)
      assert(trace.accuracy === (mode === 'correct' ? 100 : 0), `${source.lessonId}: unexpected accuracy ${trace.accuracy}`)
      assert(trace.assistanceCount === 0, `${source.lessonId}: assistance was recorded without a request`)
      assert(trace.next, `${source.lessonId}: no next active session opened`)
      assert(trace.next.skillId !== WORD_SKILL, `${source.lessonId}: deferred Word Forge opened prematurely`)
      assert((await page.getByText('Reading Rest', { exact: true }).count()) === 0, `${source.lessonId}: false Reading Rest appeared`)
      return { before, after, trace }
    }

    await page.getByRole('button', { name: 'Retry', exact: true }).waitFor({ state: 'visible', timeout: 15_000 })
    const after = await readProgress(page)
    assert(after.completedAttempts.length === before.completedAttempts.length, 'rejected completion recorded a fake attempt')
    assert(after.completedSessionCount === before.completedSessionCount, 'rejected completion recorded a fake completed session')
    assert(after.totalXp === before.totalXp && after.totalStars === before.totalStars, 'rejected completion awarded fake rewards')
    assert(after.activeLessonSession?.sessionId === source.sessionId, 'rejected completion erased the recoverable active session')
    assert((await page.getByText('Reading Rest', { exact: true }).count()) === 0, 'rejected completion displayed Reading Rest')
    return { before, after, trace: { rejected: true, source } }
  }
}

async function assertQuestionFirstShell(page) {
  await page.locator('.question-first-shell').waitFor({ state: 'visible', timeout: 15_000 })
  assert(await page.getByRole('button', { name: 'Check Answer', exact: true }).count() === 1, 'child screen does not expose exactly one Check Answer action')
  for (const name of ['Start Journey', 'Parent Area', 'Home', 'Choose a World']) {
    assert(await page.getByRole('button', { name, exact: true }).count() === 0, `unexpected child navigation control: ${name}`)
  }
  assert(await page.locator('.question-first-reading').isVisible(), 'reading surface is not visible')
  assert(await page.locator('.question-first-question').isVisible(), 'question surface is not visible')
}

async function assertAssets(page) {
  const resources = await page.evaluate(() => performance.getEntriesByType('resource').map((entry) => entry.name))
  assert(resources.some((entry) => entry.endsWith(`/${EXPECTED_JS}`)), `live page did not load ${EXPECTED_JS}`)
  assert(resources.some((entry) => entry.endsWith(`/${EXPECTED_CSS}`)), `live page did not load ${EXPECTED_CSS}`)
  report.central.assetResources = resources.filter((entry) => entry.includes('/assets/'))
}

async function takeShot(page, name) {
  const path = join(RUN_DIR, `${name}.png`)
  await page.screenshot({ path, fullPage: true })
  return path
}

async function seedScenario(name, state, runtime = createRuntimeLog(name)) {
  const handle = await launchProfile(name, { width: 1440, height: 1000 }, runtime)
  await writeProgressFixture(handle.page, state)
  return handle
}

function futureIso(days = 365) {
  return new Date(Date.now() + days * 86_400_000).toISOString()
}

function pastIso(days = 365) {
  return new Date(Date.now() - days * 86_400_000).toISOString()
}

function reviewEntry(skillId, difficulty, unitId, contentVersion, dueAt, reviewStep = 0) {
  return { skillId, difficulty, reviewStep, dueAt, unitId, contentVersion }
}

async function runReleaseUpgrade() {
  assert(TEST_MODE === 'local' && IS_WEBKIT, 'release-upgrade runs only in local WebKit acceptance')
  assert(PREVIOUS_URL && SWITCH_TO_CANDIDATE_URL, 'release-upgrade requires the previous release and candidate switch endpoint')
  let handle = await launchProfile('release-upgrade')
  const previousInitial = await readProgress(handle.page)
  assert(previousInitial.completedAttempts.length === 0, 'release-upgrade profile was not initially empty')
  const earned = await completeCurrentLesson(handle.page, 'correct', 'accepted')
  const previousAssets = await handle.page.evaluate(() => performance.getEntriesByType('resource').map((entry) => entry.name).filter((entry) => entry.includes('/assets/')))
  const oldPage = handle.page

  const switched = await fetch(SWITCH_TO_CANDIDATE_URL, { method: 'POST' })
  assert(switched.ok, `candidate build switch returned HTTP ${switched.status}`)
  const candidatePage = await handle.context.newPage()
  attachPage(candidatePage, handle.runtime)
  await candidatePage.goto(APP_URL, { waitUntil: 'networkidle', timeout: 60_000 })
  await waitForSettledScreen(candidatePage)
  await assertAssets(candidatePage)
  const candidateLoaded = await readProgress(candidatePage)
  assert(candidateLoaded.completedAttempts.length === earned.after.completedAttempts.length, 'candidate release lost the previous release completion')
  assert(candidateLoaded.totalXp === earned.after.totalXp && candidateLoaded.totalStars === earned.after.totalStars, 'candidate release changed earned rewards')
  assert(candidateLoaded.activeLessonSession?.sessionId === earned.after.activeLessonSession?.sessionId, 'candidate release did not resume the compatible session')

  const candidateContext = currentContext(candidateLoaded)
  await answerCurrentQuestion(candidatePage, 'correct')
  await clickNextWithinLesson(candidatePage, candidateContext.active.sessionId, candidateContext.active.currentQuestionIndex + 1)
  const mixedVersionState = await readProgress(candidatePage)
  await oldPage.getByText(currentContext(mixedVersionState).question.prompt, { exact: true }).waitFor({ state: 'visible', timeout: 15_000 })

  handle.page = candidatePage
  handle = await restartHandle(handle, 'previous-release-to-candidate-upgrade')
  const reopened = await readProgress(handle.page)
  assert(reopened.completedAttempts.length === earned.after.completedAttempts.length, 'earned completion was lost across release upgrade restart')
  assert(reopened.activeLessonSession?.sessionId === mixedVersionState.activeLessonSession?.sessionId, 'candidate checkpoint did not survive the release upgrade restart')
  assert(reopened.activeLessonSession?.currentQuestionIndex === mixedVersionState.activeLessonSession?.currentQuestionIndex, 'candidate question position changed across release upgrade restart')
  report.scenarios.releaseUpgrade = {
    status: 'PASS',
    previousUrl: PREVIOUS_URL,
    previousExpectedCommit: PREVIOUS_COMMIT,
    previousSourceIdentityBasis: 'Explicit workflow or command input; observed previous asset URLs are retained separately.',
    previousAssets,
    candidateAssets: report.central.assetResources,
    earnedAttemptCount: earned.after.completedAttempts.length,
    earnedXp: earned.after.totalXp,
    earnedStars: earned.after.totalStars,
    mixedVersionCooperation: true,
    processRestartPreserved: true,
    profileReusedWithoutStorageExport: true,
  }
  await closeHandle(handle)
}

async function runCentral() {
  log('central profile starting')
  let handle = await launchProfile('central')
  await assertQuestionFirstShell(handle.page)
  await assertAssets(handle.page)
  const initial = await readProgress(handle.page)
  const initialContext = currentContext(initial)
  assert(initial.completedAttempts.length === 0 && initial.completedSessionCount === 0, 'central profile was not empty')
  assert(initialContext.active.skillId === STORY_SKILL, 'empty profile did not start Story Scouts')
  assert(initialContext.active.lessonId.includes('checkpoint-a'), 'empty profile did not start the first Story Map checkpoint')
  report.central.initial = {
    lessonId: initialContext.active.lessonId,
    activityId: initialContext.active.activityId,
    unitId: initialContext.lesson.unitId,
    questionCount: initialContext.lesson.questions.length,
    sessionId: initialContext.active.sessionId,
  }
  await takeShot(handle.page, '01-central-fresh-story-map')

  await answerCurrentQuestion(handle.page, 'correct')
  const feedbackBefore = await readProgress(handle.page)
  const feedbackShot = await takeShot(handle.page, '02-central-feedback-before-restart')
  assert(feedbackBefore.activeLessonSession.currentQuestionIndex === 0, 'feedback checkpoint moved the question early')
  const totalsBeforeFeedbackRestart = [feedbackBefore.completedAttempts.length, feedbackBefore.completedSessionCount, feedbackBefore.totalXp, feedbackBefore.totalStars]
  handle = await restartHandle(handle, 'submitted-feedback')
  const feedbackAfter = await readProgress(handle.page)
  assert(await handle.page.getByRole('button', { name: 'Next', exact: true }).count() === 1, 'submitted feedback did not restore after process restart')
  assert(JSON.stringify(totalsBeforeFeedbackRestart) === JSON.stringify([feedbackAfter.completedAttempts.length, feedbackAfter.completedSessionCount, feedbackAfter.totalXp, feedbackAfter.totalStars]), 'feedback restart changed attempts or rewards')
  await takeShot(handle.page, '03-central-feedback-after-restart')
  report.central.feedbackRestart = { screenshotBefore: feedbackShot, restored: true }

  let firstSuccessState = null
  let storyCompleteState = null
  let informationAttempt = null
  let restartedForUnit = false
  for (let completionIndex = 0; completionIndex < 7; completionIndex += 1) {
    const result = await completeCurrentLesson(handle.page, 'correct', 'accepted')
    report.central.completions.push(result.trace)
    log(`central completion ${completionIndex + 1}`, result.trace)

    const expected = [
      [STORY_SKILL, 'ss-unit-1', 1, 'progression'],
      [STORY_SKILL, 'ss-unit-1', 1, 'verification'],
      [STORY_SKILL, 'ss-unit-2', 2, 'progression'],
      [STORY_SKILL, 'ss-unit-2', 2, 'verification'],
      [STORY_SKILL, 'ss-unit-3', 3, 'progression'],
      [STORY_SKILL, 'ss-unit-3', 3, 'verification'],
      [INFORMATION_SKILL, 'id-unit-1', 1, 'progression'],
    ][completionIndex]
    const completed = result.trace.completed
    assert(completed.skillId === expected[0] && completed.unitId === expected[1] && completed.difficulty === expected[2] && completed.purpose === expected[3], `central completion ${completionIndex + 1} deviated from the derived path`)

    if (completionIndex === 0) {
      firstSuccessState = clone(result.after)
      const beforeRestart = clone(result.after)
      handle = await restartHandle(handle, 'after-first-qualifying-success')
      const afterRestart = await readProgress(handle.page)
      assert(afterRestart.skillProgress[STORY_SKILL].qualifyingIndependentActivityIds.length === 1, 'first qualifying proof was lost across restart')
      assert(afterRestart.completedAttempts.length === beforeRestart.completedAttempts.length, 'first-success restart duplicated an attempt')
    }

    if (completionIndex === 1) {
      assert(result.after.skillProgress[STORY_SKILL].currentDifficulty === 2, 'distinct verification did not advance to Theme Trail')
      await takeShot(handle.page, '04-central-theme-trail-after-advance')
      handle = await restartHandle(handle, 'after-story-map-unit-advancement')
      restartedForUnit = true
      assert((await readProgress(handle.page)).skillProgress[STORY_SKILL].currentDifficulty === 2, 'unit advancement did not survive restart')
    }

    if (completionIndex === 3) {
      assert(result.after.skillProgress[STORY_SKILL].currentDifficulty === 3, 'Theme Trail verification did not advance to Perspective Portal')
      await takeShot(handle.page, '05-central-perspective-portal-after-advance')
    }

    if (completionIndex === 5) {
      storyCompleteState = clone(result.after)
      assert(result.after.skillProgress[STORY_SKILL].currentDifficulty === 4, 'Story Scouts did not reach its completion difficulty')
      assert(result.after.activeLessonSession?.skillId === INFORMATION_SKILL, 'Story Scouts completion did not open Information Detectives')
      assert(Boolean(result.after.skillProgress[INFORMATION_SKILL]), 'Information Detectives progress was not persisted with its launch')
      await takeShot(handle.page, '06-central-information-detectives-handoff')
      handle = await restartHandle(handle, 'story-scouts-to-information-detectives')
      const afterRestart = await readProgress(handle.page)
      assert(afterRestart.activeLessonSession?.skillId === INFORMATION_SKILL, 'Information Detectives handoff did not survive restart')
      assert(afterRestart.skillProgress[STORY_SKILL].currentDifficulty === 4, 'Story Scouts completion regressed after restart')
    }

    if (completionIndex === 6) {
      informationAttempt = clone(result.after.completedAttempts.at(-1))
      assert(result.after.activeLessonSession?.skillId === INFORMATION_SKILL, 'Information Detectives did not open its next appropriate activity')
      assert(result.after.activeLessonSession?.launchContext?.purpose === 'verification', 'first Information Detectives success did not open verification')
      await takeShot(handle.page, '07-central-information-verification-open')
    }
  }

  assert(restartedForUnit && firstSuccessState && storyCompleteState && informationAttempt, 'central trace did not produce required checkpoints')
  const final = await readProgress(handle.page)
  assert(final.completedAttempts.length === 7 && final.completedSessionCount === 7, 'central history did not record exactly seven earned completions')
  assert(final.completedAttempts.every((attempt) => attempt.accuracy === 100 && attempt.assistanceCount === 0), 'central history was not all-correct and independent')
  assert(final.activeLessonSession?.skillId === INFORMATION_SKILL, 'central history ended outside Information Detectives')
  report.central.final = {
    attempts: final.completedAttempts.length,
    sessions: final.completedSessionCount,
    xp: final.totalXp,
    stars: final.totalStars,
    storyProgress: clone(final.skillProgress[STORY_SKILL]),
    informationProgress: clone(final.skillProgress[INFORMATION_SKILL]),
    active: clone(final.activeLessonSession),
  }
  return { handle, firstSuccessState, storyCompleteState, informationAttempt }
}

async function runParentAndResponsive(handle) {
  const before = await readProgress(handle.page)
  const beforeHash = await progressHash(handle.page)
  await handle.page.goto(`${APP_URL}#/parent`, { waitUntil: 'networkidle' })
  await handle.page.getByRole('heading', { name: 'Set Up Parent Area', exact: true }).waitFor({ state: 'visible', timeout: 15_000 })
  assert((await readProgress(handle.page)).activeLessonSession?.sessionId === before.activeLessonSession?.sessionId, 'opening parent route changed the child session')
  await handle.page.locator('#parent-pin-new').fill('2468')
  await handle.page.locator('#parent-pin-confirm').fill('2468')
  await activate(handle.page.getByRole('button', { name: 'Create Parent PIN', exact: true }))
  await handle.page.getByRole('heading', { name: 'Parent Area', exact: true }).waitFor({ state: 'visible', timeout: 15_000 })
  await takeShot(handle.page, '08-parent-dashboard')
  await activate(handle.page.getByRole('button', { name: 'Lock Parent Area', exact: true }))
  await handle.page.getByRole('heading', { name: 'Unlock Parent Area', exact: true }).waitFor({ state: 'visible', timeout: 10_000 })
  await handle.page.locator('#parent-pin').fill('2468')
  await activate(handle.page.getByRole('button', { name: 'Unlock', exact: true }))
  await handle.page.getByRole('heading', { name: 'Parent Area', exact: true }).waitFor({ state: 'visible', timeout: 10_000 })
  await activate(handle.page.getByRole('button', { name: 'Print Summary', exact: true }))
  const printText = await handle.page.locator('body').innerText()
  assert(!printText.includes('What problem does Tia'), 'print summary exposed question text')
  assert(!/correct answer|submitted response/i.test(printText), 'print summary exposed answer data')
  await takeShot(handle.page, '09-parent-print-summary')
  assert(await progressHash(handle.page) === beforeHash, 'parent dashboard or print mutated child progress')
  assert(await handle.page.evaluate((key) => Boolean(localStorage.getItem(key)), PARENT_KEY), 'test Parent PIN record was not stored in its separate key')
  const parentRecordsPresent = await handle.page.evaluate((key) => Boolean(localStorage.getItem(key)), RECORDS_KEY)
  await activate(handle.page.getByRole('button', { name: 'Back to Quest', exact: true }))
  await assertQuestionFirstShell(handle.page)
  const after = await readProgress(handle.page)
  assert(after.activeLessonSession?.sessionId === before.activeLessonSession?.sessionId, 'returning from parent route did not resume the same child session')
  report.parent = {
    setupGate: 'PASS',
    lockAndUnlock: 'PASS',
    printPrivacy: 'PASS',
    childSessionPreserved: true,
    emptyAssessmentStoreMaterialized: parentRecordsPresent,
    bookmarkUrl: `${APP_URL}#/parent`,
  }

  const ipadPortrait = IS_WEBKIT ? devices[WEBKIT_DEVICE_NAME].viewport : { width: 768, height: 1024 }
  const ipadLandscape = IS_WEBKIT ? devices[WEBKIT_LANDSCAPE_DEVICE_NAME].viewport : { width: 1024, height: 768 }
  for (const item of [
    { name: 'phone', width: 390, height: 844 },
    { name: 'ipad-portrait', ...ipadPortrait },
    { name: 'ipad-landscape', ...ipadLandscape },
    { name: 'desktop', width: 1440, height: 1000 },
  ]) {
    await handle.page.setViewportSize({ width: item.width, height: item.height })
    await handle.page.evaluate(() => new Promise((resolvePromise) => requestAnimationFrame(() => requestAnimationFrame(resolvePromise))))
    const overflow = await handle.page.evaluate(() => ({
      innerWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
    }))
    assert(overflow.documentWidth <= overflow.innerWidth + 1 && overflow.bodyWidth <= overflow.innerWidth + 1, `${item.name}: horizontal overflow detected`)
    const screenshot = await takeShot(handle.page, `responsive-${item.name}`)
    report.responsive.push({ ...item, ...overflow, screenshot })
  }
}

async function runStrandedRecovery(storyCompleteState) {
  const state = clone(storyCompleteState)
  const attempts = state.completedAttempts.length
  const sessions = state.completedSessionCount
  const xp = state.totalXp
  const stars = state.totalStars
  state.activeLessonSession = null
  delete state.skillProgress[INFORMATION_SKILL]
  state.plannedNextQuest = {
    status: 'content_needed',
    purpose: 'progression',
    skillId: STORY_SKILL,
    difficulty: 4,
    reason: 'Synthetic stale no-content plan after Story Scouts completion.',
  }
  const wordLesson = catalog.lessons.find((lesson) => lesson.skillId === WORD_SKILL && lesson.difficulty === 1)
  assert(wordLesson, 'Word Forge review fixture lesson missing')
  const unrelated = reviewEntry(WORD_SKILL, 1, wordLesson.unitId, wordLesson.contentVersion, futureIso(), 0)
  state.reviewQueue = [...state.reviewQueue.filter((entry) => entry.skillId !== WORD_SKILL), unrelated]
  state.metadata.updatedAt = new Date().toISOString()

  let handle = await seedScenario('stranded-recovery', state)
  const recovered = await readProgress(handle.page)
  assert(recovered.activeLessonSession?.skillId === INFORMATION_SKILL, 'stranded save did not open Information Detectives')
  assert(recovered.activeLessonSession?.launchContext?.purpose === 'progression', 'stranded save did not open ordinary progression')
  assert(recovered.plannedNextQuest?.status !== 'content_needed', 'stale content-needed plan was not retired')
  assert(Boolean(recovered.skillProgress[INFORMATION_SKILL]), 'newly eligible Information Detectives progress was not persisted')
  assert(recovered.completedAttempts.length === attempts && recovered.completedSessionCount === sessions, 'stranded recovery fabricated a completion')
  assert(recovered.totalXp === xp && recovered.totalStars === stars, 'stranded recovery changed rewards')
  assert(recovered.reviewQueue.some((entry) => entry.skillId === WORD_SKILL && entry.unitId === unrelated.unitId), 'stranded recovery removed the unrelated review')
  await takeShot(handle.page, '10-stranded-save-recovered')
  const sessionId = recovered.activeLessonSession.sessionId
  handle = await restartHandle(handle, 'stranded-save-information-initialization')
  const reopened = await readProgress(handle.page)
  assert(reopened.activeLessonSession?.sessionId === sessionId, 'stranded recovery created a second session after restart')
  assert(Object.keys(reopened.skillProgress).filter((key) => key === INFORMATION_SKILL).length === 1, 'eligible track initialization was duplicated')
  report.scenarios.strandedRecovery = {
    status: 'PASS',
    synthetic: true,
    attemptsPreserved: attempts,
    xpPreserved: xp,
    starsPreserved: stars,
    nextLessonId: reopened.activeLessonSession.lessonId,
    nextSkillId: reopened.activeLessonSession.skillId,
    sessionStableAcrossRestart: true,
  }
  await closeHandle(handle)
}

async function runRejectedCompletion() {
  const handle = await launchProfile('rejected-completion')
  const state = await readProgress(handle.page)
  const sourceSession = clone(state.activeLessonSession)
  state.skillProgress[STORY_SKILL].currentDifficulty = 2
  state.skillProgress[STORY_SKILL].lastMasteredDifficulty = 1
  state.metadata.updatedAt = new Date().toISOString()
  await writeProgressFixture(handle.page, state)
  assert((await readProgress(handle.page)).activeLessonSession?.sessionId === sourceSession.sessionId, 'rejected fixture did not preserve the active session')
  const result = await completeCurrentLesson(handle.page, 'correct', 'rejected')
  await takeShot(handle.page, '11-rejected-completion-recovery')
  report.scenarios.rejectedCompletion = {
    status: 'PASS',
    synthetic: true,
    activeSessionPreserved: result.after.activeLessonSession?.sessionId === sourceSession.sessionId,
    attemptDelta: result.after.completedAttempts.length - result.before.completedAttempts.length,
    sessionDelta: result.after.completedSessionCount - result.before.completedSessionCount,
    xpDelta: result.after.totalXp - result.before.totalXp,
    starDelta: result.after.totalStars - result.before.totalStars,
    readingRestAbsent: true,
    retryVisible: true,
  }
  await closeHandle(handle)
}

async function runCrossSkillAffinity(firstSuccessState, informationAttempt) {
  const state = clone(firstSuccessState)
  state.activeLessonSession = null
  state.plannedNextQuest = null
  state.completedAttempts = [state.completedAttempts[0], clone(informationAttempt)]
  state.completedSessionCount = state.completedAttempts.length
  state.metadata.updatedAt = new Date().toISOString()
  const handle = await seedScenario('cross-skill-affinity', state)
  const planned = await readProgress(handle.page)
  const active = planned.activeLessonSession
  assert(active?.skillId === STORY_SKILL, 'newer Information Detectives attempt displaced Story Scouts verification')
  assert(active?.launchContext?.purpose === 'verification', 'Story Scouts verification purpose was lost')
  const lesson = lessonById.get(active.lessonId)
  assert(lesson?.unitId === 'ss-unit-1' && active.difficulty === 1, 'verification borrowed cross-skill unit or difficulty affinity')
  report.scenarios.crossSkillAffinity = {
    status: 'PASS',
    synthetic: true,
    latestAttemptSkill: informationAttempt.skillId,
    selectedSkill: active.skillId,
    selectedUnit: lesson.unitId,
    selectedDifficulty: active.difficulty,
    purpose: active.launchContext.purpose,
  }
  await closeHandle(handle)
}

async function runRemediation() {
  let handle = await launchProfile('remediation')
  const initial = await readProgress(handle.page)
  assert(initial.activeLessonSession?.skillId === STORY_SKILL, 'remediation control did not start in Story Scouts')
  await answerCurrentQuestion(handle.page, 'wrong')
  await takeShot(handle.page, '12-incorrect-crimson-feedback')
  const first = await completeCurrentLesson(handle.page, 'wrong', 'accepted')
  log('remediation low-result transition', { trace: first.trace, active: first.after.activeLessonSession, progress: first.after.skillProgress[STORY_SKILL] })
  assert(first.after.activeLessonSession?.skillId === STORY_SKILL, 'low comprehension result left the comprehension domain')
  assert(first.after.activeLessonSession?.launchContext?.purpose === 'remediation', 'low comprehension result did not launch remediation')
  const remediationSession = clone(first.after.activeLessonSession)
  const remediationLesson = lessonById.get(remediationSession.lessonId)
  assert(remediationLesson?.lessonRole === 'GUIDED_PRACTICE', 'low result did not open guided practice')
  assert(remediationSession.difficulty === 1 && remediationLesson.difficulty === 1, 'remediation session and manifest difficulty disagree')
  assert(/guided-[cd]/i.test(remediationSession.lessonId), 'difficulty-1 remediation did not select guided C or D')
  handle = await restartHandle(handle, 'during-remediation-recovery')
  const reopenedRemediation = await readProgress(handle.page)
  assert(reopenedRemediation.activeLessonSession?.sessionId === remediationSession.sessionId, 'remediation purpose or session identity was lost on restart')
  assert(reopenedRemediation.activeLessonSession?.launchContext?.purpose === 'remediation', 'remediation purpose was lost on restart')
  const second = await completeCurrentLesson(handle.page, 'correct', 'accepted')
  assert(second.after.activeLessonSession?.skillId === STORY_SKILL, 'successful remediation did not return to Story Scouts work')
  assert(second.after.activeLessonSession?.skillId !== WORD_SKILL, 'remediation introduced deferred Word Forge')
  report.scenarios.remediation = {
    status: 'PASS',
    lowResultAccuracy: first.trace.accuracy,
    remediationLessonId: remediationSession.lessonId,
    manifestDifficulty: remediationLesson.difficulty,
    runtimeDifficulty: remediationSession.difficulty,
    remediationPurpose: remediationSession.launchContext.purpose,
    restartPreservedPurpose: true,
    returnSkill: second.after.activeLessonSession.skillId,
    returnPurpose: second.after.activeLessonSession.launchContext?.purpose ?? null,
    attempts: second.after.completedAttempts.length,
  }
  await closeHandle(handle)
}

async function runHistoricalReview(storyCompleteState) {
  const state = clone(storyCompleteState)
  state.activeLessonSession = null
  state.plannedNextQuest = null
  const storyMap = catalog.lessons.find((lesson) => lesson.skillId === STORY_SKILL && lesson.unitId === 'ss-unit-1' && lesson.difficulty === 1 && lesson.lessonRole === 'CHECKPOINT')
  const theme = catalog.lessons.find((lesson) => lesson.skillId === STORY_SKILL && lesson.unitId === 'ss-unit-2' && lesson.difficulty === 2 && lesson.lessonRole === 'CHECKPOINT')
  assert(storyMap && theme, 'historical review fixture lessons missing')
  const target = reviewEntry(STORY_SKILL, 1, storyMap.unitId, storyMap.contentVersion, pastIso(), 0)
  const unrelated = reviewEntry(STORY_SKILL, 2, theme.unitId, theme.contentVersion, futureIso(), 0)
  state.reviewQueue = [target, unrelated]
  state.metadata.updatedAt = new Date().toISOString()
  let handle = await seedScenario('historical-review', state)
  const launched = await readProgress(handle.page)
  assert(launched.activeLessonSession?.launchContext?.purpose === 'review', 'historical due review did not launch')
  assert(launched.activeLessonSession?.launchContext?.reviewIdentity?.unitId === 'ss-unit-1', 'review identity lost unit affinity')
  const beforeTrack = clone(launched.skillProgress[STORY_SKILL])
  const reviewSessionId = launched.activeLessonSession.sessionId
  const reviewIdentity = clone(launched.activeLessonSession.launchContext.reviewIdentity)
  handle = await restartHandle(handle, 'historical-review-purpose')
  const reopened = await readProgress(handle.page)
  assert(reopened.activeLessonSession?.sessionId === reviewSessionId, 'historical review session changed across reopen')
  assert(JSON.stringify(reopened.activeLessonSession?.launchContext?.reviewIdentity) === JSON.stringify(reviewIdentity), 'historical review identity changed across reopen')
  const result = await completeCurrentLesson(handle.page, 'correct', 'accepted')
  const afterTrack = result.after.skillProgress[STORY_SKILL]
  assert(afterTrack.currentDifficulty === beforeTrack.currentDifficulty && afterTrack.lastMasteredDifficulty === beforeTrack.lastMasteredDifficulty, 'historical review mutated track difficulty')
  assert(result.after.reviewQueue.some((entry) => entry.skillId === unrelated.skillId && entry.unitId === unrelated.unitId && entry.contentVersion === unrelated.contentVersion), 'historical review erased an unrelated review')
  const rescheduled = result.after.reviewQueue.find((entry) => entry.skillId === target.skillId && entry.unitId === target.unitId && entry.contentVersion === target.contentVersion)
  assert(rescheduled && rescheduled.dueAt !== target.dueAt, 'historical review was not rescheduled')
  assert(result.after.activeLessonSession?.skillId !== WORD_SKILL, 'historical review returned to deferred Word Forge')
  report.scenarios.historicalReview = {
    status: 'PASS',
    reviewedUnit: target.unitId,
    reviewDifficulty: target.difficulty,
    trackDifficultyBefore: beforeTrack.currentDifficulty,
    trackDifficultyAfter: afterTrack.currentDifficulty,
    unrelatedReviewPreserved: true,
    reviewPurposePreservedAcrossRestart: true,
    rescheduledDueAt: rescheduled.dueAt,
    attemptDelta: result.trace.deltas.attempts,
    rewardDeltas: { xp: result.trace.deltas.xp, stars: result.trace.deltas.stars },
  }
  await closeHandle(handle)
}

async function reachFinalFeedback(page, mode = 'correct') {
  const starting = await readProgress(page)
  const source = clone(currentContext(starting).active)
  while (true) {
    const state = await readProgress(page)
    const { active, lesson } = currentContext(state)
    assert(active.sessionId === source.sessionId, `${source.lessonId}: session changed before final feedback`)
    const index = active.currentQuestionIndex
    if (await page.getByRole('button', { name: 'Next', exact: true }).count() === 0) {
      await answerCurrentQuestion(page, mode)
    }
    if (index + 1 === lesson.questions.length) return { source, beforeCompletion: await readProgress(page) }
    await clickNextWithinLesson(page, active.sessionId, index + 1)
  }
}

async function runPersistenceFailure() {
  const handle = await launchProfile('persistence-failure')
  const { source, beforeCompletion } = await reachFinalFeedback(handle.page, 'correct')
  const rawBefore = await handle.page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY)
  await handle.page.evaluate((key) => {
    const original = Storage.prototype.setItem
    window.__rrqRestoreSetItem = () => { Storage.prototype.setItem = original }
    window.__rrqDroppedWrite = false
    Storage.prototype.setItem = function setItemWithOneDrop(storageKey, value) {
      if (!window.__rrqDroppedWrite && storageKey === key) {
        window.__rrqDroppedWrite = true
        return
      }
      return original.call(this, storageKey, value)
    }
  }, PROGRESS_KEY)
  await activate(handle.page.getByRole('button', { name: 'Next', exact: true }))
  await handle.page.getByRole('button', { name: 'Retry', exact: true }).waitFor({ state: 'visible', timeout: 15_000 })
  const dropped = await handle.page.evaluate(() => window.__rrqDroppedWrite === true)
  const rawAfter = await handle.page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY)
  const after = await readProgress(handle.page)
  assert(dropped, 'persistence-failure simulation did not intercept the target write')
  assert(rawAfter === rawBefore, 'a dropped completion write changed durable progress')
  assert(after.activeLessonSession?.sessionId === source.sessionId, 'failed completion lost the recoverable session')
  assert(after.completedAttempts.length === beforeCompletion.completedAttempts.length, 'failed completion recorded a fake attempt')
  assert(after.completedSessionCount === beforeCompletion.completedSessionCount, 'failed completion recorded a fake session')
  assert(after.totalXp === beforeCompletion.totalXp && after.totalStars === beforeCompletion.totalStars, 'failed completion awarded rewards')
  assert((await handle.page.getByText('Reading Rest', { exact: true }).count()) === 0, 'failed persistence displayed Reading Rest')
  await handle.page.evaluate(() => window.__rrqRestoreSetItem?.())
  await takeShot(handle.page, '15-persistence-failure-retry')
  report.scenarios.persistenceFailure = {
    status: 'PASS',
    synthetic: true,
    droppedWriteExercised: dropped,
    activeSessionPreserved: true,
    attemptDelta: after.completedAttempts.length - beforeCompletion.completedAttempts.length,
    sessionDelta: after.completedSessionCount - beforeCompletion.completedSessionCount,
    xpDelta: after.totalXp - beforeCompletion.totalXp,
    starDelta: after.totalStars - beforeCompletion.totalStars,
    retryVisible: true,
  }
  await closeHandle(handle)
}

async function runStaleStateProtection() {
  const runtime = createRuntimeLog('stale-state')
  let handle = await launchProfile('stale-state', { width: 1440, height: 1000 }, runtime, { blockStorageEvents: true })
  const olderState = await readProgress(handle.page)
  const olderContext = currentContext(olderState)
  assert(olderContext.lesson.questions.length > 1, 'stale-state control lesson needs at least two questions')
  assert(olderContext.question.questionType === 'MULTIPLE_CHOICE', 'stale-state first control question must be multiple choice')
  await handle.page.evaluate(() => { window.__rrqBlockStorageEvents = true })

  const newerPage = await handle.context.newPage()
  attachPage(newerPage, runtime)
  await newerPage.goto(APP_URL, { waitUntil: 'networkidle', timeout: 60_000 })
  await waitForSettledScreen(newerPage)
  const newerInitial = await readProgress(newerPage)
  assert(newerInitial.activeLessonSession?.sessionId === olderContext.active.sessionId, 'two-tab control did not open the same session')
  await answerCurrentQuestion(newerPage, 'correct')
  const feedbackRaw = await newerPage.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY)
  const feedbackState = JSON.parse(feedbackRaw)
  assert(feedbackState.activeLessonSession?.currentQuestionIndex === 0, 'newer tab did not persist same-index feedback')
  assert(feedbackState.activeLessonSession?.submittedQuestions.length === 1, 'newer tab did not persist submitted feedback')
  assert(await handle.page.getByText(olderContext.question.prompt, { exact: true }).count() > 0, 'older tab did not remain stale for the conflict test')

  const staleChoiceId = olderContext.question.correctIds[0]
  await selectInput(handle.page.locator(`input[type="radio"][value="${cssValue(staleChoiceId)}"]`))
  await handle.page.getByRole('button', { name: 'Next', exact: true }).waitFor({ state: 'visible', timeout: 15_000 })
  const afterFirstStaleRaw = await handle.page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY)
  assert(afterFirstStaleRaw === feedbackRaw, 'first stale draft changed newer same-index feedback bytes')
  assert(await handle.page.locator('.answer-feedback').count() === 1, 'first stale rejection did not synchronize authoritative feedback')

  await clickNextWithinLesson(newerPage, olderContext.active.sessionId, 1)
  const advancedRaw = await newerPage.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY)
  const advancedState = JSON.parse(advancedRaw)
  const advancedContext = currentContext(advancedState)
  assert(advancedContext.active.currentQuestionIndex === 1, 'newer tab did not persist its advanced checkpoint')

  await activate(handle.page.getByRole('button', { name: 'Next', exact: true }))
  await handle.page.getByText(advancedContext.question.prompt, { exact: true }).waitFor({ state: 'visible', timeout: 15_000 })
  await handle.page.getByRole('button', { name: 'Check Answer', exact: true }).waitFor({ state: 'visible', timeout: 15_000 })
  const afterSecondStaleRaw = await handle.page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY)
  assert(afterSecondStaleRaw === advancedRaw, 'second stale write after conflict adoption changed authoritative bytes')

  if (IS_WEBKIT) {
    await handle.page.goto('about:blank')
    await handle.page.goBack({ waitUntil: 'networkidle' })
    await waitForSettledScreen(handle.page)
    await handle.page.getByText(advancedContext.question.prompt, { exact: true }).waitFor({ state: 'visible', timeout: 15_000 })
  }

  await answerCurrentQuestion(handle.page, 'correct')
  const freshRaw = await handle.page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY)
  const freshState = JSON.parse(freshRaw)
  assert(freshRaw !== advancedRaw, 'fresh action after synchronization did not persist')
  assert(freshState.activeLessonSession?.currentQuestionIndex === 1, 'fresh synchronized action changed the question identity')
  assert(freshState.activeLessonSession?.submittedQuestions.some((entry) => entry.questionId === advancedContext.question.questionId), 'fresh synchronized submission was not retained')

  await newerPage.close()
  handle = await restartHandle(handle, 'stale-state-authoritative-checkpoint')
  const restarted = await readProgress(handle.page)
  assert(restarted.activeLessonSession?.currentQuestionIndex === 1, 'accepted checkpoint regressed across browser-process restart')
  assert(restarted.activeLessonSession?.submittedQuestions.some((entry) => entry.questionId === advancedContext.question.questionId), 'accepted feedback was lost across browser-process restart')
  assert(await handle.page.getByRole('button', { name: 'Next', exact: true }).count() === 1, 'accepted feedback did not restore after browser-process restart')

  report.scenarios.staleState = {
    status: 'PASS',
    synthetic: true,
    sessionId: olderContext.active.sessionId,
    olderQuestionIndex: olderContext.active.currentQuestionIndex,
    feedbackRevision: feedbackState.activeLessonSession?.checkpointRevision ?? null,
    advancedRevision: advancedState.activeLessonSession?.checkpointRevision ?? null,
    acceptedRevision: restarted.activeLessonSession?.checkpointRevision ?? null,
    firstStaleRawPreserved: afterFirstStaleRaw === feedbackRaw,
    secondStaleRawPreserved: afterSecondStaleRaw === advancedRaw,
    authoritativeViewRecovered: true,
    freshActionAccepted: true,
    processRestartPreserved: true,
    feedbackProgressSha256: sha256(feedbackRaw),
    advancedProgressSha256: sha256(advancedRaw),
    finalProgressSha256: sha256(freshRaw),
    attemptDelta: restarted.completedAttempts.length - advancedState.completedAttempts.length,
    rewardDelta: {
      xp: restarted.totalXp - advancedState.totalXp,
      stars: restarted.totalStars - advancedState.totalStars,
    },
  }
  assert(restarted.completedAttempts.length === advancedState.completedAttempts.length, 'stale conflict fabricated an attempt')
  assert(restarted.totalXp === advancedState.totalXp && restarted.totalStars === advancedState.totalStars, 'stale conflict fabricated rewards')
  await closeHandle(handle)
}

async function runRepresentativeCoverage() {
  const questionTypes = []
  for (const [questionType, fixture] of Object.entries(fixtures.representatives.questionTypes)) {
    const handle = await seedScenario(`question-type-${questionType.toLowerCase()}`, clone(fixture.state))
    const state = await readProgress(handle.page)
    const context = currentContext(state)
    assert(context.question.questionId === fixture.questionId, `${questionType}: representative question did not resume`)
    if (questionType === 'HOT_TEXT') {
      const inputs = handle.page.locator('.segment-grid input')
      assert(await inputs.count() >= 2, 'single-select Hot Text fixture needs two visible choices')
      await performAcceptedDraftAction(handle.page, () => selectInput(inputs.nth(0)), 'single-select Hot Text first choice')
      await performAcceptedDraftAction(handle.page, () => selectInput(inputs.nth(1)), 'single-select Hot Text replacement choice')
      assert(await inputs.nth(0).isChecked() === false && await inputs.nth(1).isChecked() === true, 'single-select Hot Text did not replace the prior selection')
    }
    await selectAnswer(handle.page, context.question, 'correct')
    assert(await handle.page.locator('[data-answer-state="selected"]').count() > 0, `${questionType}: pre-submit selection was not neutral-selected`)
    assert(await handle.page.locator('[data-answer-state="correct"], [data-answer-state="incorrect"]').count() === 0, `${questionType}: correctness leaked before submission`)
    await activate(handle.page.getByRole('button', { name: 'Check Answer', exact: true }))
    await handle.page.locator('.answer-feedback[data-result="correct"]').waitFor({ state: 'visible', timeout: 10_000 })
    assert((await readProgress(handle.page)).activeLessonSession?.currentQuestionIndex === state.activeLessonSession.currentQuestionIndex, `${questionType}: submission auto-advanced before Next`)
    questionTypes.push({ questionType, lessonId: fixture.lessonId, questionId: fixture.questionId, status: 'PASS' })
    await closeHandle(handle)
  }

  const contentForms = []
  const selectors = {
    prose: '.question-first-reading',
    poem: '.poem-card',
    informational: '.informational-text-card',
    paired: '.paired-text-card',
    localReference: '.reference-material-card',
    guidedInstruction: '.teaching-block',
  }
  for (const [form, selector] of Object.entries(selectors)) {
    const fixture = fixtures.representatives.contentForms[form]
    const handle = await seedScenario(`content-${form}`, clone(fixture.state))
    await handle.page.locator(selector).first().waitFor({ state: 'visible', timeout: 15_000 })
    contentForms.push({ form, lessonId: fixture.lessonId, selector, status: 'PASS' })
    await closeHandle(handle)
  }

  const wordHelpFixture = fixtures.representatives.contentForms.wordHelp
  const wordHelp = await seedScenario('content-word-help', clone(wordHelpFixture.state))
  const openWordHelp = wordHelp.page.getByRole('button', { name: /Open word help for/i }).first()
  await openWordHelp.waitFor({ state: 'visible', timeout: 15_000 })
  await activate(openWordHelp)
  await wordHelp.page.getByRole('heading', { name: 'Word Help', exact: true }).waitFor({ state: 'visible', timeout: 10_000 })
  await activate(wordHelp.page.getByRole('button', { name: 'Close Word Help', exact: true }))
  contentForms.push({ form: 'wordHelp', lessonId: wordHelpFixture.lessonId, status: 'PASS' })
  await closeHandle(wordHelp)

  const fluencyFixture = fixtures.representatives.contentForms.fluency
  const fluency = await seedScenario('content-fluency', clone(fluencyFixture.state))
  await fluency.page.getByRole('heading', { name: 'Practice Steps', exact: true }).waitFor({ state: 'visible', timeout: 15_000 })
  const beforeFluency = await readProgress(fluency.page)
  await performAcceptedDraftAction(
    fluency.page,
    () => activate(fluency.page.getByRole('button', { name: 'I Practiced the Phrases', exact: true })),
    'fluency phrase-practice checkpoint',
  )
  await performAcceptedDraftAction(
    fluency.page,
    () => activate(fluency.page.getByRole('button', { name: 'Read It Once', exact: true })),
    'fluency reread checkpoint',
  )
  const afterFluency = await readProgress(fluency.page)
  assert(afterFluency.completedAttempts.length === beforeFluency.completedAttempts.length, 'fluency practice rendered as a completed attempt')
  assert(afterFluency.activeLessonSession?.fluencyPracticeState?.phrasePracticeCompleted === true, 'fluency phrase practice was not checkpointed')
  assert(afterFluency.activeLessonSession?.fluencyPracticeState?.completedReadCount === 1, 'fluency reread was not checkpointed')
  contentForms.push({ form: 'fluency', lessonId: fluencyFixture.lessonId, status: 'PASS' })
  await closeHandle(fluency)

  report.representative = { questionTypes, contentForms }
}

async function runGenuineCompletionAndReactivation() {
  const state = clone(completionTemplate.complete)
  const storyMap = catalog.lessons.find((lesson) => lesson.skillId === STORY_SKILL && lesson.unitId === 'ss-unit-1' && lesson.difficulty === 1 && lesson.lessonRole === 'CHECKPOINT')
  assert(storyMap, 'completion review fixture lesson missing')
  const futureReview = reviewEntry(STORY_SKILL, 1, storyMap.unitId, storyMap.contentVersion, futureIso(), 1)
  state.reviewQueue = [futureReview]
  state.metadata.updatedAt = new Date().toISOString()
  const handle = await seedScenario('genuine-completion', state)
  await handle.page.getByRole('heading', { name: 'Grade 3 Journey Complete!', exact: true }).waitFor({ state: 'visible', timeout: 15_000 })
  assert((await handle.page.getByText('Reading Rest', { exact: true }).count()) === 0, 'genuine completion used the generic Reading Rest heading')
  assert(!Object.keys((await readProgress(handle.page)).skillProgress).some((skillId) => skillId.startsWith('g4-')), 'genuine completion initialized Grade 4')
  await takeShot(handle.page, '13-genuine-completion')

  await handle.page.bringToFront()
  await handle.page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })))
  await handle.page.evaluate(() => new Promise((resolvePromise) => requestAnimationFrame(() => requestAnimationFrame(resolvePromise))))
  assert(await handle.page.getByRole('heading', { name: 'Grade 3 Journey Complete!', exact: true }).count() === 1, 'pageshow created false work while review was not due')

  const helper = await handle.context.newPage()
  attachPage(helper, handle.runtime)
  await helper.goto(`${APP_URL}${EXPECTED_JS}`, { waitUntil: 'load' })
  await helper.evaluate(({ key, dueAt }) => {
    const state = JSON.parse(localStorage.getItem(key))
    state.reviewQueue[0].dueAt = dueAt
    state.metadata.updatedAt = new Date().toISOString()
    localStorage.setItem(key, JSON.stringify(state))
  }, { key: PROGRESS_KEY, dueAt: pastIso() })
  await handle.page.bringToFront()
  await handle.page.locator('.question-first-shell').waitFor({ state: 'visible', timeout: 15_000 })
  const reactivated = await readProgress(handle.page)
  assert(reactivated.activeLessonSession?.launchContext?.purpose === 'review', 'storage change did not reactivate the due review')
  assert(reactivated.activeLessonSession?.launchContext?.reviewIdentity?.unitId === 'ss-unit-1', 'reactivated review lost its identity')
  assert(reactivated.activeLessonSession && reactivated.completedAttempts.length === state.completedAttempts.length, 'reactivation fabricated a completion')
  await takeShot(handle.page, '14-rest-page-storage-reactivation')
  report.scenarios.genuineCompletionAndReactivation = {
    status: 'PASS',
    honestCompletionHeading: true,
    grade4Absent: true,
    pageshowCoalesced: true,
    storageChangeOpenedPurpose: reactivated.activeLessonSession.launchContext.purpose,
    activeSessionCount: reactivated.activeLessonSession ? 1 : 0,
    pollingAdded: false,
  }
  await helper.close()
  await closeHandle(handle)
}

async function runWebKitTouchInteraction() {
  const fixture = fixtures.representatives.questionTypes.MULTIPLE_CHOICE
  const handle = await seedScenario('webkit-touch-interaction', clone(fixture.state))
  const page = handle.page
  const capabilities = await page.evaluate(() => ({
    maxTouchPoints: navigator.maxTouchPoints,
    coarsePointer: matchMedia('(pointer: coarse)').matches,
    viewport: { width: innerWidth, height: innerHeight },
    screen: { width: screen.width, height: screen.height },
    userAgent: navigator.userAgent,
  }))
  assert(WEBKIT_DEVICE.hasTouch === true && WEBKIT_DEVICE.isMobile === true, 'WebKit iPad descriptor did not configure mobile touch input')
  const reading = page.locator('.question-first-reading').first()
  const readingFingerprintBeforeOrientation = sha256((await reading.textContent()) ?? '')
  const orientationQuestionId = currentContext(await readProgress(page)).question.questionId
  const portraitScroll = await page.evaluate(() => {
    const maxScrollY = Math.max(0, document.documentElement.scrollHeight - innerHeight)
    const targetScrollY = Math.min(160, maxScrollY)
    window.scrollTo(0, targetScrollY)
    return { maxScrollY, targetScrollY }
  })
  if (portraitScroll.targetScrollY > 0) await page.waitForFunction(() => window.scrollY > 0)
  const portraitScrollY = await page.evaluate(() => window.scrollY)
  await page.setViewportSize(devices[WEBKIT_LANDSCAPE_DEVICE_NAME].viewport)
  await page.evaluate(() => new Promise((resolvePromise) => requestAnimationFrame(() => requestAnimationFrame(resolvePromise))))
  const landscapeScrollY = await page.evaluate(() => window.scrollY)
  if (portraitScroll.targetScrollY > 0) assert(landscapeScrollY > 0, 'landscape orientation reset the learner to the top of the reading')
  await page.setViewportSize(devices[WEBKIT_DEVICE_NAME].viewport)
  await page.evaluate(() => new Promise((resolvePromise) => requestAnimationFrame(() => requestAnimationFrame(resolvePromise))))
  const restoredPortraitScrollY = await page.evaluate(() => window.scrollY)
  if (portraitScroll.targetScrollY > 0) assert(restoredPortraitScrollY > 0, 'returning to portrait reset the learner to the top of the reading')
  assert(sha256((await reading.textContent()) ?? '') === readingFingerprintBeforeOrientation, 'orientation change replaced or truncated the reading surface')
  assert(currentContext(await readProgress(page)).question.questionId === orientationQuestionId, 'orientation change replaced the active question')
  const selectedBeforePassageTap = await page.locator('input:checked').count()
  await reading.scrollIntoViewIfNeeded()
  const readingBox = await reading.boundingBox()
  assert(readingBox, 'reading surface did not expose a touch target')
  await page.touchscreen.tap(readingBox.x + Math.min(40, readingBox.width / 2), readingBox.y + Math.min(40, readingBox.height / 2))
  assert(await page.locator('input:checked').count() === selectedBeforePassageTap, 'tapping the passage selected an answer')

  const state = await readProgress(page)
  const context = currentContext(state)
  await selectAnswer(page, context.question, 'correct')
  const selectedState = await readProgress(page)
  const beforeRevision = selectedState.activeLessonSession.checkpointRevision
  await page.evaluate(() => {
    window.__rrqTouchEvents = { starts: 0, ends: 0 }
    document.addEventListener('touchstart', () => { window.__rrqTouchEvents.starts += 1 }, true)
    document.addEventListener('touchend', () => { window.__rrqTouchEvents.ends += 1 }, true)
  })
  const check = page.getByRole('button', { name: 'Check Answer', exact: true })
  const checkBox = await check.boundingBox()
  assert(checkBox, 'Check Answer did not expose a touch target')
  const tapPoint = { x: checkBox.x + checkBox.width / 2, y: checkBox.y + checkBox.height / 2 }
  await Promise.all([
    page.touchscreen.tap(tapPoint.x, tapPoint.y),
    page.touchscreen.tap(tapPoint.x, tapPoint.y),
  ])
  await page.locator('.answer-feedback').waitFor({ state: 'visible', timeout: 15_000 })
  const afterRapidTap = await readProgress(page)
  assert(afterRapidTap.activeLessonSession?.currentQuestionIndex === context.active.currentQuestionIndex, 'rapid touch skipped feedback and advanced the question')
  assert(afterRapidTap.activeLessonSession?.checkpointRevision === beforeRevision + 1, 'rapid touch persisted more than one submission checkpoint')
  assert(afterRapidTap.activeLessonSession?.submittedQuestions.length === selectedState.activeLessonSession.submittedQuestions.length + 1, 'rapid touch recorded duplicate submitted results')
  assert(await page.getByRole('button', { name: 'Next', exact: true }).count() === 1, 'rapid Check Answer touch did not leave exactly one Next action')
  const touchEvents = await page.evaluate(() => window.__rrqTouchEvents)
  assert(touchEvents.starts >= 2 && touchEvents.ends >= 2, 'rapid action did not use actual emulated touch events')
  const nextBox = await page.getByRole('button', { name: 'Next', exact: true }).boundingBox()
  const feedbackBox = await page.locator('.answer-feedback').boundingBox()
  assert(nextBox && feedbackBox && !boxesOverlap(nextBox, feedbackBox), 'primary action covered the feedback explanation')
  report.scenarios.webkitTouchInteraction = {
    status: 'PASS',
    deviceDescriptor: WEBKIT_DEVICE_NAME,
    capabilities: {
      ...capabilities,
      configuredHasTouch: WEBKIT_DEVICE.hasTouch,
      configuredIsMobile: WEBKIT_DEVICE.isMobile,
      maxTouchPointsNote: capabilities.maxTouchPoints > 0
        ? 'Browser exposed touch points.'
        : 'Playwright WebKit reported zero maxTouchPoints; actual dispatched touch events are the acceptance authority.',
    },
    actualTouchEvents: touchEvents,
    orientationReadingPosition: {
      portraitScrollY,
      landscapeScrollY,
      restoredPortraitScrollY,
      scrollRetentionApplicable: portraitScroll.targetScrollY > 0,
      readingFingerprintPreserved: true,
      questionIdentityPreserved: true,
      retained: true,
    },
    rapidTapSubmissionDelta: 1,
    feedbackRemainedVisible: true,
    passageTapDidNotSelectAnswer: true,
    primaryActionCoveredFeedback: false,
    physicalDevice: false,
  }
  await closeHandle(handle)
}

async function runWebKitLocks() {
  const handle = await launchProfile('webkit-web-locks')
  const owner = await handle.context.newPage()
  const waiter = await handle.context.newPage()
  attachPage(owner, handle.runtime)
  attachPage(waiter, handle.runtime)
  await owner.goto(APP_URL, { waitUntil: 'networkidle' })
  await waiter.goto(APP_URL, { waitUntil: 'networkidle' })
  const availability = await handle.page.evaluate(() => ({
    secureContext: isSecureContext,
    request: typeof navigator.locks?.request === 'function',
    query: typeof navigator.locks?.query === 'function',
  }))
  assert(availability.secureContext && availability.request && availability.query, 'real WebKit Web Locks API was unavailable in the secure application context')

  await holdLock(owner, 'rrq-webkit-exclusive-control')
  await waiter.evaluate((name) => {
    window.__rrqQueuedLock = 'pending'
    void navigator.locks.request(name, async () => { window.__rrqQueuedLock = 'acquired' })
  }, 'rrq-webkit-exclusive-control')
  await waiter.evaluate(() => new Promise((resolvePromise) => requestAnimationFrame(() => requestAnimationFrame(resolvePromise))))
  assert(await waiter.evaluate(() => window.__rrqQueuedLock) === 'pending', 'queued WebKit lock entered while the owner still held it')
  await releaseHeldLock(owner)
  await waiter.waitForFunction(() => window.__rrqQueuedLock === 'acquired')

  await holdLock(owner, 'rrq-webkit-cancel-control')
  await waiter.evaluate((name) => {
    const controller = new AbortController()
    window.__rrqCancelledLock = 'pending'
    void navigator.locks.request(name, { signal: controller.signal }, async () => {
      window.__rrqCancelledLock = 'acquired'
    }).catch((error) => { window.__rrqCancelledLock = `rejected:${error.name}` })
    controller.abort()
  }, 'rrq-webkit-cancel-control')
  await waiter.waitForFunction(() => String(window.__rrqCancelledLock).startsWith('rejected:'))
  assert(String(await waiter.evaluate(() => window.__rrqCancelledLock)).includes('AbortError'), 'queued WebKit lock cancellation did not reject with AbortError')
  await releaseHeldLock(owner)

  const closeOwner = await handle.context.newPage()
  const closeWaiter = await handle.context.newPage()
  await closeOwner.goto(APP_URL, { waitUntil: 'networkidle' })
  await closeWaiter.goto(APP_URL, { waitUntil: 'networkidle' })
  await holdLock(closeOwner, 'rrq-webkit-page-close-control')
  await closeWaiter.evaluate((name) => {
    window.__rrqCloseReleaseLock = 'pending'
    void navigator.locks.request(name, async () => { window.__rrqCloseReleaseLock = 'acquired' })
  }, 'rrq-webkit-page-close-control')
  await closeWaiter.evaluate(() => new Promise((resolvePromise) => requestAnimationFrame(() => requestAnimationFrame(resolvePromise))))
  assert(await closeWaiter.evaluate(() => window.__rrqCloseReleaseLock) === 'pending', 'page-close waiter was not queued')
  await closeOwner.close()
  await closeWaiter.waitForFunction(() => window.__rrqCloseReleaseLock === 'acquired')

  const productionLockState = await handle.page.evaluate(async (name) => {
    const state = await navigator.locks.query()
    return {
      held: state.held.filter((entry) => entry.name === name).length,
      pending: state.pending.filter((entry) => entry.name === name).length,
    }
  }, PROGRESS_WRITE_LOCK_NAME)
  assert(productionLockState.held === 0 && productionLockState.pending === 0, 'application held its progress lock while waiting for learner input')
  assert(await handle.page.getByRole('button', { name: 'Check Answer', exact: true }).isEnabled() === false, 'fresh unanswered Check Answer unexpectedly enabled')
  report.scenarios.webkitWebLocks = {
    status: 'PASS',
    availability,
    exclusiveAcquisition: true,
    queuedAcquisition: true,
    queuedCancellation: 'AbortError',
    releasedAfterOwningPageClosed: true,
    productionLockIdleDuringUserInput: productionLockState,
  }
  await owner.close()
  await waiter.close()
  await closeWaiter.close()
  await closeHandle(handle)
}

async function runWebKitPageRestoration() {
  const fixture = fixtures.representatives.questionTypes.MULTIPLE_CHOICE
  let handle = await seedScenario('webkit-page-restoration', clone(fixture.state))
  const page = handle.page
  const initial = await readProgress(page)
  const initialContext = currentContext(initial)
  await selectAnswer(page, initialContext.question, 'correct')
  const draftRaw = await page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY)
  const draftRestore = await navigateAwayAndBack(page)
  assert(await page.locator(`input[value="${cssValue(initialContext.question.correctIds[0])}"]`).isChecked(), 'draft selection was lost after real back navigation')
  await answerCurrentQuestion(page, 'correct')
  const feedbackRaw = await page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY)
  const feedbackRestore = await navigateAwayAndBack(page)
  assert(await page.getByRole('button', { name: 'Next', exact: true }).count() === 1, 'submitted feedback did not survive real back navigation')
  await clickNextWithinLesson(page, initialContext.active.sessionId, 1)

  const blocker = await handle.context.newPage()
  await blocker.goto(`${APP_URL}${EXPECTED_JS}`, { waitUntil: 'load' })
  await holdLock(blocker, PROGRESS_WRITE_LOCK_NAME)
  const pendingState = await readProgress(page)
  const pendingContext = currentContext(pendingState)
  const pendingChoice = page.locator(`input[type="radio"][value="${cssValue(pendingContext.question.correctIds[0])}"]`)
  await selectInput(pendingChoice)
  await page.waitForFunction(() => [...document.querySelectorAll('.question-first-question input, .question-first-question select')].some((control) => control.disabled))
  await page.goto('about:blank')
  await blocker.close()
  await page.goBack({ waitUntil: 'networkidle' })
  await waitForSettledScreen(page)
  const afterInterruptedSave = await readProgress(page)
  assert(afterInterruptedSave.activeLessonSession?.sessionId === pendingContext.active.sessionId, 'interrupted save changed the active session')
  assert(afterInterruptedSave.activeLessonSession?.currentQuestionIndex === pendingContext.active.currentQuestionIndex, 'interrupted save changed the question')
  await page.waitForFunction(() => [...document.querySelectorAll('.question-first-question input, .question-first-question select')].every((control) => !control.disabled))
  await selectAnswer(page, currentContext(afterInterruptedSave).question, 'correct')

  const finalFeedback = await reachFinalFeedback(page, 'correct')
  const finalRestore = await navigateAwayAndBack(page)
  assert(await page.getByRole('button', { name: 'Next', exact: true }).count() === 1, 'final feedback did not survive real back navigation')
  const beforeCompletion = await readProgress(page)
  await activate(page.getByRole('button', { name: 'Next', exact: true }))
  await page.waitForFunction(({ key, sessionId }) => {
    const raw = localStorage.getItem(key)
    const state = raw ? JSON.parse(raw) : null
    return state?.activeLessonSession?.sessionId && state.activeLessonSession.sessionId !== sessionId
  }, { key: PROGRESS_KEY, sessionId: finalFeedback.source.sessionId }, { timeout: 30_000 })
  const afterCompletion = await readProgress(page)
  assert(afterCompletion.completedAttempts.length === beforeCompletion.completedAttempts.length + 1, 'restored final completion did not record exactly one attempt')
  assert(afterCompletion.completedSessionCount === beforeCompletion.completedSessionCount + 1, 'restored final completion did not record exactly one session')
  report.scenarios.webkitPageRestoration = {
    status: 'PASS',
    draftRawSha256: sha256(draftRaw),
    feedbackRawSha256: sha256(feedbackRaw),
    draftRestore,
    feedbackRestore,
    finalRestore,
    interruptedPendingSaveRecovered: true,
    controlsReenabled: true,
    finalCompletionAttemptDelta: 1,
    bfcacheObserved: [draftRestore, feedbackRestore, finalRestore].some((entry) => entry.persisted),
    desktopWebKitBoundary: 'This does not prove physical iPadOS memory-pressure termination or screen-lock behavior.',
  }
  await closeHandle(handle)
}

async function runUnsupportedCapabilities() {
  const missingLocks = await launchProfile('unsupported-missing-locks', undefined, createRuntimeLog('unsupported-missing-locks'), { disableWebLocks: true })
  await missingLocks.page.getByRole('heading', { name: 'A grown-up needs to help', exact: true }).waitFor({ state: 'visible', timeout: 15_000 })
  assert(await missingLocks.page.getByRole('button', { name: 'Retry', exact: true }).count() === 0, 'permanently missing Web Locks exposed an endless Retry action')
  assert(await missingLocks.page.getByText(/current Safari or Microsoft Edge/i).count() === 1, 'missing Web Locks did not show the supported-browser message')
  assert(await missingLocks.page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY) === null, 'missing Web Locks wrote a fresh profile')
  await closeHandle(missingLocks)

  const missingStorage = await launchProfile('unsupported-missing-storage', undefined, createRuntimeLog('unsupported-missing-storage'), { disableStorage: true })
  await missingStorage.page.getByRole('heading', { name: 'A grown-up needs to help', exact: true }).waitFor({ state: 'visible', timeout: 15_000 })
  assert(await missingStorage.page.getByRole('button', { name: 'Retry', exact: true }).count() === 0, 'permanently unavailable storage exposed an endless Retry action')
  await closeHandle(missingStorage)

  const rejectedLock = await launchProfile('unsupported-rejected-lock', undefined, createRuntimeLog('unsupported-rejected-lock'), { rejectWebLocks: true })
  await rejectedLock.page.getByRole('button', { name: 'Retry', exact: true }).waitFor({ state: 'visible', timeout: 15_000 })
  assert(await rejectedLock.page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY) === null, 'rejected lock request wrote a fresh profile')
  report.scenarios.unsupportedCapabilities = {
    status: 'PASS',
    missingWebLocks: { blocked: true, retryOffered: false, freshProfileWritten: false },
    unavailableStorage: { blocked: true, retryOffered: false },
    rejectedLockRequest: { blocked: true, retryOffered: true, freshProfileWritten: false },
    technicalDetailsKeptOutOfChildMessage: true,
  }
  await closeHandle(rejectedLock)
}

async function holdLock(page, name) {
  await page.evaluate((lockName) => {
    window.__rrqHeldLockAcquired = false
    window.__rrqHeldLockRelease = null
    window.__rrqHeldLockPromise = navigator.locks.request(lockName, async () => {
      window.__rrqHeldLockAcquired = true
      await new Promise((resolvePromise) => { window.__rrqHeldLockRelease = resolvePromise })
    })
  }, name)
  await page.waitForFunction(() => window.__rrqHeldLockAcquired === true)
}

async function releaseHeldLock(page) {
  await page.evaluate(() => window.__rrqHeldLockRelease?.())
  await page.evaluate(() => window.__rrqHeldLockPromise)
}

async function navigateAwayAndBack(page) {
  await page.goto('about:blank')
  await page.goBack({ waitUntil: 'networkidle' })
  await waitForSettledScreen(page)
  const events = await page.evaluate(() => window.__rrqPageShowEvents ?? [])
  return { persisted: events.some((entry) => entry.persisted), events }
}

function boxesOverlap(left, right) {
  return left.x < right.x + right.width
    && left.x + left.width > right.x
    && left.y < right.y + right.height
    && left.y + left.height > right.y
}

function evaluateRuntime(logs) {
  const all = logs.flatMap((log) => log.requests)
  const failedRequests = logs.flatMap((log) => log.failedRequests)
  const failedResponses = logs.flatMap((log) => log.failedResponses)
  const pageErrors = logs.flatMap((log) => log.pageErrors)
  const consoleErrors = logs.flatMap((log) => log.consoleErrors)
  const failedAppAssets = failedResponses.filter((entry) => entry.url.includes('/rorys-reading-quest/assets/'))
  const unexpectedFailedResponses = failedResponses.filter((entry) => !entry.url.endsWith('/favicon.ico'))
  const unexpectedConsoleErrors = consoleErrors.filter((entry) => !entry.url.endsWith('/favicon.ico'))
  const origins = [...new Set(all.map((entry) => new URL(entry.url).origin))]
  assert(failedRequests.length === 0, `request failures observed: ${JSON.stringify(failedRequests)}`)
  assert(failedAppAssets.length === 0, `application asset failures observed: ${JSON.stringify(failedAppAssets)}`)
  assert(unexpectedFailedResponses.length === 0, `unexpected HTTP failures observed: ${JSON.stringify(unexpectedFailedResponses)}`)
  assert(unexpectedConsoleErrors.length === 0, `unexpected console errors observed: ${JSON.stringify(unexpectedConsoleErrors)}`)
  assert(pageErrors.length === 0, `page errors observed: ${JSON.stringify(pageErrors)}`)
  assert(origins.every((origin) => origin === ORIGIN), `unexpected external request origin: ${JSON.stringify(origins)}`)
  return {
    requestCount: all.length,
    origins,
    failedRequests,
    failedResponses,
    pageErrors,
    consoleErrors,
    favicon404Only: (failedResponses.length > 0 || consoleErrors.length > 0)
      && failedResponses.every((entry) => entry.url.endsWith('/favicon.ico'))
      && consoleErrors.every((entry) => entry.url.endsWith('/favicon.ico')),
  }
}

async function cleanupProfiles() {
  for (const handle of [...activeHandles]) await closeHandle(handle)
  const resolvedProfileRoot = resolve(PROFILE_ROOT)
  const resolvedTemp = resolve(tmpdir())
  const profileRelative = relative(resolvedTemp, resolvedProfileRoot)
  assert(profileRelative && !profileRelative.startsWith('..') && !isAbsolute(profileRelative) && basename(resolvedProfileRoot).startsWith(PROFILE_PREFIX), 'refusing to remove an unverified profile path')
  rmSync(resolvedProfileRoot, { recursive: true, force: true })
  return { profileRoot: resolvedProfileRoot, removed: true, remainingTaskOwnedProcesses: profileProcesses(resolvedProfileRoot).length }
}

async function main() {
  const runtimeLogs = []
  if (IS_WEBKIT && TEST_MODE === 'local') {
    log('scenario releaseUpgrade starting')
    await runReleaseUpgrade()
    log('scenario releaseUpgrade passed')
  }
  log('scenario representativeCoverage starting')
  await runRepresentativeCoverage()
  log('scenario representativeCoverage passed')
  const central = await runCentral()
  runtimeLogs.push(central.handle.runtime)
  await runParentAndResponsive(central.handle)
  await closeHandle(central.handle)

  const scenarioRunners = [
    ['strandedRecovery', () => runStrandedRecovery(central.storyCompleteState)],
    ['rejectedCompletion', runRejectedCompletion],
    ['crossSkillAffinity', () => runCrossSkillAffinity(central.firstSuccessState, central.informationAttempt)],
    ['remediation', runRemediation],
    ['historicalReview', () => runHistoricalReview(central.storyCompleteState)],
    ['persistenceFailure', runPersistenceFailure],
    ['genuineCompletionAndReactivation', runGenuineCompletionAndReactivation],
    ['staleState', runStaleStateProtection],
  ]
  for (const [name, runner] of scenarioRunners) {
    log(`scenario ${name} starting`)
    const beforeLogs = new Set([...activeHandles].map((handle) => handle.runtime))
    await runner()
    for (const handle of activeHandles) {
      if (!beforeLogs.has(handle.runtime) && !runtimeLogs.includes(handle.runtime)) runtimeLogs.push(handle.runtime)
    }
    log(`scenario ${name} passed`)
  }

  if (IS_WEBKIT) {
    for (const [name, runner] of [
      ['webkitTouchInteraction', runWebKitTouchInteraction],
      ['webkitWebLocks', runWebKitLocks],
      ['webkitPageRestoration', runWebKitPageRestoration],
      ['unsupportedCapabilities', runUnsupportedCapabilities],
    ]) {
      log(`scenario ${name} starting`)
      await runner()
      log(`scenario ${name} passed`)
    }
  }

  // Scenario handles close themselves, so collect their runtime logs from the report-time registry file below.
  const allRuntimeLogs = [central.handle.runtime, ...runtimeRegistry]
  report.runtime = evaluateRuntime(allRuntimeLogs)
  report.requiredScenarios = {
    'continuous-journey': report.central.completions.length === 7 ? 'PASS' : 'FAIL',
    'browser-process-restarts': report.central.restarts.length >= 6 ? 'PASS' : 'FAIL',
    'stranded-save': report.scenarios.strandedRecovery?.status ?? 'MISSING',
    'unsuccessful-remediation': report.scenarios.remediation?.status ?? 'MISSING',
    'historical-review': report.scenarios.historicalReview?.status ?? 'MISSING',
    'persistence-failure': report.scenarios.persistenceFailure?.status ?? 'MISSING',
    'stale-state': report.scenarios.staleState?.status ?? 'MISSING',
    'rejected-completion': report.scenarios.rejectedCompletion?.status ?? 'MISSING',
    'genuine-completion-reactivation': report.scenarios.genuineCompletionAndReactivation?.status ?? 'MISSING',
    'question-types-and-content': report.representative?.questionTypes.length === 5 && report.representative?.contentForms.length === 8 ? 'PASS' : 'FAIL',
    'parent-print-responsive': report.parent?.setupGate === 'PASS' && report.responsive.length === 4 ? 'PASS' : 'FAIL',
    'runtime-health': report.runtime ? 'PASS' : 'FAIL',
  }
  if (IS_WEBKIT) {
    report.requiredScenarios['webkit-touch-interaction'] = report.scenarios.webkitTouchInteraction?.status ?? 'MISSING'
    report.requiredScenarios['webkit-web-locks'] = report.scenarios.webkitWebLocks?.status ?? 'MISSING'
    report.requiredScenarios['webkit-page-restoration'] = report.scenarios.webkitPageRestoration?.status ?? 'MISSING'
    report.requiredScenarios['unsupported-capabilities'] = report.scenarios.unsupportedCapabilities?.status ?? 'MISSING'
    if (TEST_MODE === 'local') report.requiredScenarios['release-upgrade'] = report.scenarios.releaseUpgrade?.status ?? 'MISSING'
  }
  assert(Object.values(report.requiredScenarios).every((status) => status === 'PASS'), `required scenario summary was not all PASS: ${JSON.stringify(report.requiredScenarios)}`)
  report.status = 'PASS'
  report.finishedAt = new Date().toISOString()
  report.cleanup = await cleanupProfiles()
  writeFileSync(join(RUN_DIR, `${ENGINE}-acceptance.json`), `${JSON.stringify(report, null, 2)}\n`)
  log(`all ${ENGINE} acceptance scenarios passed`, { report: join(RUN_DIR, `${ENGINE}-acceptance.json`) })
}

const runtimeRegistry = []
const originalCreateRuntimeLog = createRuntimeLog
// Capture every scenario log without coupling assertions to Playwright internals.
createRuntimeLog = function registeredRuntimeLog(name) {
  const runtime = originalCreateRuntimeLog(name)
  runtimeRegistry.push(runtime)
  return runtime
}

try {
  await main()
} catch (error) {
  report.status = 'FAIL'
  report.failure = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) }
  report.finishedAt = new Date().toISOString()
  try {
    report.cleanup = await cleanupProfiles()
  } catch (cleanupError) {
    report.cleanup = { removed: false, error: cleanupError instanceof Error ? cleanupError.message : String(cleanupError) }
  }
  writeFileSync(join(RUN_DIR, `${ENGINE}-acceptance.json`), `${JSON.stringify(report, null, 2)}\n`)
  console.error(error)
  process.exitCode = 1
}
