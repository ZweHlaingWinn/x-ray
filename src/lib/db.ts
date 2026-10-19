import "server-only"
import { randomBytes, randomUUID } from "node:crypto"
import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import path from "node:path"
import { todayInClinic } from "./format"
import { createSeedDatabase } from "./seed"
import type { Database, Examination } from "./types"

// Demo persistence: a single JSON file, seeded on first use. Shared by every
// browser that hits this server, so QR links also work from a phone.
const DATA_DIR = path.join(process.cwd(), ".data")
const DB_FILE = path.join(DATA_DIR, "db.json")

let seeding: Promise<void> | null = null

async function load(): Promise<Database> {
  try {
    return JSON.parse(await readFile(DB_FILE, "utf8")) as Database
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error
    // First run: write the seed once, even if several reads race here.
    seeding ??= save(createSeedDatabase()).finally(() => {
      seeding = null
    })
    await seeding
    return load()
  }
}

async function save(db: Database) {
  await mkdir(DATA_DIR, { recursive: true })
  const tmp = `${DB_FILE}.${randomUUID()}.tmp`
  await writeFile(tmp, JSON.stringify(db, null, 2))
  await rename(tmp, DB_FILE)
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
