import {
  useEffect,
  useId,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from 'react'
import type { Job, JobFormValues, JobStatus } from '../types'
import {
  ADD_NEW_RESUME_VALUE,
  COLUMNS,
  COMPANY_MAX_LENGTH,
  NONE_RESUME_VALUE,
  RESUME_NAME_MAX_LENGTH,
  ROLE_MAX_LENGTH,
} from '../constants'
import { todayISO } from '../utils/date'
import {
  getResumeOptions,
  isDuplicateResumeName,
  mostRecentlyUsedResume,
} from '../utils/resumes'

interface JobFormModalProps {
  job: Job | null
  jobs: Job[]
  onClose: () => void
  onSave: (values: JobFormValues) => Promise<boolean>
  onDelete?: () => void
}

interface FormErrors {
  company?: string
  role?: string
  jobUrl?: string
  resume?: string
}

function initialValues(job: Job | null, jobs: Job[]): JobFormValues {
  return {
    company: job?.company ?? '',
    role: job?.role ?? '',
    jobUrl: job?.jobUrl ?? '',
    resume: job?.resume ?? mostRecentlyUsedResume(jobs) ?? NONE_RESUME_VALUE,
    dateApplied: job?.dateApplied ?? todayISO(),
    salaryRange: job?.salaryRange ?? '',
    notes: job?.notes ?? '',
    status: job?.status ?? 'wishlist',
    offerSalary: job?.offerSalary ?? '',
    offerDeadline: job?.offerDeadline ?? '',
  }
}

function validateForm(
  values: JobFormValues,
  addingNewResume: boolean,
  newResumeName: string,
  jobs: Job[],
): FormErrors {
  const errors: FormErrors = {}

  const company = values.company.trim()
  if (!company) {
    errors.company = 'Company is required.'
  } else if (company.length > COMPANY_MAX_LENGTH) {
    errors.company = `Company must be ${COMPANY_MAX_LENGTH} characters or fewer.`
  }

  const role = values.role.trim()
  if (!role) {
    errors.role = 'Role is required.'
  } else if (role.length > ROLE_MAX_LENGTH) {
    errors.role = `Role must be ${ROLE_MAX_LENGTH} characters or fewer.`
  }

  const url = values.jobUrl.trim()
  if (url) {
    try {
      const parsed = new URL(url)
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        errors.jobUrl = 'Enter a valid http(s) URL.'
      }
    } catch {
      errors.jobUrl = 'Enter a valid http(s) URL.'
    }
  }

  if (addingNewResume) {
    const name = newResumeName.trim()
    if (!name) {
      errors.resume = 'Enter a resume name.'
    } else if (name.length > RESUME_NAME_MAX_LENGTH) {
      errors.resume = `Resume name must be ${RESUME_NAME_MAX_LENGTH} characters or fewer.`
    } else if (isDuplicateResumeName(jobs, name)) {
      errors.resume = `"${name}" is already in your resume list.`
    }
  }

  return errors
}

const inputClasses =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500'

const labelClasses = 'mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400'

const errorClasses = 'mt-1 text-xs text-rose-600'

