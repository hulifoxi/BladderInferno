import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DISCLAIMER_ITEMS, DISCLAIMER_STORAGE_KEY } from "@/game"

type DisclaimerDialogProps = {
  open: boolean
  onAccept: () => void
}

export function DisclaimerDialog({ open, onAccept }: DisclaimerDialogProps) {
  return (
    <Dialog open={open}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-lg"
        onPointerDownOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-destructive">
            ⚠️ 重要安全警告
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2 text-foreground">
              {DISCLAIMER_ITEMS.map((item, index) => (
                <p
                  key={item}
                  className={
                    index === DISCLAIMER_ITEMS.length - 1
                      ? "font-semibold text-red-400"
                      : undefined
                  }
                >
                  ⚠️ {item}
                </p>
              ))}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            className="w-full"
            variant="destructive"
            size="lg"
            onClick={() => {
              localStorage.setItem(DISCLAIMER_STORAGE_KEY, "true")
              onAccept()
            }}
          >
            我已阅读并同意上述内容
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
