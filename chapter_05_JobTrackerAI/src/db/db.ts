import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import { DB_NAME, DB_VERSION, STORE_NAME } from '../constants'
import type { Job } from '../types'

export interface JobTrackerDB extends DBSchema {
  jobs: {
    key: string
    value: Job
    indexes: {
      status: Job['status']
      dateApplied: string
    }
  }
}

let dbPromise: Promise<IDBPDatabase<JobTrackerDB>> | null = null

export function getDB(): Promise<IDBPDatabase<JobTrackerDB>> {
  if (!dbPromise) {
    dbPromise = openDB<JobTrackerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('status', 'status')
        store.createIndex('dateApplied', 'dateApplied')
      },
    })
  }
  return dbPromise
}

export async function getAllJobs(): Promise<Job[]> {
  const db = await getDB()
  return db.getAll(STORE_NAME)
}

export async function putJob(job: Job): Promise<void> {
  const db = await getDB()
  await db.put(STORE_NAME, job)
}

export async function putJobs(jobs: Job[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(STORE_NAME, 'readwrite')
  await Promise.all([...jobs.map((job) => tx.store.put(job)), tx.done])
}

export async function deleteJobById(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}
