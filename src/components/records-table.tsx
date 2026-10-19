"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { SearchIcon, SearchXIcon, XIcon } from "lucide-react"
import { nativeSelectClass } from "@/components/form-field"
import { InfoBadge, QrBadge, StatusBadge } from "@/components/status-badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EXAM_TYPES } from "@/lib/constants"
import { missingFields } from "@/lib/exam-rules"
import { formatDate } from "@/lib/format"
import type { Examination, Role } from "@/lib/types"

const initialFilters = { query: "", status: "", examType: "", info: "", qr: "" }

export function RecordsTable({ exams, role }: { exams: Examination[]; role: Role }) {
  const [filters, setFilters] = useState(initialFilters)
  const set = (key: keyof typeof filters) => (e: { target: { value: string } }) =>
    setFilters((f) => ({ ...f, [key]: e.target.value }))

  const rows = useMemo(() => {
    const q = filters.query.trim().toLowerCase()
    return exams.filter((e) => {
      if (q) {
        const haystack = [e.id, e.patient.name, e.patient.patientId, e.patient.phone, e.patient.email]
          .join(" ")
          .toLowerCase()
        if (!haystack.includes(q)) return false
      }
      if (filters.status && e.status !== filters.status) return false
      if (filters.examType && e.examType !== filters.examType) return false
      const missing = missingFields(e).length
      if (filters.info === "complete" && missing) return false
      if (filters.info === "incomplete" && !missing) return false
      if (filters.qr === "yes" && !e.qr) return false
      if (filters.qr === "no" && e.qr) return false
      return true
    })
  }, [exams, filters])

  const filtered = Object.values(filters).some(Boolean)

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.query}
            onChange={set("query")}
            placeholder="Search by exam ID, patient name, patient ID or phone"
            className="pl-8"
            aria-label="Search records"
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:flex">
          <select value={filters.status} onChange={set("status")} className={nativeSelectClass} aria-label="Filter by status">
            <option value="">All statuses</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Finalized</option>
          </select>
          <select value={filters.examType} onChange={set("examType")} className={nativeSelectClass} aria-label="Filter by examination type">
            <option value="">All exam types</option>
            {EXAM_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <select value={filters.info} onChange={set("info")} className={nativeSelectClass} aria-label="Filter by patient information">
            <option value="">Any patient info</option>
            <option value="complete">Info complete</option>
            <option value="incomplete">Info incomplete</option>
          </select>
          <select value={filters.qr} onChange={set("qr")} className={nativeSelectClass} aria-label="Filter by QR status">
            <option value="">Any QR status</option>
            <option value="yes">QR generated</option>
            <option value="no">No QR yet</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
        <span>
          Showing {rows.length} of {exams.length} examinations
        </span>
        {filtered && (
          <Button variant="ghost" size="xs" onClick={() => setFilters(initialFilters)}>
            <XIcon />
            Clear filters
          </Button>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-16 text-center">
          <SearchXIcon className="size-8 text-muted-foreground" />
          <p className="font-medium">No examinations match your filters</p>
          <p className="text-sm text-muted-foreground">Try a different search term or clear the filters.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="pl-4">Exam ID</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Examination</TableHead>
              <TableHead>Exam date</TableHead>
              <TableHead>Radiologist</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Patient info</TableHead>
              <TableHead>QR code</TableHead>
              <TableHead className="pr-4 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="pl-4 font-mono text-xs font-medium">{e.id}</TableCell>
                <TableCell>
                  <p className="font-medium">{e.patient.name}</p>
                  <p className="text-xs text-muted-foreground">{e.patient.patientId || "No patient ID"}</p>
                </TableCell>
                <TableCell>{e.examType}</TableCell>
                <TableCell className="tabular-nums">{formatDate(e.examDate)}</TableCell>
                <TableCell className={e.assignedRadiologist ? "" : "text-muted-foreground italic"}>
                  {e.assignedRadiologist || "Unassigned"}
                </TableCell>
                <TableCell>
                  <StatusBadge status={e.status} />
                </TableCell>
                <TableCell>
                  <InfoBadge missing={missingFields(e).length} />
                </TableCell>
                <TableCell>
                  <QrBadge qr={e.qr} />
                </TableCell>
                <TableCell className="pr-4 text-right">
                  <div className="flex justify-end gap-1.5">
                    {role === "radiologist" && (
                      <Link href={`/worklist/${e.id}`} className={buttonVariants({ size: "sm" })}>
                        {e.status === "Finalized" ? "Report" : "Write report"}
                      </Link>
                    )}
                    <Link href={`/records/${e.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                      View
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
