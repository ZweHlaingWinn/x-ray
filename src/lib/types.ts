export type Role = "admin" | "radiologist"

export type Session = {
  role: Role
  name: string
}

export type ExamStatus = "Pending" | "In Progress" | "Finalized"

export type Gender = "" | "Female" | "Male" | "Other"

// Each examination keeps its own copy of the patient's details, so editing one
// exam can never change another exam's record (PLAN.md §7).
export type Patient = {
  name: string
  patientId: string
  dateOfBirth: string
  gender: Gender
  phone: string
  email: string
}

export type ReportContent = {
  findings: string
  impression: string
  recommendations: string
}

// A finalized version that was later replaced through an amendment.
export type ReportRevision = ReportContent & {
  radiologistName: string
  finalizedAt: string
  supersededAt: string
  amendmentReason: string
}

export type Report = ReportContent & {
  radiologistName: string
  reportDate: string
  updatedAt: string
  finalizedAt: string | null
  amendedAt: string | null
  revisions: ReportRevision[]
}

export type QrAccess = {
  token: string
  generatedAt: string
  generatedBy: string
}

export type Examination = {
  id: string
  patient: Patient
  examType: string
  examDate: string
  referringDoctor: string
  clinicalNotes: string
  imageUrl: string | null
  imageName: string | null
  assignedRadiologist: string
  status: ExamStatus
  report: Report | null
  qr: QrAccess | null
  createdAt: string
  updatedAt: string
}

export type Activity = {
  id: string
  at: string
  actor: string
  examId: string
  message: string
}

export type Database = {
  nextSeq: number
  exams: Examination[]
  activity: Activity[]
}

export type ActionResult<T = undefined> =
  | { ok: true; message: string; data?: T }
  | { ok: false; message: string; fieldErrors?: Record<string, string> }
