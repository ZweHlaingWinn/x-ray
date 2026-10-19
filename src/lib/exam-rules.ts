import type { Examination, Patient } from "./types"

// Fields that must be filled in before a result can be released to the patient.
export const RELEASE_FIELDS: { key: keyof Patient | "examType" | "examDate"; label: string }[] = [
  { key: "name", label: "Patient name" },
  { key: "patientId", label: "Patient ID" },
  { key: "dateOfBirth", label: "Date of birth" },
  { key: "gender", label: "Gender" },
  { key: "phone", label: "Contact phone" },
  { key: "examType", label: "Examination type" },
  { key: "examDate", label: "Examination date" },
]

export function missingFields(exam: Examination): string[] {
  return RELEASE_FIELDS.filter(({ key }) => {
    const value =
      key === "examType" || key === "examDate" ? exam[key] : exam.patient[key]
    return !value?.trim()
  }).map(({ label }) => label)
}

export function isInfoComplete(exam: Examination) {
  return missingFields(exam).length === 0
}

export type QrEligibility = { eligible: true } | { eligible: false; reasons: string[] }

export function qrEligibility(exam: Examination): QrEligibility {
  const reasons: string[] = []
  if (exam.status !== "Finalized") reasons.push("Radiologist report is not finalized")
  const missing = missingFields(exam)
  if (missing.length) reasons.push(`Missing patient information: ${missing.join(", ")}`)
  return reasons.length ? { eligible: false, reasons } : { eligible: true }
}
