import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FAILURE_STEPS } from "@/game"

type PunishmentDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PunishmentDialog({
  open,
  onOpenChange,
}: PunishmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-destructive">
            ⚠️ 失禁惩罚流程 ⚠️
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {FAILURE_STEPS.map((step) => (
            <p
              key={step}
              className="rounded-md border-l-4 border-destructive bg-destructive/10 p-3 text-sm"
            >
              ➡️ {step}
            </p>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
