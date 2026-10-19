// The clinic is in Myanmar: timestamps display in Myanmar Time (UTC+06:30).
export const CLINIC_TIME_ZONE = "Asia/Yangon"

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})

const dateTimeFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: CLINIC_TIME_ZONE,
})

const clinicDateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: CLINIC_TIME_ZONE,
})

// en-CA formats as YYYY-MM-DD.
const isoDateFormat = new Intl.DateTimeFormat("en-CA", { timeZone: CLINIC_TIME_ZONE })

// Today's calendar date at the clinic, as YYYY-MM-DD.
export function todayInClinic() {
  return isoDateFormat.format(new Date())
}

// Plain YYYY-MM-DD values are calendar dates and are formatted as-is (UTC) so
// they never shift a day; full timestamps use the clinic's time zone.
export function formatDate(value: string | null | undefined) {
  if (!value) return "—"
  const isCalendarDate = value.length === 10
  const date = new Date(isCalendarDate ? `${value}T00:00:00Z` : value)
  if (Number.isNaN(date.getTime())) return value
  return (isCalendarDate ? dateFormat : clinicDateFormat).format(date)
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : `${dateTimeFormat.format(date)} MMT`
}

export function ageFrom(dateOfBirth: string, on: string) {
  if (!dateOfBirth || !on) return null
  const dob = new Date(`${dateOfBirth}T00:00:00Z`)
  const ref = new Date(`${on.slice(0, 10)}T00:00:00Z`)
  let age = ref.getUTCFullYear() - dob.getUTCFullYear()
  const beforeBirthday =
    ref.getUTCMonth() < dob.getUTCMonth() ||
    (ref.getUTCMonth() === dob.getUTCMonth() && ref.getUTCDate() < dob.getUTCDate())
  if (beforeBirthday) age -= 1
  return age
}
