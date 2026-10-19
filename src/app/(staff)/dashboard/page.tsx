import type { Metadata } from "next"
import Link from "next/link"
import {
  ActivityIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  CircleDashedIcon,
  ClockIcon,
  FilesIcon,
  QrCodeIcon,
  UserRoundXIcon,
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { listActivity, listExams } from "@/lib/db"
import { missingFields, qrEligibility } from "@/lib/exam-rules"
import { formatDate, formatDateTime } from "@/lib/format"
import { requireSession } from "@/lib/session"
import type { Examination } from "@/lib/types"

export const metadata: Metadata = { title: "Dashboard" }

export default async function DashboardPage() {
  const session = await requireSession()
  const [exams, activity] = await Promise.all([listExams(), listActivity(8)])

  const count = (fn: (e: Examination) => boolean) => exams.filter(fn).length
  const stats = [
    { label: "Total examinations", value: exams.length, icon: FilesIcon, tone: "bg-slate-100 text-slate-700" },
    { label: "Pending reports", value: count((e) => e.status === "Pending"), icon: ClockIcon, tone: "bg-amber-50 text-amber-700" },
    { label: "Reports in progress", value: count((e) => e.status === "In Progress"), icon: CircleDashedIcon, tone: "bg-sky-50 text-sky-700" },
    { label: "Finalized reports", value: count((e) => e.status === "Finalized"), icon: CheckCircle2Icon, tone: "bg-emerald-50 text-emerald-700" },
    { label: "QR codes generated", value: count((e) => !!e.qr), icon: QrCodeIcon, tone: "bg-teal-50 text-teal-700" },
    { label: "Incomplete patient info", value: count((e) => missingFields(e).length > 0), icon: UserRoundXIcon, tone: "bg-orange-50 text-orange-700" },
  ]

  const isAdmin = session.role === "admin"
  const myQueue = exams
    .filter((e) => e.status !== "Finalized" && (!e.assignedRadiologist || e.assignedRadiologist === session.name))
    .toSorted((a, b) => a.examDate.localeCompare(b.examDate))
  const readyForQr = exams.filter((e) => !e.qr && qrEligibility(e).eligible)
  const needsInfo = exams.filter((e) => missingFields(e).length > 0)

  return (
    <>
      <PageHeader
        title={`Welcome back, ${session.name}`}
        description={
          isAdmin
            ? "Overview of X-ray examinations, reporting progress and patient result access."
            : "Overview of the reporting workload across the clinic."
        }
        actions={
          isAdmin ? (
            <Link href="/records/new" className={buttonVariants()}>
              New examination
            </Link>
          ) : (
            <Link href="/worklist" className={buttonVariants()}>
              Open worklist
            </Link>
          )
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <Card key={label} size="sm">
            <CardContent className="flex flex-col gap-3">
              <span className={`flex size-8 items-center justify-center rounded-lg ${tone}`}>
                <Icon className="size-4" />
              </span>
              <div>
                <p className="text-2xl font-semibold tabular-nums">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          {isAdmin ? (
            <>
              <ExamListCard
                title="Ready for patient QR code"
                description="Finalized reports with complete patient information."
                exams={readyForQr}
                empty="No results are waiting to be released."
                hrefFor={(e) => `/records/${e.id}/qr`}
                cta="Generate QR"
              />
              <ExamListCard
                title="Missing patient information"
                description="Complete these records before results can be released."
                exams={needsInfo}
                empty="All records have complete patient information."
                hrefFor={(e) => `/records/${e.id}/edit`}
                cta="Complete"
                detail={(e) => `Missing: ${missingFields(e).join(", ")}`}
              />
            </>
          ) : (
            <ExamListCard
              title="Awaiting your review"
              description="Assigned to you or unassigned, oldest first."
              exams={myQueue}
              empty="Nothing waiting for review. Nice work!"
              hrefFor={(e) => `/worklist/${e.id}`}
              cta="Open"
            />
          )}
        </div>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ActivityIcon className="size-4 text-muted-foreground" />
              Recent activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No activity yet.</p>
            ) : (
              <ol className="relative space-y-4 border-l pl-5">
                {activity.map((a) => (
                  <li key={a.id} className="relative">
                    <span className="absolute top-1.5 -left-[25px] size-2.5 rounded-full border-2 border-background bg-primary" />
                    <p className="text-sm">
                      {a.message} ·{" "}
                      <Link href={`/records/${a.examId}`} className="font-medium text-primary hover:underline">
                        {a.examId}
                      </Link>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {a.actor} · {formatDateTime(a.at)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function ExamListCard({
  title,
  description,
  exams,
  empty,
  hrefFor,
  cta,
  detail,
}: {
  title: string
  description: string
  exams: Examination[]
  empty: string
  hrefFor: (e: Examination) => string
  cta: string
  detail?: (e: Examination) => string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {title} <span className="ml-1 text-muted-foreground tabular-nums">({exams.length})</span>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {exams.length === 0 ? (
          <p className="rounded-lg border border-dashed py-6 text-center text-sm text-muted-foreground">{empty}</p>
        ) : (
          <ul className="divide-y">
            {exams.slice(0, 6).map((e) => (
              <li key={e.id} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {e.patient.name} <span className="font-normal text-muted-foreground">· {e.id}</span>
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {detail ? detail(e) : `${e.examType} · ${formatDate(e.examDate)}`}
                  </p>
                </div>
                <StatusBadge status={e.status} className="hidden sm:inline-flex" />
                <Link href={hrefFor(e)} className={buttonVariants({ variant: "outline", size: "sm" })}>
                  {cta}
                  <ArrowRightIcon />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
