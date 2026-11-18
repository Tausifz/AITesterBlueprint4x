import type { Job, JobFormValues, JobStatus } from '../types'
import { COLUMNS } from '../constants'

export function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function nextOrderForStatus(jobs: Job[], status: JobStatus): number {
  let max = -1
  for (const job of jobs) {
    if (job.status === status && job.order > max) {
      max = job.order
    }
  }
  return max + 1
}

export function sortByOrder(jobs: Job[]): Job[] {
  return [...jobs].sort((a, b) => a.order - b.order)
}

export function buildContainers(jobs: Job[]): Record<JobStatus, string[]> {
  const containers = {} as Record<JobStatus, string[]>
  for (const column of COLUMNS) containers[column.key] = []
  for (const job of sortByOrder(jobs)) containers[job.status].push(job.id)
  return containers
}

export function buildJob(values: JobFormValues, order: number, existing?: Job): Job {
  const now = new Date().toISOString()
  const isOffer = values.status === 'offer'
  return {
    id: existing?.id ?? createId(),
    company: values.company.trim(),
    role: values.role.trim(),
    jobUrl: values.jobUrl.trim() || undefined,
    resume: values.resume.trim() || undefined,
    dateApplied: values.dateApplied,
    salaryRange: values.salaryRange.trim() || undefined,
    notes: values.notes.trim() || undefined,
    status: values.status,
    order,
    offerSalary: isOffer ? values.offerSalary.trim() || undefined : undefined,
    offerDeadline: isOffer ? values.offerDeadline || undefined : undefined,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  }
}
