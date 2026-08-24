import { useEffect, useState } from "react"
import { Check } from "lucide-react"
import {
  DIFFICULTY_ORDER,
  DIFFICULTY_SPECS,
  LOBBY_DIFFICULTY_HINT,
  MAX_KG,
  MIN_KG,
  plannedTotalMl,
} from "@/engine"
import type { DifficultyId } from "@/engine"
import { RulesList } from "@/components/RulesList"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

type Props = {
  difficulty: DifficultyId
  weightKg: number
  onWeight: (kg: number) => void
  onChoose: (id: DifficultyId) => void
  onStart: () => void
}

export function LobbyScreen({ difficulty, weightKg, onWeight, onChoose, onStart }: Props) {
  const total = plannedTotalMl(difficulty, weightKg)

  return (
    <main className="mx-auto flex min-h-svh max-w-xl flex-col justify-center gap-6 px-5 py-10">
      <div>
        <p className="text-sm font-medium text-muted-foreground">憋尿挑战</p>
        <h1 className="font-display mt-2 text-[28px] leading-[1.08] tracking-tight sm:text-[34px]">
          贱畜，
          <br />
          可别让我看到你漏尿了。
        </h1>
      </div>

      <div className="space-y-5 rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="space-y-2">
          <div role="radiogroup" aria-label="难度" className="grid grid-cols-2 gap-2">
            {DIFFICULTY_ORDER.map((id) => {
              const item = DIFFICULTY_SPECS[id]
              const selected = id === difficulty
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onChoose(id)}
                  className={cn(
                    "relative min-h-[4.75rem] rounded-xl border px-3.5 py-3 text-left transition-colors",
                    selected
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card hover:bg-muted/50",
                  )}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span>
                      <span className="block text-[15px] font-semibold tracking-tight">{item.label}</span>
                      <span className={cn("mt-1 block text-xs", selected ? "opacity-70" : "text-muted-foreground")}>
                        {item.blurb}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border",
                        selected ? "border-current bg-current/10" : "border-border",
                      )}
                      aria-hidden
                    >
                      {selected ? <Check className="size-2.5" strokeWidth={3} /> : null}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">{LOBBY_DIFFICULTY_HINT}</p>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground">体重</p>
            <p className="mt-1 text-sm tabular-nums">
              {weightKg} kg
              <span className="text-muted-foreground"> · 喝 {total} ml</span>
            </p>
          </div>
          <WeightInput weightKg={weightKg} onWeight={onWeight} />
        </div>

        <Button size="wide" onClick={onStart}>
          开始
        </Button>
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <button type="button" className="text-center text-sm text-muted-foreground hover:text-foreground">
            规则
          </button>
        </SheetTrigger>
        <SheetContent side="bottom">
          <SheetTitle>规则</SheetTitle>
          <div className="mt-4">
            <RulesList />
          </div>
        </SheetContent>
      </Sheet>
    </main>
  )
}

function WeightInput({ weightKg, onWeight }: { weightKg: number; onWeight: (kg: number) => void }) {
  const [draft, setDraft] = useState(String(weightKg))

  useEffect(() => {
    setDraft(String(weightKg))
  }, [weightKg])

  function commit() {
    const n = Number(draft)
    if (draft.trim() === "" || !Number.isFinite(n)) {
      setDraft(String(weightKg))
      return
    }
    onWeight(n)
  }

  return (
    <Input
      id="kg"
      aria-label="体重（公斤）"
      type="text"
      inputMode="decimal"
      autoComplete="off"
      enterKeyHint="done"
      className="h-10 w-20 text-center text-base font-semibold tabular-nums"
      value={draft}
      onChange={(e) => {
        const next = e.target.value
        if (next !== "" && !/^\d{0,3}(\.\d?)?$/.test(next)) return
        setDraft(next)
        const n = Number(next)
        if (next !== "" && Number.isFinite(n) && n >= MIN_KG && n <= MAX_KG) onWeight(n)
      }}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur()
      }}
    />
  )
}
