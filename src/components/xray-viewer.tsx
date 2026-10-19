"use client"

import { useState } from "react"
import {
  ContrastIcon,
  ImageOffIcon,
  RotateCcwIcon,
  SunIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = {
  src: string | null
  alt: string
  className?: string
  // Simple preview without the reading tools (patient page, record details).
  plain?: boolean
}

export function XrayViewer({ src, alt, className, plain = false }: Props) {
  const [zoom, setZoom] = useState(1)
  const [invert, setInvert] = useState(false)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)

  if (!src) {
    return (
      <div
        className={cn(
          "flex aspect-[4/5] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/50 text-sm text-muted-foreground",
          className
        )}
      >
        <ImageOffIcon className="size-8" />
        No image attached
      </div>
    )
  }

  const reset = () => {
    setZoom(1)
    setInvert(false)
    setBrightness(100)
    setContrast(100)
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-auto rounded-xl bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element -- demo images may be inline data URLs */}
        <img
          src={src}
          alt={alt}
          className="max-h-full max-w-full object-contain transition-transform duration-200"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center",
            filter: `invert(${invert ? 1 : 0}) brightness(${brightness}%) contrast(${contrast}%)`,
          }}
        />
      </div>
      {!plain && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border bg-card px-3 py-2 text-xs text-muted-foreground print:hidden">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Zoom out"
              onClick={() => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))}
            >
              <ZoomOutIcon />
            </Button>
            <span className="w-10 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Zoom in"
              onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
            >
              <ZoomInIcon />
            </Button>
          </div>
          <label className="flex items-center gap-1.5">
            <SunIcon className="size-3.5" />
            <span className="sr-only">Brightness</span>
            <input
              type="range"
              min={50}
              max={160}
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-20 accent-primary"
            />
          </label>
          <label className="flex items-center gap-1.5">
            <ContrastIcon className="size-3.5" />
            <span className="sr-only">Contrast</span>
            <input
              type="range"
              min={50}
              max={200}
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-20 accent-primary"
            />
          </label>
          <Button
            type="button"
            variant={invert ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setInvert((v) => !v)}
          >
            Invert
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Reset view" onClick={reset}>
            <RotateCcwIcon />
          </Button>
        </div>
      )}
    </div>
  )
}
