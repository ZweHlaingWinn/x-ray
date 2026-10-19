"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { DEMO_IMAGES, EXAM_TYPES, MAX_UPLOAD_BYTES, RADIOLOGISTS } from "@/lib/constants"
import { getExam, logActivity, mutate, newResultToken, nextExamId, resetDatabase } from "@/lib/db"
import { qrEligibility } from "@/lib/exam-rules"
import { todayInClinic } from "@/lib/format"
import { SESSION_COOKIE, getSession } from "@/lib/session"
import type {
  ActionResult,
  Database,
  Examination,
  Gender,
  ReportContent,
  Role,
  Session,
} from "@/lib/types"

class ActionError extends Error {}

// Server actions are public endpoints, so every one re-checks the role itself.
async function authorize(...roles: Role[]): Promise<Session> {
  const session = await getSession()
  if (!session || !roles.includes(session.role)) {
    throw new ActionError("You are not allowed to perform this action.")
  }
  return session
}

function findExam(db: Database, id: string): Examination {
  const exam = db.exams.find((e) => e.id === id)
  if (!exam) throw new ActionError(`Examination ${id} was not found.`)
  return exam
}

async function run<T>(fn: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    const result = await fn()
    revalidatePath("/", "layout")
    return result
  } catch (error) {
    if (error instanceof ActionError) return { ok: false, message: error.message }
    throw error
  }
}

/* ---------- Demo login ---------- */

export async function login(role: Role) {
  if (role !== "admin" && role !== "radiologist") return
  ;(await cookies()).set(SESSION_COOKIE, role, { httpOnly: true, sameSite: "lax", path: "/" })
  redirect(role === "radiologist" ? "/worklist" : "/dashboard")
}

export async function logout() {
  ;(await cookies()).delete(SESSION_COOKIE)
  redirect("/")
}

export async function resetDemoData(): Promise<ActionResult> {
  await resetDatabase()
  revalidatePath("/", "layout")
  return { ok: true, message: "Demo data has been reset to the original sample records." }
}

/* ---------- Examination records (clinic helper) ---------- */

const GENDERS: Gender[] = ["", "Female", "Male", "Other"]

function text(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim()
}

function parseExamForm(form: FormData) {
  const values = {
    name: text(form, "name"),
    patientId: text(form, "patientId").toUpperCase(),
    dateOfBirth: text(form, "dateOfBirth"),
    gender: text(form, "gender") as Gender,
    phone: text(form, "phone"),
    email: text(form, "email"),
    examType: text(form, "examType"),
    examDate: text(form, "examDate"),
    referringDoctor: text(form, "referringDoctor"),
    clinicalNotes: text(form, "clinicalNotes"),
    assignedRadiologist: text(form, "assignedRadiologist"),
    imageUrl: text(form, "imageUrl"),
    imageName: text(form, "imageName"),
  }

  const errors: Record<string, string> = {}
  const today = todayInClinic()
  if (!values.name) errors.name = "Patient name is required."
  if (values.patientId && !/^[A-Z0-9-]{3,20}$/.test(values.patientId))
    errors.patientId = "Use letters, numbers and dashes only (e.g. PT-10421)."
  if (values.dateOfBirth && values.dateOfBirth > today)
    errors.dateOfBirth = "Date of birth cannot be in the future."
  if (!GENDERS.includes(values.gender)) errors.gender = "Select a valid option."
  if (values.phone && !/^\+?[0-9 ()-]{6,20}$/.test(values.phone))
    errors.phone = "Enter a valid phone number."
  if (values.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email))
    errors.email = "Enter a valid email address."
  if (!EXAM_TYPES.includes(values.examType as (typeof EXAM_TYPES)[number]))
    errors.examType = "Select an examination type."
  if (!values.examDate) errors.examDate = "Examination date is required."
  else if (values.examDate > today) errors.examDate = "Examination date cannot be in the future."
  if (
    values.assignedRadiologist &&
    !RADIOLOGISTS.includes(values.assignedRadiologist as (typeof RADIOLOGISTS)[number])
  )
    errors.assignedRadiologist = "Select a radiologist."
  if (values.imageUrl) {
    const isDemo = DEMO_IMAGES.some((img) => img.url === values.imageUrl)
    const isUpload = /^data:image\/(png|jpeg|webp|gif|svg\+xml);base64,/.test(values.imageUrl)
    if (!isDemo && !isUpload) errors.image = "Choose a demo image or upload an image file."
    if (isUpload && values.imageUrl.length > (MAX_UPLOAD_BYTES * 4) / 3 + 100)
      errors.image = "Uploaded image is too large for the demo (max 1.5 MB)."
  }

  return { values, errors }
}

