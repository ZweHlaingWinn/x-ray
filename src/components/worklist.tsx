"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ImageOffIcon, InboxIcon, XIcon } from "lucide-react"
import { nativeSelectClass } from "@/components/form-field"
import { StatusBadge } from "@/components/status-badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatDate } from "@/lib/format"
import type { Examination } from "@/lib/types"

const initialFilters = { status: "open", assigned: "mine", from: "", to: "" }

export function Worklist({ exams, me }: { exams: Examination[]; me: string }) {
  const [filters, setFilters] = useState(initialFilters)
  const set = (key: keyof typeof filters) => (e: { target: { value: string } }) =>
    setFilters((f) => ({ ...f, [key]: e.target.value }))

  const rows = useMemo(
    () =>
      exams
        .filter((e) => {
          if (filters.status === "open" && e.status === "Finalized") return false
          if (filters.status !== "open" && filters.status !== "all" && e.status !== filters.status) return false
          if (filters.assigned === "mine" && e.assignedRadiologist && e.assignedRadiologist !== me) return false
          if (filters.from && e.examDate < filters.from) return false
          if (filters.to && e.examDate > filters.to) return false
          return true
        })
        .toSorted((a, b) =>
          filters.status === "Finalized" || filters.status === "all"
            ? b.examDate.localeCompare(a.examDate)
            : a.examDate.localeCompare(b.examDate)
        ),
    [exams, filters, me]
  )

  const changed = JSON.stringify(filters) !== JSON.stringify(initialFilters)

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto_auto] lg:items-end">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Status
          <select value={filters.status} onChange={set("status")} className={nativeSelectClass}>
            <option value="open">Awaiting review (Pending + In Progress)</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress (drafts)</option>
            <option value="Finalized">Finalized</option>
            <option value="all">All statuses</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Assigned to
          <select value={filters.assigned} onChange={set("assigned")} className={nativeSelectClass}>
            <option value="mine">Me + unassigned</option>
            <option value="all">All radiologists</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          Exam date from
          <Input type="date" value={filters.from} onChange={set("from")} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          to
          <Input type="date" value={filters.to} onChange={set("to")} />
        </label>
        <Button variant="ghost" disabled={!changed} onClick={() => setFilters(initialFilters)}>
          <XIcon />
          Reset
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        {rows.length} examination{rows.length === 1 ? "" : "s"}
      </p>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed bg-card px-4 py-16 text-center">
          <InboxIcon className="size-8 text-muted-foreground" />
          <p className="font-medium">No examinations match these filters</p>
          <p className="text-sm text-muted-foreground">Try including all statuses or all radiologists.</p>
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {rows.map((e) => (
            <li key={e.id} className="flex gap-4 rounded-xl border bg-card p-3 transition hover:border-primary/40">
              <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-black">
                {e.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.imageUrl} alt="" className="size-full object-cover" />
                ) : (
                  <ImageOffIcon className="size-6 text-white/50" />
                )}
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{e.patient.name}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-mono">{e.id}</span> · {formatDate(e.examDate)}
                    </p>
                  </div>
                  <StatusBadge status={e.status} />
                </div>
                <p className="mt-1 text-sm">{e.examType}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">
                  {e.clinicalNotes || "No clinical notes"}
                </p>
                <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                  <span className="truncate text-xs text-muted-foreground">
                    {e.assignedRadiologist ? (e.assignedRadiologist === me ? "Assigned to you" : e.assignedRadiologist) : "Unassigned"}
                  </span>
                  <Link
                    href={`/worklist/${e.id}`}
                    className={buttonVariants({ size: "sm", variant: e.status === "Finalized" ? "outline" : "default" })}
                  >
                    {e.status === "Pending" ? "Start report" : e.status === "In Progress" ? "Continue draft" : "View report"}
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
