import type { JobStatus } from '../types'

export function todayISO(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseISODate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, (month || 1) - 1, day || 1)
}

const MS_PER_DAY = 86_400_000

export function daysBetween(fromISO: string, toISO: string): number {
  const from = parseISODate(fromISO).getTime()
  const to = parseISODate(toISO).getTime()
  return Math.round((to - from) / MS_PER_DAY)
}

export function appliedLabel(dateApplied: string, status: JobStatus): string {
  if (status === 'wishlist') return 'Not applied yet'
  const days = daysBetween(dateApplied, todayISO())
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

export type OfferDeadlineTone = 'neutral' | 'warn' | 'expired'

export interface OfferDeadlineInfo {
  label: string
  tone: OfferDeadlineTone
}

export function offerDeadlineInfo(deadlineISO: string): OfferDeadlineInfo {
  const days = daysBetween(todayISO(), deadlineISO)
  if (days < 0) return { label: 'Expired', tone: 'expired' }
  if (days === 0) return { label: 'Due today', tone: 'warn' }
  if (days === 1) return { label: '1 day left', tone: 'warn' }
  if (days <= 3) return { label: `${days} days left`, tone: 'warn' }
  return { label: `${days} days left`, tone: 'neutral' }
}