export async function createExam(
  _prev: ActionResult<{ id: string }> | null,
  form: FormData
): Promise<ActionResult<{ id: string }>> {
  return run(async () => {
    const session = await authorize("admin")
    const { values, errors } = parseExamForm(form)
    if (Object.keys(errors).length)
      return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: errors }

    const id = await mutate((db) => {
      const now = new Date().toISOString()
      const exam: Examination = {
        id: nextExamId(db),
        patient: {
          name: values.name,
          patientId: values.patientId,
          dateOfBirth: values.dateOfBirth,
          gender: values.gender,
          phone: values.phone,
          email: values.email,
        },
        examType: values.examType,
        examDate: values.examDate,
        referringDoctor: values.referringDoctor,
        clinicalNotes: values.clinicalNotes,
        imageUrl: values.imageUrl || null,
        imageName: values.imageUrl ? values.imageName || "image" : null,
        assignedRadiologist: values.assignedRadiologist,
        status: "Pending",
        report: null,
        qr: null,
        createdAt: now,
        updatedAt: now,
      }
      db.exams.push(exam)
      logActivity(db, session.name, exam.id, "Examination registered")
      return exam.id
    })
    return { ok: true, message: `Examination ${id} created.`, data: { id } }
  })
}

export async function updateExam(
  id: string,
  _prev: ActionResult<{ id: string }> | null,
  form: FormData
): Promise<ActionResult<{ id: string }>> {
  return run(async () => {
    const session = await authorize("admin")
    const current = await getExam(id)
    if (!current) throw new ActionError(`Examination ${id} was not found.`)

    // Once the report is finalized the exam details it describes are locked;
    // the form disables them, and here we keep the stored values regardless.
    if (current.status === "Finalized") {
      form.set("examType", current.examType)
      form.set("examDate", current.examDate)
      form.set("imageUrl", current.imageUrl ?? "")
      form.set("imageName", current.imageName ?? "")
    }
    const { values, errors } = parseExamForm(form)
    if (Object.keys(errors).length)
      return { ok: false, message: "Please fix the highlighted fields.", fieldErrors: errors }

    await mutate((db) => {
      const exam = findExam(db, id)
      exam.patient = {
        name: values.name,
        patientId: values.patientId,
        dateOfBirth: values.dateOfBirth,
        gender: values.gender,
        phone: values.phone,
        email: values.email,
      }
      exam.examType = values.examType
      exam.examDate = values.examDate
      exam.referringDoctor = values.referringDoctor
      exam.clinicalNotes = values.clinicalNotes
      exam.assignedRadiologist = values.assignedRadiologist
      exam.imageUrl = values.imageUrl || null
      exam.imageName = values.imageUrl ? values.imageName || "image" : null
      exam.updatedAt = new Date().toISOString()
      logActivity(db, session.name, id, "Patient and examination details updated")
    })
    return { ok: true, message: `Examination ${id} updated.`, data: { id } }
  })
}

/* ---------- Radiologist reporting ---------- */

function cleanContent(content: ReportContent): ReportContent {
  return {
    findings: String(content.findings ?? "").trim(),
    impression: String(content.impression ?? "").trim(),
    recommendations: String(content.recommendations ?? "").trim(),
  }
}

function requireFinalizable(content: ReportContent) {
  const fieldErrors: Record<string, string> = {}
  if (!content.findings) fieldErrors.findings = "Findings are required to finalize."
  if (!content.impression) fieldErrors.impression = "Impression is required to finalize."
  return fieldErrors
}

