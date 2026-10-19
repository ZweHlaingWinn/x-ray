import Link from "next/link"
import { ChevronLeftIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  title: React.ReactNode
  description?: React.ReactNode
  back?: { href: string; label: string }
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, back, actions, className }: Props) {
  return (
    <div className={cn("mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0 space-y-1">
        {back && (
          <Link
            href={back.href}
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground print:hidden"
          >
            <ChevronLeftIcon className="size-4" />
            {back.label}
          </Link>
        )}
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <div className="text-sm text-muted-foreground">{description}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2 print:hidden">{actions}</div>}
    </div>
  )
}
