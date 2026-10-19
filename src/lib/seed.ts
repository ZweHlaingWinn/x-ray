import type { Activity, Database, Examination, Patient, Report } from "./types"

// All people and results below are fictional demo data.

function patient(p: Partial<Patient> & { name: string }): Patient {
  return { patientId: "", dateOfBirth: "", gender: "", phone: "", email: "", ...p }
}

function report(
  r: Pick<Report, "findings" | "impression" | "recommendations" | "radiologistName" | "reportDate"> &
    Partial<Report>
): Report {
  return {
    updatedAt: `${r.reportDate}T10:30:00.000Z`,
    finalizedAt: null,
    amendedAt: null,
    revisions: [],
    ...r,
  }
}

// Ten examinations for a clinic that mostly images tuberculosis (TB) patients:
// screening, suspected TB, contact tracing and treatment follow-up.
const exams: Examination[] = [
  {
    id: "XR-2026-0001",
    patient: patient({
      name: "Aye Aye Mon",
      patientId: "PT-10421",
      dateOfBirth: "1986-03-14",
      gender: "Female",
      phone: "+95 9 254 101 420",
      email: "ayeayemon@example.com",
    }),
    examType: "Chest X-ray (PA)",
    examDate: "2026-10-06",
    referringDoctor: "Dr. Zaw Win Htut (TB clinic)",
    clinicalNotes: "TB contact screening. Household contact of a smear-positive case. Asymptomatic.",
    imageUrl: "/xrays/chest.svg",
    imageName: "chest-pa.svg",
    assignedRadiologist: "Dr. Khin Myat Noe",
    status: "Finalized",
    report: report({
      findings:
        "The lungs are clear bilaterally. No consolidation, cavitation, nodules or miliary pattern. No hilar or mediastinal lymphadenopathy. No pleural effusion. Heart size is normal.",
      impression: "No radiographic evidence of active or previous pulmonary tuberculosis.",
      recommendations:
        "No further imaging required. Continue contact follow-up as per the TB programme; repeat chest X-ray only if symptoms develop.",
      radiologistName: "Dr. Khin Myat Noe",
      reportDate: "2026-10-07",
      finalizedAt: "2026-10-07T11:02:00.000Z",
    }),
    qr: { token: "q7Hk2mVx9TcP4wLs8RbN3e", generatedAt: "2026-10-07T13:15:00.000Z", generatedBy: "Thandar Aye" },
    createdAt: "2026-10-06T08:40:00.000Z",
    updatedAt: "2026-10-07T13:15:00.000Z",
  },
  {
    id: "XR-2026-0002",
    patient: patient({
      name: "Kyaw Zin Htet",
      patientId: "PT-10388",
      dateOfBirth: "1972-11-02",
      gender: "Male",
      phone: "+95 9 254 101 780",
      email: "kyawzinhtet@example.com",
    }),
    examType: "Chest X-ray (PA)",
    examDate: "2026-08-04",
    referringDoctor: "Dr. Nilar Oo",
    clinicalNotes: "Cough for 6 weeks, night sweats, 5 kg weight loss. Suspected pulmonary TB.",
    imageUrl: "/xrays/chest-tb.svg",
    imageName: "chest-pa-baseline.svg",
    assignedRadiologist: "Dr. Aung Kyaw Min",
    status: "Finalized",
    report: report({
      findings:
        "Patchy consolidation in the right upper lobe with a thick-walled cavity measuring approximately 3 cm. Ill-defined nodular opacities in the right mid zone suggesting bronchogenic spread. Small opacity at the left apex. No pleural effusion. Heart size normal.",
      impression:
        "Right upper lobe cavitary consolidation with nodular spread, highly suggestive of active pulmonary tuberculosis.",
      recommendations:
        "Urgent sputum testing (smear microscopy and GeneXpert/NAAT). Airborne infection precautions until TB is excluded. Repeat chest X-ray after 2 months of treatment.",
      radiologistName: "Dr. Aung Kyaw Min",
      reportDate: "2026-08-04",
      finalizedAt: "2026-08-04T15:45:00.000Z",
    }),
    qr: { token: "Zp4sW1yGd8KqR6nVb2XmTa", generatedAt: "2026-08-05T09:20:00.000Z", generatedBy: "Thandar Aye" },
    createdAt: "2026-08-04T09:10:00.000Z",
    updatedAt: "2026-08-05T09:20:00.000Z",
  },
  {
    id: "XR-2026-0003",
    patient: patient({
      name: "Hnin Wai Phyo",
      patientId: "PT-10502",
      dateOfBirth: "1995-07-21",
      gender: "Female",
      phone: "+95 9 254 101 930",
      email: "hninwaiphyo@example.com",
    }),
    examType: "Chest X-ray (PA)",
    examDate: "2026-10-12",
    referringDoctor: "Dr. Zaw Win Htut (TB clinic)",
    clinicalNotes: "Pulmonary TB on treatment, end of intensive phase (month 2). Cough resolved.",
    imageUrl: "/xrays/chest-healed.svg",
    imageName: "chest-pa-month2.svg",
    assignedRadiologist: "Dr. Khin Myat Noe",
    status: "Finalized",
    report: report({
      findings:
        "Compared with the baseline study, the right upper lobe consolidation has largely resolved. Residual linear fibrotic strands and small calcified foci at the right apex. No cavity. No new opacity. No pleural effusion.",
      impression: "Good radiological response to TB treatment with residual fibrotic change.",
      recommendations: "Continue treatment as prescribed. Chest X-ray at the end of treatment (month 6).",
      radiologistName: "Dr. Khin Myat Noe",
      reportDate: "2026-10-13",
      finalizedAt: "2026-10-13T10:20:00.000Z",
    }),
    qr: null,
    createdAt: "2026-10-12T14:05:00.000Z",
    updatedAt: "2026-10-13T10:20:00.000Z",
  },
  {
    id: "XR-2026-0004",
    patient: patient({ name: "Min Thu Aung", patientId: "PT-10511", gender: "Male" }),
    examType: "Chest X-ray (PA)",
    examDate: "2026-10-13",
    referringDoctor: "",
    clinicalNotes: "Productive cough for 3 weeks, low-grade fever. Rule out TB.",
    imageUrl: "/xrays/chest-tb.svg",
    imageName: "chest-pa.svg",
    assignedRadiologist: "Dr. Su Mon Htet",
    status: "Finalized",
    report: report({
      findings:
        "Consolidation in the right upper zone with a central lucency in keeping with early cavitation. Mild right hilar fullness. Left lung clear. No pleural effusion.",
      impression: "Right upper zone cavitating consolidation, suspicious for active pulmonary tuberculosis.",
      recommendations:
        "Sputum for AFB smear and GeneXpert/NAAT. Clinical review at the TB clinic. Infection control precautions pending results.",
      radiologistName: "Dr. Su Mon Htet",
      reportDate: "2026-10-14",
      finalizedAt: "2026-10-14T16:10:00.000Z",
    }),
    qr: null,
    createdAt: "2026-10-13T11:30:00.000Z",
    updatedAt: "2026-10-14T16:10:00.000Z",
  },
  {
    id: "XR-2026-0005",
    patient: patient({
      name: "Khin Mar Lwin",
      patientId: "PT-10377",
      dateOfBirth: "1958-01-30",
      gender: "Female",
      phone: "+95 9 254 101 160",
      email: "",
    }),
    examType: "Chest X-ray (PA)",
    examDate: "2026-10-15",
    referringDoctor: "Dr. Nilar Oo",
    clinicalNotes: "End of TB treatment (month 6). Asymptomatic.",
    imageUrl: "/xrays/chest-healed.svg",
    imageName: "chest-pa-month6.svg",
    assignedRadiologist: "Dr. Khin Myat Noe",
    status: "In Progress",
    report: report({
      findings:
        "Fibrocalcific scarring at the right apex with mild volume loss. Several small calcified granulomas.",
      impression: "",
      recommendations: "",
      radiologistName: "Dr. Khin Myat Noe",
      reportDate: "2026-10-16",
    }),
    qr: null,
    createdAt: "2026-10-15T09:00:00.000Z",
    updatedAt: "2026-10-16T08:50:00.000Z",
  },
  {
    id: "XR-2026-0006",
    patient: patient({
      name: "Kyaw Zin Htet",
      patientId: "PT-10388",
      dateOfBirth: "1972-11-02",
      gender: "Male",
      phone: "+95 9 254 101 780",
      email: "kyawzinhtet@example.com",
    }),
    examType: "Chest X-ray (PA)",
    examDate: "2026-10-16",
    referringDoctor: "Dr. Nilar Oo",
    clinicalNotes: "Follow-up after 2 months of TB treatment (baseline XR-2026-0002). Sputum converted.",
    imageUrl: "/xrays/chest-healed.svg",
    imageName: "chest-pa-followup.svg",
    assignedRadiologist: "Dr. Aung Kyaw Min",
    status: "In Progress",
    report: report({
      findings:
        "Compared with XR-2026-0002 (2026-08-04): the right upper lobe cavity is no longer seen. Consolidation has substantially decreased, with residual fibrotic strands.",
      impression: "Interval improvement consistent with treatment response.",
      recommendations: "",
      radiologistName: "Dr. Aung Kyaw Min",
      reportDate: "2026-10-17",
    }),
    qr: null,
    createdAt: "2026-10-16T10:15:00.000Z",
    updatedAt: "2026-10-17T09:05:00.000Z",
  },
  {
    id: "XR-2026-0007",
    patient: patient({
      name: "Thant Zin Oo",
      patientId: "PT-10533",
      dateOfBirth: "2001-05-09",
      gender: "Male",
      phone: "+95 9 254 101 270",
      email: "thantzinoo@example.com",
    }),
    examType: "Chest X-ray (PA)",
    examDate: "2026-10-17",
    referringDoctor: "Dr. Thet Naing",
    clinicalNotes: "Pre-employment TB screening (healthcare worker). Positive IGRA, no symptoms.",
    imageUrl: "/xrays/chest.svg",
    imageName: "chest-pa.svg",
    assignedRadiologist: "Dr. Khin Myat Noe",
    status: "Pending",
    report: null,
    qr: null,
    createdAt: "2026-10-17T15:40:00.000Z",
    updatedAt: "2026-10-17T15:40:00.000Z",
  },
  {
    id: "XR-2026-0008",
    patient: patient({ name: "Su Myat Noe", gender: "Female", phone: "+95 9 254 101 640" }),
    examType: "Chest X-ray (PA)",
    examDate: "2026-10-18",
    referringDoctor: "",
    clinicalNotes: "Cough more than 2 weeks, haemoptysis once. HIV positive. Suspected TB.",
    imageUrl: "/xrays/chest-tb.svg",
    imageName: "chest-pa.svg",
    assignedRadiologist: "",
    status: "Pending",
    report: null,
    qr: null,
    createdAt: "2026-10-18T09:25:00.000Z",
    updatedAt: "2026-10-18T09:25:00.000Z",
  },
  {
    id: "XR-2026-0009",
    patient: patient({
      name: "Tun Tun Naing",
      patientId: "PT-10540",
      dateOfBirth: "1964-09-18",
      gender: "Male",
      phone: "+95 9 254 101 090",
      email: "tuntunnaing@example.com",
    }),
    examType: "Lumbar Spine X-ray",
    examDate: "2026-10-18",
    referringDoctor: "Dr. Zaw Win Htut (TB clinic)",
    clinicalNotes: "Back pain for 3 months, history of pulmonary TB. Assess for spinal TB (Pott's disease).",
    imageUrl: "/xrays/spine.svg",
    imageName: "lumbar-ap.svg",
    assignedRadiologist: "Dr. Su Mon Htet",
    status: "Pending",
    report: null,
    qr: null,
    createdAt: "2026-10-18T11:00:00.000Z",
    updatedAt: "2026-10-18T11:00:00.000Z",
  },
  {
    id: "XR-2026-0010",
    patient: patient({
      name: "Nan Ei Phyu",
      patientId: "PT-10299",
      dateOfBirth: "1979-12-05",
      gender: "Female",
      phone: "+95 9 254 101 850",
      email: "naneiphyu@example.com",
    }),
    examType: "Chest X-ray (PA)",
    examDate: "2026-10-02",
    referringDoctor: "Dr. Thet Naing",
    clinicalNotes: "TB contact screening (workplace contact). Mild cough.",
    imageUrl: "/xrays/chest-healed.svg",
    imageName: "chest-pa.svg",
    assignedRadiologist: "Dr. Su Mon Htet",
    status: "Finalized",
    report: report({
      findings:
        "Small calcified granuloma in the right upper zone with minimal adjacent linear scarring. No consolidation, cavitation or miliary nodules. No lymphadenopathy. No pleural effusion.",
      impression:
        "Old healed granulomatous change, likely previous TB infection. No radiographic sign of active tuberculosis.",
      recommendations:
        "No further imaging required. Clinical assessment for latent TB infection as per the TB programme.",
      radiologistName: "Dr. Su Mon Htet",
      reportDate: "2026-10-03",
      updatedAt: "2026-10-05T10:00:00.000Z",
      finalizedAt: "2026-10-05T10:00:00.000Z",
      amendedAt: "2026-10-05T10:00:00.000Z",
      revisions: [
        {
          findings:
            "Small calcified granuloma in the right upper zone. No consolidation. No pleural effusion.",
          impression: "No active pulmonary tuberculosis.",
          recommendations: "No follow-up required.",
          radiologistName: "Dr. Su Mon Htet",
          finalizedAt: "2026-10-03T14:30:00.000Z",
          supersededAt: "2026-10-05T10:00:00.000Z",
          amendmentReason:
            "Added that the granuloma likely reflects previous TB infection and recommended latent TB assessment.",
        },
      ],
    }),
    qr: { token: "Lr9cN5uBf3HwJ7tYq1VsKd", generatedAt: "2026-10-03T16:00:00.000Z", generatedBy: "Thandar Aye" },
    createdAt: "2026-10-02T10:20:00.000Z",
    updatedAt: "2026-10-05T10:00:00.000Z",
  },
]

