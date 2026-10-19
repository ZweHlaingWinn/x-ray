import Link from "next/link"
import { FileQuestionIcon } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

export default function StaffNotFound() {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <FileQuestionIcon className="size-10 text-muted-foreground" />
      <h1 className="text-xl font-semibold">Examination not found</h1>
      <p className="text-sm text-muted-foreground">The record may have been removed or the ID is incorrect.</p>
      <Link href="/records" className={buttonVariants({ variant: "outline" })}>
        Back to records
      </Link>
    </div>
  )
}
