import type { HTMLAttributes } from 'react'
import type { Job } from '../types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { appliedLabel, offerDeadlineInfo } from '../utils/date'

const deadlineBadgeClasses = {
  neutral:
    'rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  warn: 'rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  expired:
    'rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
} as const

interface JobCardContentProps {
  job: Job
  accent: string
  onEdit?: () => void
  onDelete?: () => void
  dragHandleProps?: HTMLAttributes<HTMLButtonElement>
  overlay?: boolean
  className?: string
}

export function JobCardContent({
  job,
  accent,
  onEdit,
  onDelete,
  dragHandleProps,
  overlay = false,
  className = '',
}: JobCardContentProps) {
  const applied = appliedLabel(job.dateApplied, job.status)
  const deadline =
    job.status === 'offer' && job.offerDeadline
      ? offerDeadlineInfo(job.offerDeadline)
      : null

  return (
    <article
      className={`group relative rounded-lg border border-slate-200 border-l-4 bg-white p-3 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 ${
        overlay
          ? 'rotate-2 shadow-2xl ring-2 ring-indigo-300 dark:ring-indigo-500'
          : 'cursor-pointer'
      } ${accent} ${className}`}
      onClick={onEdit}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
            {job.company}
          </h3>
          <p className="mt-0.5 truncate text-xs text-slate-600 dark:text-slate-400">
            {job.role}
          </p>
        </div>
        {!overlay && (
          <div className="flex shrink-0 items-center gap-1">
            {dragHandleProps && (
              <button
                type="button"
                {...dragHandleProps}
                aria-label={`Drag ${job.company} — ${job.role} to reorder`}
                title="Drag to move"
                className="touch-none cursor-grab rounded-md bg-slate-50 p-1 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 active:cursor-grabbing dark:bg-slate-700/70 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-indigo-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M8.5 5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm7 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM8.5 10.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm7 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3zM8.5 16a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm7 0a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
                </svg>
              </button>
            )}
            {job.jobUrl && (
              <a
                href={job.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => event.stopPropagation()}
                aria-label={`Open ${job.company} job posting in a new tab`}
                title="Open job posting"
                className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                </svg>
              </a>
            )}
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onDelete?.()
              }}
              aria-label={`Delete ${job.company} — ${job.role}`}
              title="Delete job"
              className="rounded p-1 text-slate-400 opacity-0 hover:bg-rose-50 hover:text-rose-600 focus:opacity-100 group-hover:opacity-100 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-rose-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {job.resume && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {job.resume}
          </span>
        )}
        <span className="text-[11px] text-slate-400 dark:text-slate-500">
          {applied}
        </span>
      </div>

      {job.status === 'offer' && (job.offerSalary || deadline) && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2 dark:border-slate-700">
          {job.offerSalary && (
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              {job.offerSalary}
            </span>
          )}
          {deadline && (
            <span className={deadlineBadgeClasses[deadline.tone]}>
              {deadline.label}
            </span>
          )}
        </div>
      )}
    </article>
  )
}

interface JobCardProps {
  job: Job
  accent: string
  dragDisabled: boolean
  onEdit: () => void
  onDelete: () => void
}

export function JobCard({
  job,
  accent,
  dragDisabled,
  onEdit,
  onDelete,
}: JobCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: job.id, disabled: dragDisabled })
  const dragHandleProps: HTMLAttributes<HTMLButtonElement> = {
    ...attributes,
    ...listeners,
    onClick: (event) => event.stopPropagation(),
  }
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group ${isDragging ? 'opacity-40' : ''}`}
    >
      <JobCardContent
        job={job}
        accent={accent}
        onEdit={onEdit}
        onDelete={onDelete}
        dragHandleProps={dragDisabled ? undefined : dragHandleProps}
      />
    </div>
  )
}
