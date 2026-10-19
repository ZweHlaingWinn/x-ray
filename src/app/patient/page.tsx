import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon, ScanLineIcon } from "lucide-react"
import { PatientAccessForm } from "@/components/patient-access-form"
import { CLINIC_NAME } from "@/lib/constants"

export const metadata: Metadata = { title: "Patient Access", robots: { index: false } }

// Token of a seeded, finalized sample result (fictional patient).
const SAMPLE_TOKEN = "q7Hk2mVx9TcP4wLs8RbN3e"

export default function PatientAccessPage() {
  return (
    <main className="flex flex-1 flex-col bg-gradient-to-b from-teal-50 to-white">
      <div className="mx-auto w-full max-w-md flex-1 px-4 py-10">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeftIcon className="size-4" />
          Demo home
        </Link>
        <div className="mt-8 flex size-12 items-center justify-center rounded-2xl bg-teal-600 text-white">
          <ScanLineIcon className="size-6" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">View your X-ray result</h1>
        <p className="mt-2 text-muted-foreground">
          Scan the QR code on the card you received from {CLINIC_NAME} with your phone camera. It opens your
          result directly, with no app to install.
        </p>

        <div className="mt-8 rounded-2xl border bg-white p-5 shadow-xs">
          <p className="font-medium">Can&apos;t scan the code?</p>
          <p className="mt-1 text-sm text-muted-foreground">Paste the link or access code printed under it.</p>
          <PatientAccessForm />
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-teal-300 bg-teal-50/60 p-5 text-sm">
          <p className="font-medium text-teal-900">Demo shortcut</p>
          <p className="mt-1 text-teal-900/80">
            Open a sample finalized result for the fictional patient Aye Aye Mon, as if the QR code was scanned.
          </p>
          <Link
            href={`/result/${SAMPLE_TOKEN}`}
            className="mt-3 inline-flex h-9 items-center rounded-lg bg-teal-600 px-3 font-medium text-white hover:bg-teal-700"
          >
            Open sample result
          </Link>
        </div>
      </div>
    </main>
  )
}
