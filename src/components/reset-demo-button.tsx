"use client"

import { useTransition } from "react"
import { RotateCcwIcon } from "lucide-react"
import { toast } from "sonner"
import { resetDemoData } from "@/app/actions"
import { Button } from "@/components/ui/button"
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

export function ResetDemoButton() {
  const [pending, startTransition] = useTransition()

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="ghost" size="sm" />}>
        <RotateCcwIcon />
        Reset demo data
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset demo data?</DialogTitle>
          <DialogDescription>
            All examinations, reports and QR codes created during the demo will be replaced with the original
            10 sample records.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <DialogClose
            render={<Button variant="destructive" disabled={pending} />}
            onClick={() =>
              startTransition(async () => {
                const result = await resetDemoData()
                toast.success(result.message)
              })
            }
          >
            Reset data
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
