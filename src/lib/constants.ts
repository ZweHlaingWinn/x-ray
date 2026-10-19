export const CLINIC_NAME = "D Prime Specialist Clinic and Diagnostic Centre"

// The clinic mainly images tuberculosis (TB) patients, so chest views come first.
export const EXAM_TYPES = [
  "Chest X-ray (PA)",
  "Chest X-ray (AP)",
  "Chest X-ray (Lateral)",
  "Lumbar Spine X-ray",
  "Knee X-ray",
  "Hand X-ray",
] as const

// Shown in the centre of patient QR codes and as a watermark on the printed card.
export const QR_LOGO = "/brand/moh-logo.jpg"

// Share of the QR code's width the logo (with its white ring) may cover. Keep it
// small: error-correction level "H" can only recover about 30% of the code.
export const QR_LOGO_RATIO = 0.28

export const RADIOLOGISTS = [
  "Dr. Khin Myat Noe",
  "Dr. Aung Kyaw Min",
  "Dr. Su Mon Htet",
] as const

export const DEMO_USERS = {
  admin: { role: "admin", name: "Thandar Aye" },
  radiologist: { role: "radiologist", name: "Dr. Khin Myat Noe" },
} as const

export const DEMO_IMAGES = [
  { url: "/xrays/chest.svg", label: "Chest · clear" },
  { url: "/xrays/chest-tb.svg", label: "Chest · cavity" },
  { url: "/xrays/chest-healed.svg", label: "Chest · scarring" },
  { url: "/xrays/spine.svg", label: "Lumbar spine" },
  { url: "/xrays/knee.svg", label: "Knee" },
  { url: "/xrays/hand.svg", label: "Hand" },
] as const

// Uploaded demo images are stored inline as data URLs, so keep them small.
export const MAX_UPLOAD_BYTES = 1.5 * 1024 * 1024
