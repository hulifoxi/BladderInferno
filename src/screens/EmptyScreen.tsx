import { DIFFICULTY_SPECS, plannedTotalMl } from "@/engine"
import type { DifficultyId } from "@/engine"
import { Button } from "@/components/ui/button"

type Props = {
  difficulty: DifficultyId
  weightKg: number
  onConfirm: () => void
  onBack: () => void
}

export function EmptyScreen({ difficulty, weightKg, onConfirm, onBack }: Props) {
  const total = plannedTotalMl(difficulty, weightKg)
  const spec = DIFFICULTY_SPECS[difficulty]

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-5 px-5 py-10">
      <p className="text-sm font-medium text-muted-foreground">{spec.label}</p>
      <h1 className="font-display text-4xl tracking-tight">先撒空</h1>
      <p className="text-sm text-muted-foreground">准备 {total} ml 水。</p>
      <Button size="lg" onClick={onConfirm}>
        已经撒空
      </Button>
      <Button variant="ghost" onClick={onBack}>
        返回
      </Button>
    </main>
  )
}
