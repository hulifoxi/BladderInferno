import { useState } from "react"
import {
  canGamble,
  commandText,
  describeSector,
  DIFFICULTY_SPECS,
  fillRatio,
  holdStartMl,
  mustStand,
  type Action,
  type GameState,
} from "@/engine"
import { RulesList } from "@/components/RulesList"
import { Vessel } from "@/components/Vessel"
import { WheelDisc } from "@/components/WheelDisc"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { formatClock as clock } from "@/lib/utils"

type Props = {
  state: GameState
  dispatch: (action: Action) => void
  debug: boolean
}

export function PlayScreen({ state, dispatch, debug }: Props) {
  const [giveUpOpen, setGiveUpOpen] = useState(false)
  const spec = DIFFICULTY_SPECS[state.difficulty]
  const command = commandText(state)
  const gateMl = holdStartMl(state.difficulty)
  const standing = mustStand(state)
  const fill = fillRatio(state)
  const wheelCard = state.wheel?.landed
    ? describeSector(
        state.wheel.landed.id,
        (state.punishCounts[state.wheel.landed.id] ?? 0) + 1,
      )
    : null

  return (
    <div className="mx-auto min-h-svh max-w-5xl px-4 pb-8 pt-4 md:pt-6">
      <header className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium tracking-tight">
            憋尿挑战
            <span className="ml-2 text-muted-foreground">{spec.label}</span>
          </p>
          <p className="mt-0.5 font-mono text-sm tabular-nums text-muted-foreground">
            {clock(state.elapsedSec)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                记录
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetTitle>记录</SheetTitle>
              <div className="mt-4 max-h-[70vh] overflow-y-auto">
                <LogList state={state} />
              </div>
            </SheetContent>
          </Sheet>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                规则
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetTitle>规则</SheetTitle>
              <div className="mt-4">
                <RulesList />
              </div>
            </SheetContent>
          </Sheet>
          <Button variant="ghost" size="sm" onClick={() => setGiveUpOpen(true)}>
            认输
          </Button>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
        <Vessel
          ml={state.bladderMl}
          gateMl={gateMl}
          locked={state.holdStartedAt != null}
          wave={state.waveUntil != null}
        />

        <section className="space-y-4">
          <div>
            <h2 className="font-display text-3xl leading-tight tracking-tight">{command.title}</h2>
            {command.body ? (
              <p className="mt-2 text-sm text-muted-foreground">{command.body}</p>
            ) : null}
            {standing ? (
              <Badge tone="punish" className="mt-3">
                站着
              </Badge>
            ) : null}
          </div>
          <Actions state={state} dispatch={dispatch} />
          {canGamble(state) ? (
            <Button variant="outline" size="wide" onClick={() => dispatch({ type: "GAMBLE" })}>
              做惩罚，早 3 分钟结束
            </Button>
          ) : null}
          {debug ? <DebugBar dispatch={dispatch} /> : null}
        </section>
      </div>

      <Dialog open={Boolean(state.wheel)} onOpenChange={() => undefined}>
        <DialogContent className="max-h-[min(92dvh,720px)] overflow-y-auto">
          <DialogTitle>{wheelCard ? wheelCard.title : "转盘"}</DialogTitle>
          {state.wheel ? (
            <div className="mt-2 flex flex-col items-center gap-3">
              <WheelDisc
                sectors={state.wheel.sectors}
                spinning={state.wheel.spinning}
                landedIndex={
                  state.wheel.landed
                    ? state.wheel.sectors.findIndex((s) => s.id === state.wheel?.landed?.id)
                    : null
                }
                onLand={(index) => dispatch({ type: "SPIN_LAND", index })}
              />
              {wheelCard ? (
                <p className="text-center text-sm leading-relaxed text-muted-foreground">
                  {wheelCard.body}
                </p>
              ) : null}
              <div className="flex w-full flex-col gap-2">
                {!state.wheel.spinning && !state.wheel.landed ? (
                  <Button onClick={() => dispatch({ type: "SPIN" })}>转</Button>
                ) : null}
                {state.wheel.landed ? (
                  <Button onClick={() => dispatch({ type: "ACK_RESULT" })}>
                    {state.wheel.landed.kind === "punish" ? "做完了" : "收下"}
                  </Button>
                ) : null}
                {state.wheel.landed && state.hasAmnesty && state.wheel.landed.kind === "punish" ? (
                  <Button variant="secondary" onClick={() => dispatch({ type: "USE_AMNESTY" })}>
                    免罚
                  </Button>
                ) : null}
                {state.skipTickets > 0 && state.wheel.reason !== "gamble" && !state.wheel.landed ? (
                  <Button variant="outline" onClick={() => dispatch({ type: "USE_SKIP_TICKET" })}>
                    免转
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(state.task)} onOpenChange={() => undefined}>
        <DialogContent>
          <DialogTitle>{state.task?.title}</DialogTitle>
          {state.task?.body ? (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{state.task.body}</p>
          ) : null}
          <Button className="mt-4" onClick={() => dispatch({ type: "FINISH_TASK" })}>
            做完了
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={giveUpOpen} onOpenChange={setGiveUpOpen}>
        <DialogContent>
          <DialogTitle>认输？</DialogTitle>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => setGiveUpOpen(false)}>
              继续
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setGiveUpOpen(false)
                dispatch({ type: "GIVE_UP" })
              }}
            >
              认输
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <span className="sr-only">{Math.round(fill * 100)}%</span>
    </div>
  )
}

function Actions({
  state,
  dispatch,
}: {
  state: GameState
  dispatch: (action: Action) => void
}) {
  if (state.pendingDrink) {
    return (
      <Button size="wide" onClick={() => dispatch({ type: "CONFIRM_DRINK", now: Date.now() })}>
        喝完了
      </Button>
    )
  }
  return null
}

function LogList({ state }: { state: GameState }) {
  if (state.logs.length === 0) return <p className="text-muted-foreground">还没有记录。</p>
  return (
    <ul className="space-y-3 text-sm">
      {[...state.logs].reverse().map((line) => (
        <li key={line.id} className="leading-6">
          <span className="font-mono text-[11px] text-muted-foreground">{clock(line.atSec)} </span>
          {line.text}
        </li>
      ))}
    </ul>
  )
}

function DebugBar({ dispatch }: { dispatch: (action: Action) => void }) {
  return (
    <div className="flex flex-wrap gap-2 pt-2">
      <Button size="sm" variant="outline" onClick={() => dispatch({ type: "DEBUG_JUMP", seconds: 60, now: Date.now() })}>
        +1 分钟
      </Button>
      <Button size="sm" variant="outline" onClick={() => dispatch({ type: "DEBUG_JUMP", seconds: 300, now: Date.now() })}>
        +5 分钟
      </Button>
      <Button size="sm" variant="outline" onClick={() => dispatch({ type: "DEBUG_WIN" })}>
        赢
      </Button>
      <Button size="sm" variant="outline" onClick={() => dispatch({ type: "DEBUG_LOSE" })}>
        输
      </Button>
    </div>
  )
}
