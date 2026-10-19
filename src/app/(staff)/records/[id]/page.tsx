import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CheckCircle2Icon, FilePenIcon, PencilIcon, QrCodeIcon, TriangleAlertIcon } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { ReportSections, RevisionHistory } from "@/components/report-view"
import { QrBadge, StatusBadge } from "@/components/status-badge"
import { XrayViewer } from "@/components/xray-viewer"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getExam } from "@/lib/db"
import { missingFields, qrEligibility } from "@/lib/exam-rules"
import { ageFrom, formatDate, formatDateTime } from "@/lib/format"
import { requireSession } from "@/lib/session"

export const metadata: Metadata = { title: "Examination" }

export default async function ExamDetailPage({ params }: PageProps<"/records/[id]">) {
  const session = await requireSession()
  const { id } = await params
  const exam = await getExam(id)
  if (!exam) notFound()

  const isAdmin = session.role === "admin"
  const missing = missingFields(exam)
  const eligibility = qrEligibility(exam)
  const age = ageFrom(exam.patient.dateOfBirth, exam.examDate)
  const report = exam.report

  return (
    <>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            {exam.patient.name}
            <StatusBadge status={exam.status} />
          </span>
        }
        description={
          <>
            <span className="font-mono">{exam.id}</span> · {exam.examType} · {formatDate(exam.examDate)}
          </>
        }
        back={{ href: "/records", label: "X-Ray Records" }}
        actions={
          isAdmin ? (
            <>
              <Link href={`/records/${exam.id}/edit`} className={buttonVariants({ variant: "outline" })}>
                <PencilIcon />
                Edit details
              </Link>
              <Link href={`/records/${exam.id}/qr`} className={buttonVariants()}>
                <QrCodeIcon />
                Patient QR code
              </Link>
            </>
          ) : (
            <Link href={`/worklist/${exam.id}`} className={buttonVariants()}>
              <FilePenIcon />
              {exam.status === "Finalized" ? "Open report" : "Write report"}
            </Link>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          <XrayViewer src={exam.imageUrl} alt={`${exam.examType} for ${exam.id}`} />
          <Card size="sm">
            <CardHeader>
              <CardTitle>Patient result access</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">QR code</span>
                <QrBadge qr={exam.qr} />
              </div>
              {exam.qr && (
                <p className="text-xs text-muted-foreground">
                  Generated {formatDateTime(exam.qr.generatedAt)} by {exam.qr.generatedBy}
                </p>
              )}
              {eligibility.eligible ? (
                <p className="flex items-start gap-2 rounded-lg bg-emerald-50 p-2.5 text-emerald-800">
                  <CheckCircle2Icon className="mt-0.5 size-4 shrink-0" />
                  Eligible: the report is finalized and patient information is complete.
                </p>
              ) : (
                <div className="flex items-start gap-2 rounded-lg bg-orange-50 p-2.5 text-orange-800">
                  <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
                  <ul className="space-y-1">
                    {eligibility.reasons.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-3">
          <div className="grid gap-6 md:grid-cols-2">
            <Card size="sm">
              <CardHeader>
                <CardTitle>Patient</CardTitle>
                {missing.length > 0 && (
                  <CardDescription className="text-orange-700">Missing: {missing.join(", ")}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                  <Row label="Patient ID" value={exam.patient.patientId} />
                  <Row
                    label="Date of birth"
                    value={exam.patient.dateOfBirth && `${formatDate(exam.patient.dateOfBirth)}${age !== null ? ` (${age} y)` : ""}`}
                  />
                  <Row label="Gender" value={exam.patient.gender} />
                  <Row label="Phone" value={exam.patient.phone} />
                  <Row label="Email" value={exam.patient.email} optional />
                </dl>
              </CardContent>
            </Card>
            <Card size="sm">
              <CardHeader>
                <CardTitle>Examination</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                  <Row label="Type" value={exam.examType} />
                  <Row label="Date" value={formatDate(exam.examDate)} />
                  <Row label="Referring" value={exam.referringDoctor} optional />
                  <Row label="Radiologist" value={exam.assignedRadiologist || "Unassigned"} />
                  <Row label="Registered" value={formatDateTime(exam.createdAt)} />
                </dl>
                {exam.clinicalNotes && (
                  <p className="mt-3 rounded-lg bg-muted/60 p-2.5 text-sm">
                    <span className="font-medium">Clinical notes: </span>
                    {exam.clinicalNotes}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex flex-wrap items-center gap-2">
                Radiologist report
                {exam.status === "In Progress" && (
                  <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-normal text-sky-800">
                    Draft · not visible to the patient
                  </span>
                )}
                {report?.amendedAt && (
                  <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-normal text-violet-800">
                    Amended {formatDate(report.amendedAt)}
                  </span>
                )}
              </CardTitle>
              {report && (
                <CardDescription>
                  {report.radiologistName} ·{" "}
                  {report.finalizedAt
                    ? `finalized ${formatDateTime(report.finalizedAt)}`
                    : `last saved ${formatDateTime(report.updatedAt)}`}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {report ? (
                <>
                  <ReportSections content={report} className={exam.status === "Finalized" ? "" : "opacity-80"} />
                  <RevisionHistory report={report} />
                </>
              ) : (
                <p className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                  Awaiting radiologist review. No report has been written yet.
                </p>
              )}
              {isAdmin && report && (
                <p className="text-xs text-muted-foreground">
                  Report content is managed by the radiologist and cannot be edited by clinic staff.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

function Row({ label, value, optional }: { label: string; value: string; optional?: boolean }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={value ? "font-medium" : optional ? "text-muted-foreground" : "font-medium text-orange-700"}>
        {value || (optional ? "—" : "Missing")}
      </dd>
    </>
  )
}
