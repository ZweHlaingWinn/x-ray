import "server-only"
import { randomUUID } from "node:crypto"
import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import path from "node:path"

// Where the demo database (one JSON document) lives:
// - Upstash Redis when its REST credentials are set. Use this on Vercel, where
//   the project folder is read-only and every instance has its own /tmp.
// - Otherwise a local JSON file: `.data/db.json`, or `/tmp` on Vercel so the
//   site still loads, though data may reset and differ between instances.
export type Storage = {
  // Returns null when nothing has been stored yet.
  read(): Promise<string | null>
  write(json: string): Promise<void>
  // Writes only if nothing is stored yet, so concurrent first loads seed once.
  writeIfEmpty(json: string): Promise<void>
}

const REDIS_KEY = "xray-portal:db"

function redisStorage(url: string, token: string): Storage {
  async function command(args: string[]) {
    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(args),
      cache: "no-store",
    })
    const body = (await res.json()) as { result?: unknown; error?: string }
    if (!res.ok || body.error) throw new Error(`Redis ${args[0]} failed: ${body.error ?? res.status}`)
    return body.result
  }
  return {
    async read() {
      return ((await command(["GET", REDIS_KEY])) as string | null) ?? null
    },
    async write(json) {
      await command(["SET", REDIS_KEY, json])
    },
    async writeIfEmpty(json) {
      await command(["SET", REDIS_KEY, json, "NX"])
    },
  }
}

function fileStorage(dir: string): Storage {
  const file = path.join(dir, "db.json")
  async function write(json: string) {
    await mkdir(dir, { recursive: true })
    const tmp = `${file}.${randomUUID()}.tmp`
    await writeFile(tmp, json)
    await rename(tmp, file)
  }
  let seeding: Promise<void> | null = null
  return {
    async read() {
      try {
        return await readFile(file, "utf8")
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") return null
        throw error
      }
    },
    write,
    async writeIfEmpty(json) {
      seeding ??= write(json).finally(() => {
        seeding = null
      })
      await seeding
    },
  }
}

function createStorage(): Storage {
  // Vercel's Upstash integration sets KV_REST_API_*; Upstash's own uses UPSTASH_REDIS_REST_*.
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN
  if (url && token) return redisStorage(url, token)
  return fileStorage(process.env.VERCEL ? "/tmp/xray-portal" : path.join(process.cwd(), ".data"))
}

export const storage = createStorage()
