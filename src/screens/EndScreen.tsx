import { FAIL_STEPS } from "@/engine"
import type { DifficultyId } from "@/engine"
import { DIFFICULTY_SPECS } from "@/engine"
import { Button } from "@/components/ui/button"

type Props = {
  won: boolean
  difficulty: DifficultyId
  bladderMl: number
  onAgain: () => void
}

export function EndScreen({ won, difficulty, bladderMl, onAgain }: Props) {
  const label = DIFFICULTY_SPECS[difficulty].label

  if (won) {
    return (
      <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-5 px-5 py-10">
        <p className="text-sm font-medium text-reward">过了</p>
        <h1 className="font-display text-5xl tracking-tight">可以去了</h1>
        <p className="text-sm text-muted-foreground">
          {label} · {Math.round(bladderMl)} ml
        </p>
        <Button size="lg" onClick={onAgain}>
          返回主页
        </Button>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-5 px-5 py-10">
      <p className="text-sm font-medium text-destructive">没憋住</p>
      <h1 className="font-display text-4xl tracking-tight">按清单做</h1>
      <ol className="space-y-2 text-sm leading-6">
        {FAIL_STEPS.map((step, i) => (
          <li key={step} className="flex gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
            <p>{step}</p>
          </li>
        ))}
      </ol>
      <Button size="lg" variant="destructive" onClick={onAgain}>
        回大厅
      </Button>
    </main>
  )
}
