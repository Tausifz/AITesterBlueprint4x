import { useCallback, useEffect, useMemo, useState } from 'react'
import type { UniqueIdentifier } from '@dnd-kit/core'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  defaultDropAnimation,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragOverEvent,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import type { ImportResult, Job, JobStatus, ReorderChange } from '../types'
import { COLUMNS } from '../constants'
import { buildContainers } from '../utils/jobs'
import {
  matchesSearch,
  sortColumnJobs,
  type SortMode,
} from '../utils/filterSort'
import { downloadExport, parseImportFile } from '../utils/exportImport'
import { Column } from './Column'
import { JobCardContent } from './JobCard'
import { Toolbar } from './Toolbar'
import { ConfirmDialog } from './ConfirmDialog'
import type { ToastKind } from './Toast'

interface BoardProps {
  jobs: Job[]
  loading: boolean
  loadError: string | null
  onAddJob: () => void
  onEditJob: (job: Job) => void
  onDeleteJob: (job: Job) => void
  onRetryLoad: () => void
  onReorderJobs: (changes: ReorderChange[]) => Promise<boolean>
  onImportJobs: (jobs: Job[]) => Promise<ImportResult | null>
  notify: (message: string, kind?: ToastKind) => void
}

interface PendingImport {
  jobs: Job[]
  invalidCount: number
  added: number
  updated: number
}

function columnAccent(status: JobStatus): string {
  return COLUMNS.find((column) => column.key === status)?.accent ?? ''
}

const pointerAwareCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args)
  return pointerCollisions.length > 0
    ? pointerCollisions
    : closestCorners(args)
}

