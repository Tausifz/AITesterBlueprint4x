import type { Job } from '../types'
import {
  ADD_NEW_RESUME_VALUE,
  NONE_RESUME_VALUE,
  SEED_RESUMES,
} from '../constants'

export function collectResumeNames(jobs: Job[]): string[] {
  const names = new Set<string>()
  for (const job of jobs) {
    const name = job.resume?.trim()
    if (name) names.add(name)
  }
  return [...names].sort((a, b) => a.localeCompare(b))
}

export function mostRecentlyUsedResume(jobs: Job[]): string | undefined {
  let latest: { name: string; updatedAt: string } | undefined
  for (const job of jobs) {
    const name = job.resume?.trim()
    if (!name) continue
    if (!latest || job.updatedAt > latest.updatedAt) {
      latest = { name, updatedAt: job.updatedAt }
    }
  }
  return latest?.name
}

export function isDuplicateResumeName(jobs: Job[], name: string): boolean {
  const target = name.trim().toLowerCase()
  if (!target) return false
  return collectResumeNames(jobs).some(
    (existing) => existing.toLowerCase() === target,
  )
}

export function getResumeOptions(jobs: Job[]): string[] {
  const options = [NONE_RESUME_VALUE]
  if (jobs.length === 0) {
    options.push(...SEED_RESUMES)
  }
  options.push(...collectResumeNames(jobs))
  options.push(ADD_NEW_RESUME_VALUE)
  return options
}
