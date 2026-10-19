"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2Icon, FilePenLineIcon, LockIcon, SaveIcon } from "lucide-react"
import { toast } from "sonner"
import { amendReport, finalizeReport, saveReportDraft } from "@/app/actions"
import { Field } from "@/components/form-field"
import { ReportSections, RevisionHistory } from "@/components/report-view"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { formatDate, formatDateTime, todayInClinic } from "@/lib/format"
import type { ActionResult, Examination, ReportContent } from "@/lib/types"

type Mode = "edit" | "view" | "amend"

export function ReportEditor({ exam, radiologistName }: { exam: Examination; radiologistName: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const finalized = exam.status === "Finalized"
  const [mode, setMode] = useState<Mode>(finalized ? "view" : "edit")
  const initial: ReportContent = {
    findings: exam.report?.findings ?? "",
    impression: exam.report?.impression ?? "",
    recommendations: exam.report?.recommendations ?? "",
  }
  const [content, setContent] = useState(initial)
  const [reason, setReason] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [confirmOpen, setConfirmOpen] = useState(false)

  const dirty = JSON.stringify(content) !== JSON.stringify(initial)
  const today = todayInClinic()

  function submit(fn: () => Promise<ActionResult>) {
    startTransition(async () => {
      const result = await fn()
      if (result.ok) {
        setErrors({})
        toast.success(result.message)
        router.refresh()
      } else {
        setErrors(result.fieldErrors ?? {})
        toast.error(result.message)
      }
    })
  }

  function openConfirm() {
    // Check required fields before asking for confirmation; the server checks again.
    const next: Record<string, string> = {}
    if (!content.findings.trim()) next.findings = "Findings are required to finalize."
    if (!content.impression.trim()) next.impression = "Impression is required to finalize."
    if (mode === "amend" && reason.trim().length < 10)
      next.reason = "Describe the reason for the amendment (10+ characters)."
    setErrors(next)
    if (Object.keys(next).length) {
      toast.error("Complete the required fields first.")
      return
    }
    setConfirmOpen(true)
  }

  if (mode === "view" && exam.report) {
    const report = exam.report
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2">
            <CheckCircle2Icon className="size-5 text-emerald-600" />
            Finalized report
            {report.amendedAt && (
              <span className="rounded-full bg-violet-50 px-2 py-0.5 text-xs font-normal text-violet-800">
                Amended
              </span>
            )}
          </CardTitle>
          <CardDescription>
            {report.radiologistName} · finalized {formatDateTime(report.finalizedAt)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ReportSections content={report} />
          <RevisionHistory report={report} />
          <p className="flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
            <LockIcon className="mt-0.5 size-3.5 shrink-0" />
            Finalized reports are locked and cannot be overwritten. To correct this report, issue an amendment.
            The current version will be kept in the amendment history.
          </p>
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t">
          <Button variant="outline" onClick={() => setMode("amend")}>
            <FilePenLineIcon />
            Amend report
          </Button>
        </CardFooter>
      </Card>
    )
  }

  const amending = mode === "amend"

  return (
    <Card className={amending ? "ring-violet-300" : undefined}>
      <CardHeader>
        <CardTitle>{amending ? "Amend finalized report" : exam.report ? "Edit draft report" : "New report"}</CardTitle>
        <CardDescription>
          {amending
            ? "You are issuing a correction. The patient will see the amended version with an “amended” notice."
            : exam.report
              ? `Draft last saved ${formatDateTime(exam.report.updatedAt)}. Drafts are never shown to patients.`
              : "Start the report. Save a draft at any time; finalize when complete."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {amending && (
          <Field id="reason" label="Reason for amendment" required error={errors.reason}>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="e.g. Corrected laterality in findings"
              aria-invalid={errors.reason ? true : undefined}
            />
          </Field>
        )}
        <Field id="findings" label="Clinical findings" required error={errors.findings}>
          <Textarea
            id="findings"
            value={content.findings}
            onChange={(e) => setContent((c) => ({ ...c, findings: e.target.value }))}
            rows={7}
            placeholder="Describe the radiographic findings…"
            aria-invalid={errors.findings ? true : undefined}
          />
        </Field>
        <Field id="impression" label="Impression / opinion" required error={errors.impression}>
          <Textarea
            id="impression"
            value={content.impression}
            onChange={(e) => setContent((c) => ({ ...c, impression: e.target.value }))}
            rows={3}
            placeholder="Summary diagnosis or opinion"
            aria-invalid={errors.impression ? true : undefined}
          />
        </Field>
        <Field id="recommendations" label="Recommendations / follow-up">
          <Textarea
            id="recommendations"
            value={content.recommendations}
            onChange={(e) => setContent((c) => ({ ...c, recommendations: e.target.value }))}
            rows={3}
            placeholder="Further imaging, clinical correlation, follow-up interval…"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="radiologistName" label="Radiologist">
            <input
              id="radiologistName"
              readOnly
              value={radiologistName}
              className="h-8 rounded-lg border bg-muted/50 px-2.5 text-sm"
            />
          </Field>
          <Field id="reportDate" label="Report date">
            <input
              id="reportDate"
              readOnly
              value={formatDate(today)}
              className="h-8 rounded-lg border bg-muted/50 px-2.5 text-sm"
            />
          </Field>
        </div>
      </CardContent>
      <CardFooter className="flex-wrap justify-between gap-2 border-t">
        <span className="text-xs text-muted-foreground">{dirty ? "Unsaved changes" : "No unsaved changes"}</span>
        <div className="flex flex-wrap gap-2">
          {amending ? (
            <Button
              variant="ghost"
              disabled={pending}
              onClick={() => {
                setContent(initial)
                setReason("")
                setErrors({})
                setMode("view")
              }}
            >
              Cancel amendment
            </Button>
          ) : (
            <Button
              variant="outline"
              disabled={pending}
              onClick={() => submit(() => saveReportDraft(exam.id, content))}
            >
              <SaveIcon />
              Save draft
            </Button>
          )}
          <Button disabled={pending} onClick={openConfirm}>
            <CheckCircle2Icon />
            {amending ? "Finalize amendment" : "Finalize report"}
          </Button>
        </div>
      </CardFooter>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{amending ? "Finalize amendment?" : "Finalize this report?"}</DialogTitle>
            <DialogDescription>
              {amending
                ? "The amended report replaces the current version for the patient. The previous version and your reason are kept in the history."
                : `Once finalized, the report for ${exam.patient.name} (${exam.id}) is locked and can be released to the patient. Later corrections require a formal amendment.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Keep editing</DialogClose>
            <Button
              disabled={pending}
              onClick={() => {
                setConfirmOpen(false)
                submit(() =>
                  amending ? amendReport(exam.id, content, reason) : finalizeReport(exam.id, content)
                )
              }}
            >
              {amending ? "Finalize amendment" : "Finalize report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
