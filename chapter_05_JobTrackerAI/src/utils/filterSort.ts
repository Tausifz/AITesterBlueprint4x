import type { Job } from '../types'
import { sortByOrder } from './jobs'

export type SortMode =
  | 'manual'
  | 'date-newest'
  | 'date-oldest'
  | 'company-az'
  | 'updated-newest'

export const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'manual', label: 'Manual order' },
  { value: 'date-newest', label: 'Date applied (newest)' },
  { value: 'date-oldest', label: 'Date applied (oldest)' },
  { value: 'company-az', label: 'Company (A–Z)' },
  { value: 'updated-newest', label: 'Recently updated' },
]

export function matchesSearch(job: Job, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [job.company, job.role, job.resume ?? '', job.notes ?? ''].some(
    (field) => field.toLowerCase().includes(q),
  )
}

export function sortColumnJobs(jobs: Job[], mode: SortMode): Job[] {
  switch (mode) {
    case 'manual':
      return sortByOrder(jobs)
    case 'date-newest':
      return [...jobs].sort(
        (a, b) => b.dateApplied.localeCompare(a.dateApplied) || a.order - b.order,
      )
    case 'date-oldest':
      return [...jobs].sort(
        (a, b) => a.dateApplied.localeCompare(b.dateApplied) || a.order - b.order,
      )
    case 'company-az':
      return [...jobs].sort(
        (a, b) => a.company.localeCompare(b.company) || a.order - b.order,
      )
    case 'updated-newest':
      return [...jobs].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }
}
