import type { Job, JobStatus } from '../types'
import type { ColumnDef } from '../constants'
import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { JobCard } from './JobCard'

const statusDots: Record<JobStatus, string> = {
  wishlist: 'bg-sky-500',
  applied: 'bg-indigo-500',
  followup: 'bg-amber-500',
  interview: 'bg-violet-500',
  offer: 'bg-emerald-500',
  rejected: 'bg-rose-500',
}

interface ColumnProps {
  column: ColumnDef
  jobs: Job[]
  dragDisabled: boolean
  emptyLabel: string
  onEditJob: (job: Job) => void
  onDeleteJob: (job: Job) => void
}

export function Column({
  column,
  jobs,
  dragDisabled,
  emptyLabel,
  onEditJob,
  onDeleteJob,
}: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.key,
    disabled: dragDisabled,
  })

  return (
    <section className="flex h-full min-w-[280px] max-w-[360px] flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-3.5 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
          <span
            aria-hidden="true"
            className={`h-2.5 w-2.5 rounded-full ${statusDots[column.key]}`}
          />
          {column.label}
        </h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {jobs.length}
        </span>
      </header>
      <div
        ref={setNodeRef}
        className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3"
      >
        {jobs.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50/80 px-3 py-7 text-center text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400">
            {emptyLabel}
          </p>
        ) : (
          <SortableContext
            items={jobs.map((job) => job.id)}
            strategy={verticalListSortingStrategy}
          >
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                accent={column.accent}
                dragDisabled={dragDisabled}
                onEdit={() => onEditJob(job)}
                onDelete={() => onDeleteJob(job)}
              />
            ))}
          </SortableContext>
        )}
      </div>
    </section>
  )
}
