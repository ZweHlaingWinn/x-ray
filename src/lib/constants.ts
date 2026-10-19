export const CLINIC_NAME = "Thukha Imaging Clinic, Yangon"

// The clinic mainly images tuberculosis (TB) patients, so chest views come first.
export const EXAM_TYPES = [
  "Chest X-ray (PA)",
  "Chest X-ray (AP)",
  "Chest X-ray (Lateral)",
  "Lumbar Spine X-ray",
  "Knee X-ray",
  "Hand X-ray",
] as const

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