export function Board({
  jobs,
  loading,
  loadError,
  onAddJob,
  onEditJob,
  onDeleteJob,
  onRetryLoad,
  onReorderJobs,
  onImportJobs,
  notify,
}: BoardProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('manual')
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [containers, setContainers] = useState<Record<JobStatus, string[]>>(
    () => buildContainers(jobs),
  )
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const dragDisabled = sortMode !== 'manual' || searchQuery !== ''

  useEffect(() => {
    if (activeId === null) setContainers(buildContainers(jobs))
  }, [jobs, activeId])

  const jobById = useCallback(
    (id: UniqueIdentifier): Job | undefined =>
      jobs.find((job) => job.id === id),
    [jobs],
  )

  const containerOf = useCallback(
    (id: UniqueIdentifier): JobStatus | null => {
      const key = String(id)
      for (const column of COLUMNS) {
        if (containers[column.key].includes(key)) return column.key
      }
      for (const column of COLUMNS) {
        if (column.key === key) return column.key
      }
      return null
    },
    [containers],
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id)
  }, [])

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event
      if (!over) return
      const activeContainer = containerOf(active.id)
      const overContainer = containerOf(over.id)
      if (!activeContainer || !overContainer || activeContainer === overContainer) {
        return
      }
      const activeKey = String(active.id)
      const overKey = String(over.id)
      setContainers((prev) => {
        const activeIds = prev[activeContainer]
        const overIds = prev[overContainer]
        const overIndex = overIds.indexOf(overKey)
        const newIndex = overIndex >= 0 ? overIndex : overIds.length
        return {
          ...prev,
          [activeContainer]: activeIds.filter((id) => id !== activeKey),
          [overContainer]: [
            ...overIds.slice(0, newIndex),
            activeKey,
            ...overIds.slice(newIndex),
          ],
        }
      })
    },
    [containerOf],
  )

  const handleDragEnd = useCallback(
    async ({ active, over }: DragEndEvent) => {
      setActiveId(null)
      if (!over) return

      const activeJob = jobById(active.id)
      const overJob = jobById(over.id)
      const overIsActive = String(over.id) === String(active.id)
      const destinationStatus = containerOf(over.id)
      if (!activeJob || !destinationStatus) return

      const nextContainers = buildContainers(jobs)
      const sourceIds = nextContainers[activeJob.status]
      const destinationIds = nextContainers[destinationStatus]
      const sourceIndex = sourceIds.indexOf(activeJob.id)
      if (sourceIndex < 0) return

      const activeRect = active.rect.current.translated
      const isBelowOverItem =
        overJob !== undefined &&
        !overIsActive &&
        activeRect !== null &&
        activeRect.top > over.rect.top + over.rect.height / 2

      if (activeJob.status === destinationStatus) {
        const overIndex = overJob && !overIsActive
          ? sourceIds.indexOf(overJob.id)
          : sourceIndex
        if (overIndex < 0) return
        const destinationIndex = Math.min(
          overIndex + (isBelowOverItem ? 1 : 0),
          sourceIds.length - 1,
        )
        nextContainers[activeJob.status] = arrayMove(
          sourceIds,
          sourceIndex,
          destinationIndex,
        )
      } else {
        nextContainers[activeJob.status] = sourceIds.filter(
          (id) => id !== activeJob.id,
        )
        const targetIndex = overJob && !overIsActive
          ? destinationIds.indexOf(overJob.id) + (isBelowOverItem ? 1 : 0)
          : destinationIds.length
        destinationIds.splice(targetIndex, 0, activeJob.id)
      }

      const changes: ReorderChange[] = []
      for (const column of COLUMNS) {
        nextContainers[column.key].forEach((id, index) => {
          const job = jobById(id)
          if (job && (job.status !== column.key || job.order !== index)) {
            changes.push({ id, status: column.key, order: index })
          }
        })
      }
      await onReorderJobs(changes)
    },
    [containerOf, jobById, jobs, onReorderJobs],
  )

  const handleDragCancel = useCallback(() => {
    setActiveId(null)
  }, [])

  const activeJob = activeId !== null ? jobById(activeId) ?? null : null

  const columnJobLists = useMemo(() => {
    const byId = new Map(jobs.map((job) => [job.id, job]))
    return COLUMNS.map((column) => {
      let ids: string[]
      if (sortMode === 'manual') {
        ids = (containers[column.key] ?? []).filter((id) => {
          const job = byId.get(id)
          return job !== undefined && matchesSearch(job, searchQuery)
        })
      } else {
        const columnJobs = jobs.filter(
          (job) =>
            job.status === column.key && matchesSearch(job, searchQuery),
        )
        ids = sortColumnJobs(columnJobs, sortMode).map((job) => job.id)
      }
      return ids
        .map((id) => byId.get(id))
        .filter((job): job is Job => job !== undefined)
    })
  }, [jobs, containers, searchQuery, sortMode])

  const handleImportFile = useCallback(
    async (file: File) => {
      try {
        const text = await file.text()
        const result = parseImportFile(text)
        if (result.error) {
          notify(result.error, 'error')
          return
        }
        if (result.jobs.length === 0) {
          notify('No valid jobs found in that file.', 'error')
          return
        }
        const existingIds = new Set(jobs.map((job) => job.id))
        let added = 0
        let updated = 0
        for (const job of result.jobs) {
          if (existingIds.has(job.id)) updated++
          else added++
        }
        setPendingImport({
          jobs: result.jobs,
          invalidCount: result.invalidCount,
          added,
          updated,
        })
      } catch {
        notify('Could not read that file.', 'error')
      }
    },
    [jobs, notify],
  )

  const confirmImport = useCallback(async () => {
    if (!pendingImport) return
    const result = await onImportJobs(pendingImport.jobs)
    if (result) {
      const count = pendingImport.jobs.length
      notify(
        `Imported ${count} job${count === 1 ? '' : 's'} — ${result.added} added, ${result.updated} updated.`,
        'success',
      )
    }
    setPendingImport(null)
  }, [onImportJobs, notify, pendingImport])

  const importMessage = pendingImport
    ? `Import ${pendingImport.jobs.length} job${
        pendingImport.jobs.length === 1 ? '' : 's'
      }? ${pendingImport.added} will be added and ${pendingImport.updated} will be updated.${
        pendingImport.invalidCount > 0
          ? ` ${pendingImport.invalidCount} invalid record${
              pendingImport.invalidCount === 1 ? '' : 's'
            } will be skipped.`
          : ''
      }`
    : ''

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Toolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortMode={sortMode}
        onSortChange={setSortMode}
        onExport={() => downloadExport(jobs)}
        onImportFile={(file) => void handleImportFile(file)}
        onAddJob={onAddJob}
      />

      {loading ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
          <svg
            className="h-6 w-6 animate-spin text-indigo-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-sm">Loading jobs…</p>
        </div>
      ) : loadError ? (
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="max-w-md rounded-xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-900 dark:bg-rose-950">
            <p className="text-sm font-medium text-rose-800 dark:text-rose-200">
              Something went wrong
            </p>
            <p className="mt-1 text-sm text-rose-700 dark:text-rose-300">
              {loadError}
            </p>
            <button
              type="button"
              onClick={onRetryLoad}
              className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="max-w-sm rounded-xl border border-dashed border-slate-300 bg-white/60 p-8 text-center dark:border-slate-700 dark:bg-slate-900/60">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-500 dark:bg-indigo-500/20 dark:text-indigo-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Your board is empty
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Add your first job to start tracking applications, interviews,
              and offers.
            </p>
            <button
              type="button"
              onClick={onAddJob}
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              + Add Your First Job
            </button>
          </div>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={pointerAwareCollisionDetection}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={(event) => void handleDragEnd(event)}
          onDragCancel={handleDragCancel}
        >
          <div className="flex min-h-0 flex-1 items-stretch gap-4 overflow-x-auto bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/60 px-4 py-4 sm:px-5 sm:py-5 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950/30">
            {COLUMNS.map((column, index) => (
              <Column
                key={column.key}
                column={column}
                jobs={columnJobLists[index]}
                dragDisabled={dragDisabled}
                emptyLabel={
                  searchQuery ? 'No matching jobs' : 'No jobs here yet'
                }
                onEditJob={onEditJob}
                onDeleteJob={onDeleteJob}
              />
            ))}
          </div>
          <DragOverlay dropAnimation={defaultDropAnimation}>
            {activeJob ? (
              <JobCardContent
                job={activeJob}
                accent={columnAccent(activeJob.status)}
                overlay
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {pendingImport && (
        <ConfirmDialog
          title="Import jobs"
          message={importMessage}
          confirmLabel="Import"
          onConfirm={() => void confirmImport()}
          onCancel={() => setPendingImport(null)}
        />
      )}
    </div>
  )
}
