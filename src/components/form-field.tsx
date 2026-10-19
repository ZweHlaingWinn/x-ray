import { cn } from "@/lib/utils"

export const nativeSelectClass =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm"

type Props = {
  id: string
  label: string
  required?: boolean
  // Shown when the field is needed before the result can be released.
  releaseRequired?: boolean
  missing?: boolean
  hint?: React.ReactNode
  error?: string
  className?: string
  children: React.ReactNode
}

export function Field({ id, label, required, releaseRequired, missing, hint, error, className, children }: Props) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="flex items-center gap-1.5 text-sm font-medium">
        {label}
        {required && <span className="text-destructive" aria-hidden>*</span>}
        {releaseRequired && !required && (
          <span
            className={cn(
              "rounded-full px-1.5 py-px text-[10px] font-medium",
              missing ? "bg-orange-100 text-orange-800" : "bg-muted text-muted-foreground"
            )}
          >
            {missing ? "Missing · needed for release" : "Needed for release"}
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}
