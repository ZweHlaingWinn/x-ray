import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PageHeader } from "@/components/page-header"
import { ReportEditor } from "@/components/report-editor"
import { StatusBadge } from "@/components/status-badge"
import { XrayViewer } from "@/components/xray-viewer"
import { Card, CardContent } from "@/components/ui/card"
import { getExam } from "@/lib/db"
import { ageFrom, formatDate } from "@/lib/format"
import { requireSession } from "@/lib/session"

export const metadata: Metadata = { title: "Report Editor" }

export default async function ReportEditorPage({ params }: PageProps<"/worklist/[id]">) {
  const session = await requireSession("radiologist")
  const { id } = await params
  const exam = await getExam(id)
  if (!exam) notFound()

  const age = ageFrom(exam.patient.dateOfBirth, exam.examDate)

  return (
    <>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            {exam.examType}
            <StatusBadge status={exam.status} />
          </span>
        }
        description={
          <>
            <span className="font-mono">{exam.id}</span> · {exam.patient.name} · {formatDate(exam.examDate)}
          </>
        }
        back={{ href: "/worklist", label: "Worklist" }}
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-4">
          <XrayViewer src={exam.imageUrl} alt={`${exam.examType} for ${exam.id}`} />
          <Card size="sm">
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-xs text-muted-foreground">Patient</dt>
                  <dd className="font-medium">{exam.patient.name}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Age / gender</dt>
                  <dd className="font-medium">
                    {age ?? "—"} {exam.patient.gender ? `· ${exam.patient.gender}` : ""}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Patient ID</dt>
                  <dd className="font-medium">{exam.patient.patientId || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Referring</dt>
                  <dd className="font-medium">{exam.referringDoctor || "—"}</dd>
                </div>
              </dl>
              <p className="mt-3 rounded-lg bg-muted/60 p-2.5 text-sm">
                <span className="font-medium">Clinical notes: </span>
                {exam.clinicalNotes || <span className="text-muted-foreground">None provided</span>}
              </p>
            </CardContent>
          </Card>
        </div>
        <ReportEditor key={exam.updatedAt} exam={exam} radiologistName={session.name} />
      </div>
    </>
  )
}
