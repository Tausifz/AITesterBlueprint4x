import type { Job } from '../types'
import { isJobStatus } from '../constants'
import { todayISO } from './date'

export interface ExportPayload {
  app: string
  version: number
  exportedAt: string
  jobs: Job[]
}

export interface ParseImportResult {
  jobs: Job[]
  invalidCount: number
  error: string | null
}

export function buildExportPayload(jobs: Job[]): ExportPayload {
  return {
    app: 'job-tracker',
    version: 1,
    exportedAt: new Date().toISOString(),
    jobs,
  }
}

export function downloadExport(jobs: Job[]): void {
  const payload = buildExportPayload(jobs)
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `job-tracker-export-${todayISO()}.json`
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function normalizeJobRecord(item: unknown, now: string): Job | null {
  if (typeof item !== 'object' || item === null) return null
  const rec = item as Record<string, unknown>
  if (typeof rec.id !== 'string' || !rec.id) return null
  if (typeof rec.company !== 'string' || !rec.company.trim()) return null
  if (typeof rec.role !== 'string' || !rec.role.trim()) return null
  if (typeof rec.status !== 'string' || !isJobStatus(rec.status)) return null
  if (
    typeof rec.dateApplied !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(rec.dateApplied)
  ) {
    return null
  }
  if (typeof rec.order !== 'number' || !Number.isFinite(rec.order)) return null

  return {
    id: rec.id,
    company: rec.company.trim(),
    role: rec.role.trim(),
    jobUrl: typeof rec.jobUrl === 'string' && rec.jobUrl ? rec.jobUrl : undefined,
    resume: typeof rec.resume === 'string' && rec.resume ? rec.resume : undefined,
    dateApplied: rec.dateApplied,
    salaryRange:
      typeof rec.salaryRange === 'string' && rec.salaryRange
        ? rec.salaryRange
        : undefined,
    notes: typeof rec.notes === 'string' && rec.notes ? rec.notes : undefined,
    status: rec.status,
    order: rec.order,
    offerSalary:
      typeof rec.offerSalary === 'string' && rec.offerSalary
        ? rec.offerSalary
        : undefined,
    offerDeadline:
      typeof rec.offerDeadline === 'string' && rec.offerDeadline
        ? rec.offerDeadline
        : undefined,
    createdAt:
      typeof rec.createdAt === 'string' && rec.createdAt ? rec.createdAt : now,
    updatedAt:
      typeof rec.updatedAt === 'string' && rec.updatedAt ? rec.updatedAt : now,
  }
}

export function parseImportFile(text: string): ParseImportResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { jobs: [], invalidCount: 0, error: 'That file is not valid JSON.' }
  }

  const raw = Array.isArray(parsed)
    ? parsed
    : typeof parsed === 'object' && parsed !== null
      ? (parsed as Record<string, unknown>).jobs
      : undefined

  if (!Array.isArray(raw)) {
    return {
      jobs: [],
      invalidCount: 0,
      error: 'No "jobs" array found in that file.',
    }
  }

  const now = new Date().toISOString()
  const jobs: Job[] = []
  let invalidCount = 0
  for (const item of raw) {
    const job = normalizeJobRecord(item, now)
    if (job) jobs.push(job)
    else invalidCount++
  }

  return { jobs, invalidCount, error: null }
}
