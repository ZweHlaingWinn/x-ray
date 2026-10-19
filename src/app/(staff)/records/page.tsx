import type { Metadata } from "next"
import Link from "next/link"
import { PlusIcon } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { RecordsTable } from "@/components/records-table"
import { buttonVariants } from "@/components/ui/button"
import { listExams } from "@/lib/db"
import { requireSession } from "@/lib/session"

export const metadata: Metadata = { title: "X-Ray Records" }

export default async function RecordsPage() {
  const session = await requireSession()
  const exams = await listExams()

  return (
    <>
      <PageHeader
        title="X-Ray Records"
        description="Search and filter every examination registered at the clinic."
        actions={
          session.role === "admin" && (
            <Link href="/records/new" className={buttonVariants()}>
              <PlusIcon />
              New examination
            </Link>
          )
        }
      />
      <RecordsTable exams={exams} role={session.role} />
    </>
  )
}
