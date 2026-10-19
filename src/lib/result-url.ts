import "server-only"
import { headers } from "next/headers"
import QRCode from "qrcode"

// Build the absolute patient URL from the host the staff member is using, so a
// QR generated while browsing via a LAN address also works from a phone.
export async function resultUrl(token: string) {
  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000"
  const proto = h.get("x-forwarded-proto")?.split(",")[0] ?? "http"
  return `${proto}://${host}/result/${token}`
}

export async function qrImages(url: string) {
  const [svg, png] = await Promise.all([
    QRCode.toString(url, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#0f172a" } }),
    QRCode.toDataURL(url, { width: 768, margin: 2, errorCorrectionLevel: "M" }),
  ])
  return { svg, png }
}
