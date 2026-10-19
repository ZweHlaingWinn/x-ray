import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { updateExam } from "@/app/actions"
import { ExamForm } from "@/components/exam-form"
import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { getExam } from "@/lib/db"
import { requireSession } from "@/lib/session"

export const metadata: Metadata = { title: "Edit Examination" }

export default async function EditExamPage({ params }: PageProps<"/records/[id]/edit">) {
  await requireSession("admin")
  const { id } = await params
  const exam = await getExam(id)
  if (!exam) notFound()

  return (
    <>
      <PageHeader
        title={
          <span className="flex flex-wrap items-center gap-3">
            Patient & examination details
            <StatusBadge status={exam.status} />
          </span>
        }
        description={
          <>
            <span className="font-mono">{exam.id}</span> · Changes apply to this examination only. Radiologist
            findings cannot be edited here.
          </>
        }
        back={{ href: `/records/${exam.id}`, label: exam.id }}
      />
      <ExamForm key={exam.updatedAt} exam={exam} action={updateExam.bind(null, exam.id)} />
    </>
  )
}
