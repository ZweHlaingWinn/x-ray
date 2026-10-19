"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CheckIcon, ImageOffIcon, LockIcon, TriangleAlertIcon, UploadIcon } from "lucide-react"
import { toast } from "sonner"
import { Field, nativeSelectClass } from "@/components/form-field"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useHydrated } from "@/hooks/use-hydrated"
import { DEMO_IMAGES, EXAM_TYPES, MAX_UPLOAD_BYTES, RADIOLOGISTS } from "@/lib/constants"
import { RELEASE_FIELDS } from "@/lib/exam-rules"
import { todayInClinic } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { ActionResult, Examination } from "@/lib/types"

type Action = (prev: ActionResult<{ id: string }> | null, form: FormData) => Promise<ActionResult<{ id: string }>>

const RELEASE_KEYS = new Set<string>(RELEASE_FIELDS.map((f) => f.key))

export function ExamForm({ exam, action }: { exam?: Examination; action: Action }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [image, setImage] = useState({ url: exam?.imageUrl ?? "", name: exam?.imageName ?? "" })
  const [values, setValues] = useState<Record<string, string>>(() => ({
    ...exam?.patient,
    examType: exam?.examType ?? "",
    examDate: exam?.examDate ?? "",
  }))
  const fileInput = useRef<HTMLInputElement>(null)
  const hydrated = useHydrated()

  const locked = exam?.status === "Finalized"
  const isMissing = (key: string) => RELEASE_KEYS.has(key) && !values[key]?.trim()
  const missingCount = RELEASE_FIELDS.filter((f) => isMissing(f.key)).length
  const today = todayInClinic()

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    startTransition(async () => {
      const result = await action(null, form)
      if (result.ok) {
        toast.success(result.message)
        router.push(`/records/${result.data?.id ?? exam?.id}`)
      } else {
        setErrors(result.fieldErrors ?? {})
        toast.error(result.message)
      }
    })
  }

  function onFile(file: File | undefined) {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setErrors((e) => ({ ...e, image: "Please choose an image file (PNG, JPEG, WebP or SVG)." }))
      return
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setErrors((e) => ({ ...e, image: "Image is too large for the demo (max 1.5 MB)." }))
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setImage({ url: String(reader.result), name: file.name })
      setErrors((e) => {
        const next = { ...e }
        delete next.image
        return next
      })
    }
    reader.readAsDataURL(file)
  }

  // Shared props for text-like inputs: validation state + live "missing" tracking.
  const input = (name: string) => ({
    id: name,
    name,
    defaultValue: values[name] ?? "",
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setValues((v) => ({ ...v, [name]: e.target.value })),
  })

  const isUpload = image.url.startsWith("data:")

  return (
    // method="post" keeps patient data out of the URL if submitted before hydration.
    <form method="post" onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Patient information</CardTitle>
            <CardDescription>
              Fields marked <span className="text-destructive">*</span> are required to save. Fields tagged
              “needed for release” must be completed before a QR code can be generated.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field id="name" label="Patient full name" required error={errors.name} className="sm:col-span-2">
              <Input {...input("name")} required autoComplete="off" placeholder="e.g. Aung Aung" />
            </Field>
            <Field id="patientId" label="Patient ID" releaseRequired missing={isMissing("patientId")} error={errors.patientId} hint="Clinic patient number, e.g. PT-10421">
              <Input {...input("patientId")} placeholder="PT-00000" />
            </Field>
            <Field id="dateOfBirth" label="Date of birth" releaseRequired missing={isMissing("dateOfBirth")} error={errors.dateOfBirth}>
              <Input {...input("dateOfBirth")} type="date" max={today} />
            </Field>
            <Field id="gender" label="Gender" releaseRequired missing={isMissing("gender")} error={errors.gender}>
              <select {...input("gender")} className={nativeSelectClass}>
                <option value="">Select…</option>
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </select>
            </Field>
            <Field id="phone" label="Contact phone" releaseRequired missing={isMissing("phone")} error={errors.phone}>
              <Input {...input("phone")} type="tel" placeholder="+95 9 xxx xxx xxx" />
            </Field>
            <Field id="email" label="Email" error={errors.email} hint="Optional" className="sm:col-span-2">
              <Input {...input("email")} type="email" placeholder="name@example.com" />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Examination</CardTitle>
            {locked && (
              <CardDescription className="flex items-center gap-1.5 text-amber-700">
                <LockIcon className="size-3.5" />
                The report is finalized, so examination type, date and image are locked.
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field id="examType" label="Examination type" required error={errors.examType}>
              <select {...input("examType")} required disabled={locked} className={nativeSelectClass}>
                <option value="">Select…</option>
                {EXAM_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field id="examDate" label="Examination date" required error={errors.examDate}>
              <Input {...input("examDate")} type="date" required max={today} disabled={locked} />
            </Field>
            <Field id="referringDoctor" label="Referring doctor" hint="Where applicable" error={errors.referringDoctor}>
              <Input {...input("referringDoctor")} defaultValue={exam?.referringDoctor ?? ""} placeholder="Dr. …" />
            </Field>
            <Field id="assignedRadiologist" label="Assigned radiologist" error={errors.assignedRadiologist}>
              <select
                {...input("assignedRadiologist")}
                defaultValue={exam?.assignedRadiologist ?? ""}
                className={nativeSelectClass}
              >
                <option value="">Unassigned</option>
                {RADIOLOGISTS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Field>
            <Field id="clinicalNotes" label="Clinical notes / reason for exam" className="sm:col-span-2">
              <Textarea
                id="clinicalNotes"
                name="clinicalNotes"
                defaultValue={exam?.clinicalNotes ?? ""}
                rows={3}
                placeholder="Symptoms, history or the clinical question for the radiologist"
              />
            </Field>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>X-ray image</CardTitle>
            <CardDescription>Select a sample image or upload a demo file.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <input type="hidden" name="imageUrl" value={image.url} />
            <input type="hidden" name="imageName" value={image.name} />
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Demo images">
              {DEMO_IMAGES.map((img) => {
                const selected = image.url === img.url
                return (
                  <button
                    key={img.url}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={locked}
                    onClick={() => setImage({ url: img.url, name: img.url.split("/").pop() ?? "" })}
                    className={cn(
                      "group relative overflow-hidden rounded-lg border-2 bg-black text-left transition disabled:cursor-not-allowed disabled:opacity-50",
                      selected ? "border-primary" : "border-transparent hover:border-primary/40"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt="" className="aspect-square w-full object-cover opacity-90" />
                    <span className="absolute inset-x-0 bottom-0 bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                      {img.label}
                    </span>
                    {selected && (
                      <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <CheckIcon className="size-3" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            {isUpload && (
              <div className="flex items-center gap-3 rounded-lg border p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt="" className="size-12 rounded bg-black object-contain" />
                <span className="min-w-0 flex-1 truncate text-sm">{image.name}</span>
                <CheckIcon className="size-4 text-primary" />
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <input
                ref={fileInput}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => onFile(e.target.files?.[0])}
              />
              <Button type="button" variant="outline" size="sm" disabled={locked} onClick={() => fileInput.current?.click()}>
                <UploadIcon />
                Upload image
              </Button>
              {image.url && (
                <Button type="button" variant="ghost" size="sm" disabled={locked} onClick={() => setImage({ url: "", name: "" })}>
                  <ImageOffIcon />
                  No image
                </Button>
              )}
            </div>
            {errors.image && <p className="text-xs text-destructive">{errors.image}</p>}
          </CardContent>
        </Card>

        <Card className={missingCount ? "ring-orange-200" : "ring-emerald-200"}>
          <CardContent className="flex gap-3">
            {missingCount ? (
              <TriangleAlertIcon className="mt-0.5 size-5 shrink-0 text-orange-600" />
            ) : (
              <CheckIcon className="mt-0.5 size-5 shrink-0 text-emerald-600" />
            )}
            <div className="text-sm">
              <p className="font-medium">
                {missingCount ? `${missingCount} field${missingCount > 1 ? "s" : ""} missing for release` : "Ready for release"}
              </p>
              <p className="text-muted-foreground">
                {missingCount
                  ? RELEASE_FIELDS.filter((f) => isMissing(f.key)).map((f) => f.label).join(", ")
                  : "All patient information needed for the QR result page is complete."}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          <Button type="submit" size="lg" disabled={!hydrated || pending} className="flex-1">
            {pending ? "Saving…" : exam ? "Save changes" : "Create examination"}
          </Button>
          <Button type="button" variant="outline" size="lg" className="flex-1" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </div>
    </form>
  )
}
