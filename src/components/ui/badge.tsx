import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export function Badge({
  className,
  tone = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: "default" | "reward" | "punish" | "urine" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs tracking-wide",
        tone === "default" && "bg-secondary text-secondary-foreground",
        tone === "reward" && "bg-reward/30 text-reward-foreground",
        tone === "punish" && "bg-destructive/25 text-destructive-foreground",
        tone === "urine" && "bg-urine/20 text-urine",
        className,
      )}
      {...props}
    />
  )
}
