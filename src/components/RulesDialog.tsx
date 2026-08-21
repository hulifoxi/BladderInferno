import { BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RULE_SECTIONS } from "@/game"

export function RulesDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="fixed right-4 bottom-4 z-40 rounded-full shadow-lg"
          size="lg"
        >
          <BookOpen />
          阅读规则
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>🎮 游戏流程说明</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {RULE_SECTIONS.map((section) => (
            <section
              key={section.title}
              className="rounded-lg border-l-4 border-primary bg-primary/10 p-3"
            >
              <h3 className="mb-2 font-medium text-primary">{section.title}</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {section.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
