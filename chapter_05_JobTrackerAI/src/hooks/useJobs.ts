import { useCallback, useEffect, useState } from 'react'
import type { ImportResult, Job, JobFormValues, ReorderChange } from '../types'
import { deleteJobById, getAllJobs, putJob, putJobs } from '../db/db'
import { buildJob, nextOrderForStatus, sortByOrder } from '../utils/jobs'

export interface UseJobsResult {
  jobs: Job[]
  loading: boolean
  loadError: string | null
  actionError: string | null
  reload: () => void
  addJob: (values: JobFormValues) => Promise<boolean>
  updateJob: (id: string, values: JobFormValues) => Promise<boolean>
  deleteJob: (id: string) => Promise<boolean>
  reorderJobs: (changes: ReorderChange[]) => Promise<boolean>
  importJobs: (incoming: Job[]) => Promise<ImportResult | null>
  clearActionError: () => void
}

export function useJobs(): UseJobsResult {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const all = await getAllJobs()
      setJobs(sortByOrder(all))
    } catch {
      setLoadError(
        'Could not load your jobs from browser storage. Make sure storage is available and try again.',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const addJob = useCallback(
    async (values: JobFormValues): Promise<boolean> => {
      try {
        const order = nextOrderForStatus(jobs, values.status)
        const job = buildJob(values, order)
        await putJob(job)
        setJobs((prev) => sortByOrder([...prev, job]))
        return true
      } catch {
        setActionError('Could not save the job. Please try again.')
        return false
      }
    },
    [jobs],
  )

  const updateJob = useCallback(
    async (id: string, values: JobFormValues): Promise<boolean> => {
      try {
        const existing = jobs.find((job) => job.id === id)
        if (!existing) {
          setActionError('That job no longer exists. Refresh and try again.')
          return false
        }
        const order =
          values.status === existing.status
            ? existing.order
            : nextOrderForStatus(jobs, values.status)
        const updated = buildJob(values, order, existing)
        await putJob(updated)
        setJobs((prev) =>
          sortByOrder(prev.map((job) => (job.id === id ? updated : job))),
        )
        return true
      } catch {
        setActionError('Could not update the job. Please try again.')
        return false
      }
    },
    [jobs],
  )

  const deleteJob = useCallback(async (id: string): Promise<boolean> => {
    try {
      await deleteJobById(id)
      setJobs((prev) => prev.filter((job) => job.id !== id))
      return true
    } catch {
      setActionError('Could not delete the job. Please try again.')
      return false
    }
  }, [])

  const reorderJobs = useCallback(
    async (changes: ReorderChange[]): Promise<boolean> => {
      if (changes.length === 0) return true
      try {
        const byId = new Map(jobs.map((job) => [job.id, job]))
        const now = new Date().toISOString()
        const updated = changes.flatMap(({ id, status, order }) => {
          const job = byId.get(id)
          if (!job || (job.status === status && job.order === order)) return []
          return [{ ...job, status, order, updatedAt: now }]
        })
        if (updated.length === 0) return true
        await putJobs(updated)
        setJobs((prev) => {
          const merged = new Map(updated.map((job) => [job.id, job]))
          return sortByOrder(prev.map((job) => merged.get(job.id) ?? job))
        })
        return true
      } catch {
        setActionError('Could not save the new order. Please try again.')
        return false
      }
    },
    [jobs],
  )

  const importJobs = useCallback(
    async (incoming: Job[]): Promise<ImportResult | null> => {
      try {
        await putJobs(incoming)
        setJobs((prev) => {
          const incomingIds = new Map(incoming.map((job) => [job.id, job]))
          const merged = [
            ...incoming,
            ...prev.filter((job) => !incomingIds.has(job.id)),
          ]
          return sortByOrder(merged)
        })
        const existingIds = new Set(jobs.map((job) => job.id))
        let added = 0
        let updated = 0
        for (const job of incoming) {
          if (existingIds.has(job.id)) updated++
          else added++
        }
        return { added, updated }
      } catch {
        setActionError('Could not import jobs. Please try again.')
        return null
      }
    },
    [jobs],
  )

  const clearActionError = useCallback(() => setActionError(null), [])

  return {
    jobs,
    loading,
    loadError,
    actionError,
    reload: load,
    addJob,
    updateJob,
    deleteJob,
    reorderJobs,
    importJobs,
    clearActionError,
  }
}