export function JobFormModal({
  job,
  jobs,
  onClose,
  onSave,
  onDelete,
}: JobFormModalProps) {
  const titleId = useId()
  const [values, setValues] = useState<JobFormValues>(() =>
    initialValues(job, jobs),
  )
  const [addingNewResume, setAddingNewResume] = useState(false)
  const [newResumeName, setNewResumeName] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  const resumeOptions = useMemo(() => getResumeOptions(jobs), [jobs])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  const updateField =
    (field: keyof JobFormValues) =>
    (
      event: ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const value = event.target.value
      setValues((prev) => ({ ...prev, [field]: value }))
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const status = event.target.value as JobStatus
    setValues((prev) => ({
      ...prev,
      status,
      ...(status !== 'offer' ? { offerSalary: '', offerDeadline: '' } : {}),
    }))
  }

  const handleResumeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    setValues((prev) => ({ ...prev, resume: value }))
    setAddingNewResume(value === ADD_NEW_RESUME_VALUE)
    if (value !== ADD_NEW_RESUME_VALUE) setNewResumeName('')
    setErrors((prev) => ({ ...prev, resume: undefined }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validateForm(values, addingNewResume, newResumeName, jobs)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const resolved: JobFormValues = addingNewResume
      ? { ...values, resume: newResumeName.trim() }
      : values.resume === NONE_RESUME_VALUE
        ? { ...values, resume: '' }
        : values

    const saved = await onSave(resolved)
    if (saved) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-start justify-center overflow-y-auto bg-slate-900/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="my-auto w-full max-w-lg rounded-xl bg-white shadow-xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <h2 id={titleId} className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {job ? 'Edit Job' : 'Add Job'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-4 px-5 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={`${titleId}-company`} className={labelClasses}>
                  Company *
                </label>
                <input
                  id={`${titleId}-company`}
                  type="text"
                  className={inputClasses}
                  placeholder="Acme Inc."
                  value={values.company}
                  maxLength={COMPANY_MAX_LENGTH}
                  onChange={updateField('company')}
                />
                {errors.company && (
                  <p className={errorClasses}>{errors.company}</p>
                )}
              </div>
              <div>
                <label htmlFor={`${titleId}-role`} className={labelClasses}>
                  Role *
                </label>
                <input
                  id={`${titleId}-role`}
                  type="text"
                  className={inputClasses}
                  placeholder="QA Engineer"
                  value={values.role}
                  maxLength={ROLE_MAX_LENGTH}
                  onChange={updateField('role')}
                />
                {errors.role && <p className={errorClasses}>{errors.role}</p>}
              </div>
            </div>

            <div>
              <label htmlFor={`${titleId}-jobUrl`} className={labelClasses}>
                Job URL
              </label>
              <input
                id={`${titleId}-jobUrl`}
                type="url"
                className={inputClasses}
                placeholder="https://careers.example.com/job/123"
                value={values.jobUrl}
                onChange={updateField('jobUrl')}
              />
              {errors.jobUrl && <p className={errorClasses}>{errors.jobUrl}</p>}
            </div>

            <div>
              <label htmlFor={`${titleId}-resume`} className={labelClasses}>
                Resume
              </label>
              <select
                id={`${titleId}-resume`}
                className={inputClasses}
                value={values.resume}
                onChange={handleResumeChange}
              >
                {resumeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === NONE_RESUME_VALUE
                      ? 'None'
                      : option === ADD_NEW_RESUME_VALUE
                        ? '+ Add new resume…'
                        : option}
                  </option>
                ))}
              </select>
              {addingNewResume && (
                <input
                  type="text"
                  className={`${inputClasses} mt-2`}
                  placeholder="New resume name (e.g. SDE_Resume_v4)"
                  value={newResumeName}
                  maxLength={RESUME_NAME_MAX_LENGTH}
                  onChange={(event) => {
                    setNewResumeName(event.target.value)
                    setErrors((prev) => ({ ...prev, resume: undefined }))
                  }}
                  aria-label="New resume name"
                />
              )}
              {errors.resume && <p className={errorClasses}>{errors.resume}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={`${titleId}-dateApplied`}
                  className={labelClasses}
                >
                  Date Applied
                </label>
                <input
                  id={`${titleId}-dateApplied`}
                  type="date"
                  className={inputClasses}
                  value={values.dateApplied}
                  onChange={updateField('dateApplied')}
                />
              </div>
              <div>
                <label
                  htmlFor={`${titleId}-salaryRange`}
                  className={labelClasses}
                >
                  Salary Range
                </label>
                <input
                  id={`${titleId}-salaryRange`}
                  type="text"
                  className={inputClasses}
                  placeholder="₹25-30 LPA"
                  value={values.salaryRange}
                  onChange={updateField('salaryRange')}
                />
              </div>
            </div>

            <div>
              <label htmlFor={`${titleId}-notes`} className={labelClasses}>
                Notes
              </label>
              <textarea
                id={`${titleId}-notes`}
                className={`${inputClasses} resize-none`}
                rows={3}
                placeholder="Recruiter name, referral info…"
                value={values.notes}
                onChange={updateField('notes')}
              />
            </div>

            <div>
              <label htmlFor={`${titleId}-status`} className={labelClasses}>
                Status
              </label>
              <select
                id={`${titleId}-status`}
                className={inputClasses}
                value={values.status}
                onChange={handleStatusChange}
              >
                {COLUMNS.map((column) => (
                  <option key={column.key} value={column.key}>
                    {column.label}
                  </option>
                ))}
              </select>
            </div>

            {values.status === 'offer' && (
              <div className="grid gap-4 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 sm:grid-cols-2 dark:border-emerald-900 dark:bg-emerald-500/10">
                <div>
                  <label
                    htmlFor={`${titleId}-offerSalary`}
                    className={labelClasses}
                  >
                    Offer Salary
                  </label>
                  <input
                    id={`${titleId}-offerSalary`}
                    type="text"
                    className={inputClasses}
                    placeholder="₹30 LPA"
                    value={values.offerSalary}
                    onChange={updateField('offerSalary')}
                  />
                </div>
                <div>
                  <label
                    htmlFor={`${titleId}-offerDeadline`}
                    className={labelClasses}
                  >
                    Reply-by Date
                  </label>
                  <input
                    id={`${titleId}-offerDeadline`}
                    type="date"
                    className={inputClasses}
                    value={values.offerDeadline}
                    onChange={updateField('offerDeadline')}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-5 py-4 dark:border-slate-800">
            {job && onDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
              >
                Delete
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                {job ? 'Save Changes' : 'Add Job'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
