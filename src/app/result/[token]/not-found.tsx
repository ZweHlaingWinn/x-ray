import Link from "next/link"
import { SearchXIcon } from "lucide-react"

export default function ResultNotFound() {
  return (
    <main className="flex flex-1 items-center justify-center bg-slate-50 px-4 py-16">
      <div className="max-w-md rounded-2xl border bg-white p-8 text-center">
        <SearchXIcon className="mx-auto size-9 text-teal-700" />
        <h1 className="mt-3 text-xl font-semibold">Result not found</h1>
        <p className="mt-2 text-muted-foreground">
          This link is invalid or has been replaced by a newer QR code. Please use the latest card from the clinic
          or contact reception.
        </p>
        <Link
          href="/patient"
          className="mt-6 inline-flex h-10 items-center rounded-xl bg-teal-600 px-4 font-medium text-white hover:bg-teal-700"
        >
          Back to home
        </Link>
      </div>
    </main>
  )
}
