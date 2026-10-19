"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  CopyIcon,
  DownloadIcon,
  ExternalLinkIcon,
  PrinterIcon,
  QrCodeIcon,
  RefreshCwIcon,
} from "lucide-react"
import { toast } from "sonner"
import { generateQr } from "@/app/actions"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CLINIC_NAME, QR_LOGO, QR_LOGO_RATIO } from "@/lib/constants"

type Props = {
  examId: string
  patientName: string
  examType: string
  examDate: string
  url: string | null
  svg: string | null
  png: string | null
  stillEligible: boolean
}

export function QrPanel({ examId, patientName, examType, examDate, url, svg, png, stillEligible }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function generate(regenerate: boolean) {
    startTransition(async () => {
      const result = await generateQr(examId, regenerate)
      if (result.ok) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.message)
      }
    })
  }

  // Composite the logo onto the plain QR PNG so the download matches the card.
  async function downloadPng() {
    if (!png) return
    try {
      const load = (src: string) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image()
          img.onload = () => resolve(img)
          img.onerror = reject
          img.src = src
        })
      const [qr, logo] = await Promise.all([load(png), load(QR_LOGO)])
      const canvas = document.createElement("canvas")
      canvas.width = qr.width
      canvas.height = qr.height
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Canvas is not supported")
      ctx.drawImage(qr, 0, 0)
      const size = canvas.width * QR_LOGO_RATIO
      const cx = canvas.width / 2
      const cy = canvas.height / 2
      ctx.fillStyle = "#ffffff"
      ctx.beginPath()
      ctx.arc(cx, cy, size / 2, 0, Math.PI * 2)
      ctx.fill()
      const inner = size * 0.86
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, inner / 2, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(logo, cx - inner / 2, cy - inner / 2, inner, inner)
      ctx.restore()
      const link = document.createElement("a")
      link.href = canvas.toDataURL("image/png")
      link.download = `${examId}-qr.png`
      link.click()
    } catch {
      toast.error("Could not create the QR image. Please try again.")
    }
  }

  if (!url || !svg || !png) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
            <QrCodeIcon className="size-7" />
          </span>
          <div>
            <p className="text-lg font-semibold">Ready to release this result</p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Generate a QR code the patient can scan to open their finalized report. The code links to a
              private result page through a random access token.
            </p>
          </div>
          <Button size="lg" disabled={pending} onClick={() => generate(false)}>
            <QrCodeIcon />
            {pending ? "Generating…" : "Generate QR code"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="print:shadow-none print:ring-0">
        <CardHeader className="print:hidden">
          <CardTitle>Preview</CardTitle>
          <CardDescription>This card is what gets printed and handed to the patient.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mx-auto max-w-sm overflow-hidden rounded-2xl border-2 border-dashed border-teal-200 bg-white p-6 text-center print:max-w-none print:border-solid print:border-slate-300">
            {/* Faint watermark behind the card; the QR itself sits on solid white. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={QR_LOGO}
              alt=""
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-1/2 w-[85%] max-w-none -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.07] print:opacity-[0.07]"
            />
            <div className="relative">
              <p className="text-xs font-semibold tracking-widest text-teal-700 uppercase">{CLINIC_NAME}</p>
              <p className="mt-1 text-lg font-semibold">Your X-ray result</p>
              <p className="text-sm text-muted-foreground">Scan with your phone camera to view your report</p>
              <div className="relative mx-auto my-5 w-56 bg-white" role="img" aria-label={`QR code linking to the result for ${examId}`}>
                <div className="[&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
                <span
                  className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white"
                  style={{ width: `${QR_LOGO_RATIO * 100}%`, height: `${QR_LOGO_RATIO * 100}%` }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={QR_LOGO} alt="" className="size-[86%] rounded-full object-cover" />
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-left text-sm">
                <dt className="text-muted-foreground">Patient</dt>
                <dd className="font-medium">{patientName}</dd>
                <dt className="text-muted-foreground">Exam ID</dt>
                <dd className="font-mono font-medium">{examId}</dd>
                <dt className="text-muted-foreground">Examination</dt>
                <dd className="font-medium">{examType}</dd>
                <dt className="text-muted-foreground">Date</dt>
                <dd className="font-medium">{examDate}</dd>
              </dl>
              <p className="mt-4 text-[11px] leading-snug text-muted-foreground">
                Keep this card private. Anyone with this code can view the result.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card size="sm" className="print:hidden">
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-2">
            <code className="min-w-0 flex-1 truncate text-xs">{url}</code>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Copy link"
              onClick={() =>
                navigator.clipboard.writeText(url).then(
                  () => toast.success("Result link copied."),
                  () => toast.error("Could not copy the link.")
                )
              }
            >
              <CopyIcon />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => window.print()}>
              <PrinterIcon />
              Print QR card
            </Button>
            <Button variant="outline" onClick={downloadPng}>
              <DownloadIcon />
              Download PNG
            </Button>
            <a href={url} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline" })}>
              <ExternalLinkIcon />
              Open patient page
            </a>
            <Dialog>
              <DialogTrigger
                render={<Button variant="ghost" className="text-destructive hover:text-destructive" disabled={!stillEligible || pending} />}
              >
                <RefreshCwIcon />
                Regenerate
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Regenerate QR code?</DialogTitle>
                  <DialogDescription>
                    A new access token will be created and the current QR code and link will stop working. Use
                    this if a printed card was lost or shared by mistake.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
                  <DialogClose render={<Button variant="destructive" />} onClick={() => generate(true)}>
                    Revoke & regenerate
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
