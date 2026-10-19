import Link from "next/link"
import {
  ArrowRightIcon,
  ClipboardPenIcon,
  ScanLineIcon,
  SmartphoneIcon,
  UserCogIcon,
} from "lucide-react"
import { login } from "@/app/actions"
import { ResetDemoButton } from "@/components/reset-demo-button"
import { CLINIC_NAME, DEMO_USERS } from "@/lib/constants"

const roles = [
  {
    role: "admin" as const,
    title: "Admin / Clinic Helper",
    user: DEMO_USERS.admin.name,
    icon: UserCogIcon,
    points: ["Register X-ray examinations", "Complete patient details", "Generate & print patient QR codes"],
  },
  {
    role: "radiologist" as const,
    title: "Radiologist",
    user: DEMO_USERS.radiologist.name,
    icon: ClipboardPenIcon,
    points: ["Review X-ray images", "Write & save draft reports", "Finalize and amend reports"],
  },
]

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col bg-gradient-to-b from-sky-50 via-background to-background">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-10 sm:py-16">
        <div className="mb-10 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ScanLineIcon className="size-5" />
          </span>
          <div className="leading-tight">
            <p className="font-semibold">X-Ray Reporting & Patient Result Portal</p>
            <p className="text-sm text-muted-foreground">{CLINIC_NAME}</p>
          </div>
        </div>

        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Choose a demo role to sign in
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          This is a demonstration with fictional patients and sample images. No password is needed: pick a role
          to walk through the workflow from examination registration to the patient&apos;s QR result page.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {roles.map(({ role, title, user, icon: Icon, points }) => (
            <form key={role} action={login.bind(null, role)} className="flex">
              <button
                type="submit"
                className="group flex w-full flex-col rounded-2xl border bg-card p-6 text-left shadow-xs transition hover:border-primary/40 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <Icon className="size-5" />
                </span>
                <span className="mt-4 text-lg font-semibold">{title}</span>
                <span className="text-sm text-muted-foreground">Signed in as {user}</span>
                <ul className="mt-4 flex-1 space-y-1.5 text-sm text-muted-foreground">
                  {points.map((p) => (
                    <li key={p}>• {p}</li>
                  ))}
                </ul>
                <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Enter as {title.split(" /")[0]}
                  <ArrowRightIcon className="size-4 transition group-hover:translate-x-0.5" />
                </span>
              </button>
            </form>
          ))}
          <Link
            href="/patient"
            className="group flex flex-col rounded-2xl border bg-card p-6 shadow-xs transition hover:border-primary/40 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <SmartphoneIcon className="size-5" />
            </span>
            <span className="mt-4 text-lg font-semibold">Patient</span>
            <span className="text-sm text-muted-foreground">No account needed</span>
            <ul className="mt-4 flex-1 space-y-1.5 text-sm text-muted-foreground">
              <li>• Scan the QR code from the clinic</li>
              <li>• View the finalized X-ray report</li>
              <li>• Print the result</li>
            </ul>
            <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Open patient access
              <ArrowRightIcon className="size-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-12 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Demo only · fictional data · not for clinical use.</p>
          <ResetDemoButton />
        </div>
      </div>
    </main>
  )
}
