"use client"

import { PrinterIcon } from "lucide-react"

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 font-medium text-white hover:bg-teal-700"
    >
      <PrinterIcon className="size-4" />
      Print result
    </button>
  )
}
