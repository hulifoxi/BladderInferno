import { Dialog as DialogPrimitive } from "radix-ui"
import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export const Sheet = DialogPrimitive.Root
export const SheetTrigger = DialogPrimitive.Trigger
export const SheetClose = DialogPrimitive.Close

export function SheetContent({
  className,
  children,
  side = "bottom",
  ...props
}: ComponentProps<typeof DialogPrimitive.Content> & { side?: "bottom" | "right" }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60" />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 flex flex-col border border-border bg-card shadow-2xl outline-none",
          side === "bottom" &&
            "inset-x-0 bottom-0 max-h-[80vh] rounded-t-2xl pb-[env(safe-area-inset-bottom)]",
          side === "right" &&
            "inset-y-0 right-0 h-full w-[min(100%,380px)] pt-[env(safe-area-inset-top)]",
          className,
        )}
        {...props}
      >
        <div className="relative flex min-h-0 flex-1 flex-col">
          <SheetClose
            aria-label="关闭"
            className="absolute top-2 right-2 z-10 inline-flex h-11 items-center rounded-md px-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            关闭
          </SheetClose>
          <div className="min-h-0 flex-1 overflow-y-auto p-5 pr-16">{children}</div>
        </div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function SheetTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("font-display text-lg", className)} {...props} />
}
