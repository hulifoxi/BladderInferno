import { ScrollArea } from "@/components/ui/scroll-area"
import type { LogEntry } from "@/game"

type GameLogProps = {
  logs: LogEntry[]
}

export function GameLog({ logs }: GameLogProps) {
  return (
    <ScrollArea className="h-52 rounded-lg border bg-black/50 font-mono text-sm text-emerald-400">
      <div className="space-y-1 p-3">
        {logs.map((entry) => (
          <p key={entry.id} className="whitespace-pre-wrap">
            [{entry.time}] {entry.text}
          </p>
        ))}
      </div>
    </ScrollArea>
  )
}
