import type { Metadata } from "next"
import { PageHeader } from "@/components/page-header"
import { Worklist } from "@/components/worklist"
import { listExams } from "@/lib/db"
import { requireSession } from "@/lib/session"

export const metadata: Metadata = { title: "Worklist" }

export default async function WorklistPage() {
  const session = await requireSession("radiologist")
  const exams = await listExams()

  return (
    <>
      <PageHeader
        title="Radiologist worklist"
        description="Examinations awaiting review. Open one to view the image and write the report."
      />
      <Worklist exams={exams} me={session.name} />
    </>
  )
}
