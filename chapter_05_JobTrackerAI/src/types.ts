export type JobStatus =
  | 'wishlist'
  | 'applied'
  | 'followup'
  | 'interview'
  | 'offer'
  | 'rejected'

export interface Job {
  id: string
  company: string
  role: string
  jobUrl?: string
  resume?: string
  dateApplied: string
  salaryRange?: string
  notes?: string
  status: JobStatus
  order: number
  offerSalary?: string
  offerDeadline?: string
  createdAt: string
  updatedAt: string
}

export interface ReorderChange {
  id: string
  status: JobStatus
  order: number
}

export interface ImportResult {
  added: number
  updated: number
}

export interface JobFormValues {
  company: string
  role: string
  jobUrl: string
  resume: string
  dateApplied: string
  salaryRange: string
  notes: string
  status: JobStatus
  offerSalary: string
  offerDeadline: string
}
