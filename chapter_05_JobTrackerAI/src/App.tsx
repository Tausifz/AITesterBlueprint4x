import { useCallback, useEffect, useState } from 'react'
import type { Job, JobFormValues } from './types'
import { useJobs } from './hooks/useJobs'
import { Board } from './components/Board'
import { JobFormModal } from './components/JobFormModal'
import { ConfirmDialog } from './components/ConfirmDialog'
import { Toast, useToast } from './components/Toast'

export default function App() {
  const {
    jobs,
    loading,
    loadError,
    actionError,
    reload,
    addJob,
    updateJob,
    deleteJob,
    reorderJobs,
    importJobs,
    clearActionError,
  } = useJobs()
  const { toasts, show, dismiss } = useToast()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Job | null>(null)

  useEffect(() => {
    if (loadError) show(loadError)
  }, [loadError, show])

  useEffect(() => {
    if (actionError) {
      show(actionError)
      clearActionError()
    }
  }, [actionError, clearActionError, show])

  const openAddModal = useCallback(() => {
    setEditingJob(null)
    setModalOpen(true)
  }, [])

  const openEditModal = useCallback((job: Job) => {
    setEditingJob(job)
    setModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setModalOpen(false)
    setEditingJob(null)
  }, [])

  const handleSave = useCallback(
    async (values: JobFormValues): Promise<boolean> => {
      const saved = editingJob
        ? await updateJob(editingJob.id, values)
        : await addJob(values)
      if (saved) {
        show(editingJob ? 'Job updated.' : 'Job added.', 'success')
      }
      return saved
    },
    [addJob, editingJob, show, updateJob],
  )

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return
    const deleted = await deleteJob(deleteTarget.id)
    if (deleted) {
      show('Job deleted.', 'success')
      if (editingJob?.id === deleteTarget.id) closeModal()
      setDeleteTarget(null)
    }
  }, [closeModal, deleteJob, deleteTarget, editingJob, show])

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Board
        jobs={jobs}
        loading={loading}
        loadError={loadError}
        onAddJob={openAddModal}
        onEditJob={openEditModal}
        onDeleteJob={setDeleteTarget}
        onRetryLoad={reload}
        onReorderJobs={reorderJobs}
        onImportJobs={importJobs}
        notify={show}
      />

      {modalOpen && (
        <JobFormModal
          job={editingJob}
          jobs={jobs}
          onClose={closeModal}
          onSave={handleSave}
          onDelete={editingJob ? () => setDeleteTarget(editingJob) : undefined}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete job"
          message={`Delete "${deleteTarget.company} — ${deleteTarget.role}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => void confirmDelete()}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <Toast toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
