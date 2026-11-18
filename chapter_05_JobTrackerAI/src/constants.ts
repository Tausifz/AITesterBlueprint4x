import type { JobStatus } from './types'

export const DB_NAME = 'job-tracker-db'
export const DB_VERSION = 1
export const STORE_NAME = 'jobs'

export interface ColumnDef {
  key: JobStatus
  label: string
  accent: string
}

export const COLUMNS: ColumnDef[] = [
  { key: 'wishlist', label: 'Wishlist', accent: 'border-l-sky-500' },
  { key: 'applied', label: 'Applied', accent: 'border-l-indigo-500' },
  { key: 'followup', label: 'Follow-up', accent: 'border-l-amber-500' },
  { key: 'interview', label: 'Interview', accent: 'border-l-violet-500' },
  { key: 'offer', label: 'Offer Received', accent: 'border-l-emerald-500' },
  { key: 'rejected', label: 'Rejected', accent: 'border-l-rose-500' },
]

export const SEED_RESUMES = ['SDE_Resume_v3', 'QA_Lead_Resume']

export const NONE_RESUME_VALUE = '__none__'
export const ADD_NEW_RESUME_VALUE = '__add_new__'

export const COMPANY_MAX_LENGTH = 100
export const ROLE_MAX_LENGTH = 100
export const RESUME_NAME_MAX_LENGTH = 60

export const OFFER_WARN_DAYS = 3

export const THEME_STORAGE_KEY = 'job-tracker-theme'

export function isJobStatus(value: string): value is JobStatus {
  return COLUMNS.some((column) => column.key === value)
}
