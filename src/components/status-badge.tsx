import { CheckCircle2Icon, CircleDashedIcon, ClockIcon, QrCodeIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ExamStatus, QrAccess } from "@/lib/types"

const base =
  "inline-flex h-6 shrink-0 items-center gap-1 rounded-full border px-2.5 text-xs font-medium whitespace-nowrap [&>svg]:size-3.5"

const statusStyles: Record<ExamStatus, { className: string; icon: React.ReactNode }> = {
  Pending: {
    className: "border-amber-200 bg-amber-50 text-amber-800",
    icon: <ClockIcon />,
  },
  "In Progress": {
    className: "border-sky-200 bg-sky-50 text-sky-800",
    icon: <CircleDashedIcon />,
  },
  Finalized: {
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: <CheckCircle2Icon />,
  },
}

export function StatusBadge({ status, className }: { status: ExamStatus; className?: string }) {
  const style = statusStyles[status]
  return (
    <span className={cn(base, style.className, className)}>
      {style.icon}
      {status}
    </span>
  )
}

export function QrBadge({ qr, className }: { qr: QrAccess | null; className?: string }) {
  return qr ? (
    <span className={cn(base, "border-teal-200 bg-teal-50 text-teal-800", className)}>
      <QrCodeIcon />
      Generated
    </span>
  ) : (
    <span className={cn(base, "border-border bg-muted text-muted-foreground", className)}>
      Not generated
    </span>
  )
}

export function InfoBadge({ missing, className }: { missing: number; className?: string }) {
  return missing === 0 ? (
    <span className={cn(base, "border-emerald-200 bg-white text-emerald-700", className)}>
      Complete
    </span>
  ) : (
    <span className={cn(base, "border-orange-200 bg-orange-50 text-orange-800", className)}>
      {missing} missing
    </span>
  )
}
