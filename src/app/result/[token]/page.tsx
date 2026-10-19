import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { CalendarIcon, InfoIcon, ScanLineIcon, StethoscopeIcon } from "lucide-react"
import { PrintButton } from "@/components/print-button"
import { ReportSections } from "@/components/report-view"
import { XrayViewer } from "@/components/xray-viewer"
import { CLINIC_NAME } from "@/lib/constants"
import { getExamByToken } from "@/lib/db"
import { formatDate, formatDateTime } from "@/lib/format"

export const metadata: Metadata = {
  title: "Your X-ray Result",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
}

export default async function PatientResultPage({ params }: PageProps<"/result/[token]">) {
  const { token } = await params
  const exam = await getExamByToken(token)
  if (!exam) notFound()

  const report = exam.report
  // Only finalized reports are ever shown; drafts never reach this page.
  const released = exam.status === "Finalized" && !!report?.finalizedAt

  return (
    <main className="flex flex-1 flex-col bg-slate-50 print:bg-white">
      <header className="bg-gradient-to-br from-teal-700 to-cyan-800 text-white print:bg-none print:text-black">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-5">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white/15 print:border">
            <ScanLineIcon className="size-5" />
          </span>
          <div className="leading-tight">
            <p className="font-semibold">{CLINIC_NAME}</p>
            <p className="text-sm text-white/80 print:text-slate-600">Patient X-ray result</p>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 print:py-2">
        {!released || !report ? (
          <div className="rounded-2xl border bg-white p-8 text-center">
            <InfoIcon className="mx-auto size-8 text-teal-700" />
            <h1 className="mt-3 text-xl font-semibold">Your result is not available yet</h1>
            <p className="mt-2 text-muted-foreground">
              The radiologist&apos;s report has not been finalized. Please check again later or contact the clinic.
            </p>
          </div>
        ) : (
          <article className="space-y-5">
            <section className="rounded-2xl border bg-white p-5 print:rounded-none print:border-0 print:border-b print:px-0">
              <p className="text-xs font-semibold tracking-wider text-teal-700 uppercase">X-ray report</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">{exam.patient.name}</h1>
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
                <Item label="Examination ID" value={<span className="font-mono">{exam.id}</span>} />
                <Item label="Examination" value={exam.examType} />
                <Item label="Exam date" value={formatDate(exam.examDate)} />
                <Item label="Patient ID" value={exam.patient.patientId} />
              </dl>
            </section>

            {report.amendedAt && (
              <p className="flex items-start gap-2 rounded-xl border border-violet-200 bg-violet-50 p-3 text-sm text-violet-900">
                <InfoIcon className="mt-0.5 size-4 shrink-0" />
                This report was amended by the radiologist on {formatDate(report.amendedAt)}. You are viewing the
                latest version.
              </p>
            )}

            <section className="rounded-2xl border bg-white p-5 print:rounded-none print:border-0 print:px-0">
              <ReportSections content={report} className="text-[15px]" />
              <div className="mt-6 flex flex-col gap-2 border-t pt-4 text-sm text-muted-foreground sm:flex-row sm:gap-6">
                <span className="flex items-center gap-1.5">
                  <StethoscopeIcon className="size-4" />
                  Reported by <span className="font-medium text-foreground">{report.radiologistName}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarIcon className="size-4" />
                  Finalized {formatDateTime(report.finalizedAt)}
                </span>
              </div>
            </section>

            {exam.imageUrl && (
              <section className="rounded-2xl border bg-white p-5 print:break-inside-avoid print:border-0 print:px-0">
                <h2 className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Image preview
                </h2>
                <XrayViewer
                  src={exam.imageUrl}
                  alt={`${exam.examType} image`}
                  plain
                  className="mx-auto max-w-sm print:max-w-[260px]"
                />
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Preview only. Not of diagnostic quality.
                </p>
              </section>
            )}

            <p className="rounded-xl bg-teal-50 p-4 text-sm text-teal-900 print:bg-white print:p-0 print:text-xs">
              Please discuss this result with your referring doctor{exam.referringDoctor ? ` (${exam.referringDoctor})` : ""}
              . If you have questions about the report, contact {CLINIC_NAME}.
            </p>

            <div className="flex flex-col gap-2 pb-4 sm:flex-row print:hidden">
              <PrintButton />
              <Link
                href="/patient"
                className="inline-flex h-11 items-center justify-center rounded-xl border bg-white px-4 font-medium hover:bg-slate-100"
              >
                Back to home
              </Link>
            </div>
          </article>
        )}
      </div>

      <footer className="py-6 text-center text-xs text-muted-foreground print:py-2">
        Demo application · fictional data · not for clinical use
      </footer>
    </main>
  )
}

function Item({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}
