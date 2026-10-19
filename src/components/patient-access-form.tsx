"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function PatientAccessForm() {
  const router = useRouter()
  const [value, setValue] = useState("")
  const [error, setError] = useState("")

  function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    // Accept either the full result URL or just the token.
    const token = value.trim().split("/result/").pop()?.split(/[?#]/)[0] ?? ""
    if (!/^[A-Za-z0-9_-]{10,}$/.test(token)) {
      setError("That doesn't look like a valid access code.")
      return
    }
    router.push(`/result/${token}`)
  }

  return (
    <form method="post" onSubmit={onSubmit} className="mt-4 flex flex-col gap-2">
      <Input
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          setError("")
        }}
        placeholder="Link or access code"
        aria-label="Result link or access code"
        aria-invalid={error ? true : undefined}
        className="h-10"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button type="submit" size="lg" className="h-10 bg-teal-600 hover:bg-teal-700">
        View result
      </Button>
    </form>
  )
}
