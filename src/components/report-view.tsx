import { HistoryIcon } from "lucide-react"
import { formatDateTime } from "@/lib/format"
import type { Report, ReportContent } from "@/lib/types"

export function ReportSections({ content, className }: { content: ReportContent; className?: string }) {
  const sections = [
    { title: "Findings", body: content.findings },
    { title: "Impression", body: content.impression },
    { title: "Recommendations", body: content.recommendations },
  ]
  return (
    <div className={className}>
      {sections.map(({ title, body }) => (
        <section key={title} className="mb-5 last:mb-0">
          <h3 className="mb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{title}</h3>
          <p className="leading-relaxed whitespace-pre-wrap">
            {body || <span className="text-muted-foreground italic">Not provided</span>}
          </p>
        </section>
      ))}
    </div>
  )
}

export function RevisionHistory({ report }: { report: Report }) {
  if (!report.revisions.length) return null
  return (
    <details className="group rounded-lg border bg-muted/30 p-3 text-sm">
      <summary className="flex cursor-pointer items-center gap-2 font-medium">
        <HistoryIcon className="size-4 text-muted-foreground" />
        Amendment history ({report.revisions.length} earlier version{report.revisions.length > 1 ? "s" : ""})
      </summary>
      <ol className="mt-3 space-y-4">
        {report.revisions.toReversed().map((rev) => (
          <li key={rev.supersededAt} className="rounded-md border bg-background p-3">
            <p className="text-xs text-muted-foreground">
              Finalized {formatDateTime(rev.finalizedAt)} by {rev.radiologistName} · superseded{" "}
              {formatDateTime(rev.supersededAt)}
            </p>
            <p className="mt-1 text-xs">
              <span className="font-medium">Reason for amendment:</span> {rev.amendmentReason}
            </p>
            <ReportSections content={rev} className="mt-3 text-muted-foreground" />
          </li>
        ))}
      </ol>
    </details>
  )
}