export async function saveReportDraft(id: string, input: ReportContent): Promise<ActionResult> {
  return run(async () => {
    const session = await authorize("radiologist")
    const content = cleanContent(input)
    await mutate((db) => {
      const exam = findExam(db, id)
      if (exam.status === "Finalized") {
        throw new ActionError(
          "This report is finalized and cannot be overwritten. Use “Amend report” to issue a correction."
        )
      }
      const now = new Date().toISOString()
      exam.report = {
        ...content,
        radiologistName: session.name,
        reportDate: todayInClinic(),
        updatedAt: now,
        finalizedAt: null,
        amendedAt: null,
        revisions: [],
      }
      exam.status = "In Progress"
      exam.assignedRadiologist ||= session.name
      exam.updatedAt = now
      logActivity(db, session.name, id, "Report draft saved")
    })
    return { ok: true, message: "Draft saved. The report is now In Progress." }
  })
}

export async function finalizeReport(id: string, input: ReportContent): Promise<ActionResult> {
  return run(async () => {
    const session = await authorize("radiologist")
    const content = cleanContent(input)
    const fieldErrors = requireFinalizable(content)
    if (Object.keys(fieldErrors).length)
      return { ok: false, message: "Complete the required fields before finalizing.", fieldErrors }

    await mutate((db) => {
      const exam = findExam(db, id)
      if (exam.status === "Finalized") {
        throw new ActionError("This report is already finalized. Use “Amend report” to correct it.")
      }
      const now = new Date().toISOString()
      exam.report = {
        ...content,
        radiologistName: session.name,
        reportDate: todayInClinic(),
        updatedAt: now,
        finalizedAt: now,
        amendedAt: null,
        revisions: [],
      }
      exam.status = "Finalized"
      exam.assignedRadiologist ||= session.name
      exam.updatedAt = now
      logActivity(db, session.name, id, "Report finalized")
    })
    return { ok: true, message: "Report finalized. It can now be released to the patient." }
  })
}

export async function amendReport(
  id: string,
  input: ReportContent,
  reasonInput: string
): Promise<ActionResult> {
  return run(async () => {
    const session = await authorize("radiologist")
    const content = cleanContent(input)
    const reason = String(reasonInput ?? "").trim()
    const fieldErrors = requireFinalizable(content)
    if (reason.length < 10) fieldErrors.reason = "Describe the reason for the amendment (10+ characters)."
    if (Object.keys(fieldErrors).length)
      return { ok: false, message: "Complete the required fields before amending.", fieldErrors }

    await mutate((db) => {
      const exam = findExam(db, id)
      const report = exam.report
      if (exam.status !== "Finalized" || !report?.finalizedAt) {
        throw new ActionError("Only finalized reports can be amended.")
      }
      const now = new Date().toISOString()
      // Keep the superseded version so the correction is auditable.
      report.revisions.push({
        findings: report.findings,
        impression: report.impression,
        recommendations: report.recommendations,
        radiologistName: report.radiologistName,
        finalizedAt: report.finalizedAt,
        supersededAt: now,
        amendmentReason: reason,
      })
      Object.assign(report, content, {
        radiologistName: session.name,
        updatedAt: now,
        finalizedAt: now,
        amendedAt: now,
      })
      exam.updatedAt = now
      logActivity(db, session.name, id, "Finalized report amended")
    })
    return { ok: true, message: "Amendment finalized. The previous version is kept in the report history." }
  })
}

/* ---------- Patient QR access (clinic helper) ---------- */

export async function generateQr(id: string, regenerate = false): Promise<ActionResult> {
  return run(async () => {
    const session = await authorize("admin")
    await mutate((db) => {
      const exam = findExam(db, id)
      const eligibility = qrEligibility(exam)
      if (!eligibility.eligible) throw new ActionError(eligibility.reasons.join(". "))
      if (exam.qr && !regenerate) throw new ActionError("A QR code already exists for this examination.")
      exam.qr = { token: newResultToken(), generatedAt: new Date().toISOString(), generatedBy: session.name }
      exam.updatedAt = exam.qr.generatedAt
      logActivity(
        db,
        session.name,
        id,
        regenerate ? "Patient QR code regenerated (previous link revoked)" : "Patient QR code generated"
      )
    })
    return {
      ok: true,
      message: regenerate
        ? "New QR code generated. The previous link no longer works."
        : "QR code generated for the patient.",
    }
  })
}