const activity: Activity[] = [
  ["2026-10-18T11:00:00.000Z", "Thandar Aye", "XR-2026-0009", "Examination registered"],
  ["2026-10-18T09:25:00.000Z", "Thandar Aye", "XR-2026-0008", "Examination registered"],
  ["2026-10-17T15:40:00.000Z", "Thandar Aye", "XR-2026-0007", "Examination registered"],
  ["2026-10-17T09:05:00.000Z", "Dr. Aung Kyaw Min", "XR-2026-0006", "Report draft saved"],
  ["2026-10-16T08:50:00.000Z", "Dr. Khin Myat Noe", "XR-2026-0005", "Report draft saved"],
  ["2026-10-14T16:10:00.000Z", "Dr. Su Mon Htet", "XR-2026-0004", "Report finalized"],
  ["2026-10-13T10:20:00.000Z", "Dr. Khin Myat Noe", "XR-2026-0003", "Report finalized"],
  ["2026-10-07T13:15:00.000Z", "Thandar Aye", "XR-2026-0001", "Patient QR code generated"],
  ["2026-10-05T10:00:00.000Z", "Dr. Su Mon Htet", "XR-2026-0010", "Finalized report amended"],
].map(([at, actor, examId, message], i) => ({ id: `seed-${i}`, at, actor, examId, message }))

export function createSeedDatabase(): Database {
  return structuredClone({ nextSeq: exams.length + 1, exams, activity })
}
