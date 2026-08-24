import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatClock(totalSeconds: number): string {
  const sec = Math.max(0, Math.floor(totalSeconds))
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0")
  const s = (sec % 60).toString().padStart(2, "0")
  return `${m}:${s}`
}
