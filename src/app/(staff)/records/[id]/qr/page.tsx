import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { TriangleAlertIcon } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { QrPanel } from "@/components/qr-panel"
import { QrBadge, StatusBadge } from "@/components/status-badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getExam } from "@/lib/db"
import { missingFields, qrEligibility } from "@/lib/exam-rules"
import { formatDate } from "@/lib/format"
import { qrImages, resultUrl } from "@/lib/result-url"
import { requireSession } from "@/lib/session"

export const metadata: Metadata = { title: "Patient QR Code" }

export default async function ExamQrPage({ params }: PageProps<"/records/[id]/qr">) {
  await requireSession("admin")
  const { id } = await params
  const exam = await getExam(id)
  if (!exam) notFound()

  const eligibility = qrEligibility(exam)
  const url = exam.qr ? await resultUrl(exam.qr.token) : null
  const images = url ? await qrImages(url) : null

  return (
    <>
      <PageHeader
        className="print:hidden"
        title="Patient QR code"
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono">{exam.id}</span> · {exam.patient.name} · {exam.examType}
          </span>
        }
        back={{ href: `/records/${exam.id}`, label: exam.id }}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {!eligibility.eligible && !exam.qr ? (
            <Card className="print:hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TriangleAlertIcon className="size-5 text-orange-600" />
                  QR code not available yet
                </CardTitle>
                <CardDescription>
                  A QR code can only be generated once the report is finalized and the patient&apos;s information
                  is complete.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="list-inside list-disc space-y-1 text-sm text-orange-800">
                  {eligibility.reasons.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
                {missingFields(exam).length > 0 && (
                  <Link href={`/records/${exam.id}/edit`} className={buttonVariants()}>
                    Complete patient information
                  </Link>
                )}
              </CardContent>
            </Card>
          ) : (
            <QrPanel
              examId={exam.id}
              patientName={exam.patient.name}
              examType={exam.examType}
              examDate={formatDate(exam.examDate)}
              url={url}
              svg={images?.svg ?? null}
              png={images?.png ?? null}
              stillEligible={eligibility.eligible}
            />
          )}
        </div>

        <Card size="sm" className="h-fit print:hidden">
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Report</span>
              <StatusBadge status={exam.status} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">QR code</span>
              <QrBadge qr={exam.qr} />
            </div>
            <p className="border-t pt-3 text-xs leading-relaxed text-muted-foreground">
              The QR code contains only a random access token, never patient details or findings. Regenerating
              the code revokes the previous link. In production, result access would also require identity
              verification, HTTPS and access logging.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
