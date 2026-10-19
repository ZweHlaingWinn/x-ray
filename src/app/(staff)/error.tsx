"use client"

import { TriangleAlertIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function StaffError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <TriangleAlertIcon className="size-10 text-destructive" />
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">The page could not be loaded. Please try again.</p>
      <Button variant="outline" onClick={reset}>
        Try again
      </Button>
    </div>
  )
}
