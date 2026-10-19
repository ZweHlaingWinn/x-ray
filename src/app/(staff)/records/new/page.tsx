import type { Metadata } from "next"
import { createExam } from "@/app/actions"
import { ExamForm } from "@/components/exam-form"
import { PageHeader } from "@/components/page-header"
import { requireSession } from "@/lib/session"

export const metadata: Metadata = { title: "New Examination" }

export default async function NewExamPage() {
  await requireSession("admin")
  return (
    <>
      <PageHeader
        title="New X-ray examination"
        description="Register an examination. A unique examination ID is assigned when you save."
        back={{ href: "/records", label: "X-Ray Records" }}
      />
      <ExamForm action={createExam} />
    </>
  )
}
