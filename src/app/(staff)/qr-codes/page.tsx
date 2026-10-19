import type { Metadata } from "next"
import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { InfoBadge, QrBadge, StatusBadge } from "@/components/status-badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { listExams } from "@/lib/db"
import { missingFields, qrEligibility } from "@/lib/exam-rules"
import { formatDateTime } from "@/lib/format"
import { requireSession } from "@/lib/session"
import { cn } from "@/lib/utils"
import type { Examination } from "@/lib/types"

export const metadata: Metadata = { title: "QR Codes" }

const VIEWS = {
  ready: { label: "Ready to generate", test: (e: Examination) => !e.qr && qrEligibility(e).eligible },
  generated: { label: "Generated", test: (e: Examination) => !!e.qr },
  blocked: { label: "Not eligible yet", test: (e: Examination) => !e.qr && !qrEligibility(e).eligible },
  all: { label: "All", test: () => true },
} as const

type View = keyof typeof VIEWS

export default async function QrCodesPage({ searchParams }: PageProps<"/qr-codes">) {
  await requireSession("admin")
  const { view: rawView } = await searchParams
  const view: View = typeof rawView === "string" && rawView in VIEWS ? (rawView as View) : "ready"
  const exams = await listExams()
  const rows = exams.filter(VIEWS[view].test)

  return (
    <>
      <PageHeader
        title="QR Codes"
        description="Release finalized results to patients and manage existing QR codes."
      />

      <div className="rounded-xl border bg-card">
        <nav className="flex gap-1 overflow-x-auto border-b p-2" aria-label="QR code views">
          {(Object.keys(VIEWS) as View[]).map((key) => (
            <Link
              key={key}
              href={`/qr-codes?view=${key}`}
              aria-current={key === view ? "page" : undefined}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm whitespace-nowrap transition",
                key === view ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground hover:bg-muted"
              )}
            >
              {VIEWS[key].label}
              <span className="ml-1.5 text-xs tabular-nums opacity-70">{exams.filter(VIEWS[key].test).length}</span>
            </Link>
          ))}
        </nav>

        {rows.length === 0 ? (
          <p className="px-4 py-16 text-center text-sm text-muted-foreground">No examinations in this view.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="pl-4">Exam ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Report</TableHead>
                <TableHead>Patient info</TableHead>
                <TableHead>QR code</TableHead>
                <TableHead>Generated</TableHead>
                <TableHead className="pr-4 text-right">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((e) => {
                const eligible = qrEligibility(e).eligible
                return (
                  <TableRow key={e.id}>
                    <TableCell className="pl-4 font-mono text-xs font-medium">{e.id}</TableCell>
                    <TableCell>
                      <p className="font-medium">{e.patient.name}</p>
                      <p className="text-xs text-muted-foreground">{e.examType}</p>
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
                    <TableCell className="text-xs text-muted-foreground">
                      {e.qr ? formatDateTime(e.qr.generatedAt) : "—"}
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      {e.qr ? (
                        <Link href={`/records/${e.id}/qr`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                          Preview & print
                        </Link>
                      ) : eligible ? (
                        <Link href={`/records/${e.id}/qr`} className={buttonVariants({ size: "sm" })}>
                          Generate
                        </Link>
                      ) : (
                        <Link href={`/records/${e.id}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                          View blockers
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </>
  )
}
