import "server-only"
import { randomBytes, randomUUID } from "node:crypto"
import { todayInClinic } from "./format"
import { createSeedDatabase } from "./seed"
import { storage } from "./storage"
import type { Database, Examination } from "./types"

// Demo persistence: one JSON document (see storage.ts), seeded on first use.
// Shared by every browser that hits this server, so QR links also work from a phone.
async function load(): Promise<Database> {
  const json = await storage.read()
  if (json) return JSON.parse(json) as Database
  await storage.writeIfEmpty(JSON.stringify(createSeedDatabase()))
  const seeded = await storage.read()
  if (!seeded) throw new Error("Demo database could not be initialised.")
  return JSON.parse(seeded) as Database
}

async function save(db: Database) {
  await storage.write(JSON.stringify(db))
}

// Serialize writes so concurrent server actions can't clobber each other.
let queue: Promise<unknown> = Promise.resolve()

export function mutate<T>(fn: (db: Database) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const db = await load()
    const result = await fn(db)
    await save(db)
    return result
  })
  queue = run.catch(() => {})
  return run
}

export async function listExams(): Promise<Examination[]> {
  const db = await load()
  return db.exams.toSorted((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function getExam(id: string): Promise<Examination | null> {
  const db = await load()
  return db.exams.find((e) => e.id === id) ?? null
}

export async function getExamByToken(token: string): Promise<Examination | null> {
  if (!token) return null
  const db = await load()
  return db.exams.find((e) => e.qr?.token === token) ?? null
}

export async function listActivity(limit = 10) {
  const db = await load()
  return db.activity.toSorted((a, b) => b.at.localeCompare(a.at)).slice(0, limit)
}

export function logActivity(db: Database, actor: string, examId: string, message: string) {
  db.activity.push({ id: randomUUID(), at: new Date().toISOString(), actor, examId, message })
}

export function nextExamId(db: Database) {
  const id = `XR-${todayInClinic().slice(0, 4)}-${String(db.nextSeq).padStart(4, "0")}`
  db.nextSeq += 1
  return id
}

// Opaque, unguessable token for the patient result URL. Carries no patient data.
export function newResultToken() {
  return randomBytes(16).toString("base64url")
}

export async function resetDatabase() {
  await mutate((db) => {
    Object.assign(db, createSeedDatabase())
  })
}
