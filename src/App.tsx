import { useState } from "react"
import {
  Droplets,
  Flag,
  Play,
  RotateCcw,
  SkipForward,
} from "lucide-react"
import { ConfettiFx } from "@/components/ConfettiFx"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { DisclaimerDialog } from "@/components/DisclaimerDialog"
import { FailureFx } from "@/components/FailureFx"
import { GameLog } from "@/components/GameLog"
import { PunishmentDialog } from "@/components/PunishmentDialog"
import { RulesDialog } from "@/components/RulesDialog"
import { WheelCanvas } from "@/components/WheelCanvas"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DISCLAIMER_STORAGE_KEY,
  SKIP_TOOLTIP,
  formatTime,
  isGameOver,
  phaseLabel,
  roundLabel,
} from "@/game"
import { useGame } from "@/hooks/useGame"

function readDisclaimer(): boolean {
  try {
    return localStorage.getItem(DISCLAIMER_STORAGE_KEY) === "true"
  } catch {
    return false
  }
}

type PendingConfirm = "reset" | "pee" | "fail" | null

export default function App() {
  const { state, dispatch, spinRequest, onSpinComplete } = useGame()
  const [disclaimerOpen, setDisclaimerOpen] = useState(() => !readDisclaimer())
  const [pending, setPending] = useState<PendingConfirm>(null)
  const over = isGameOver(state)
  const inChallenge = state.phase === "challenge"
  const timerMax = state.timerDuration || 1
  const timerValue =
    state.timerKind === "idle" ? 0 : (state.remainingSeconds / timerMax) * 100

  return (
    <div className="min-h-svh bg-[radial-gradient(ellipse_at_top,#2a2210_0%,#121212_55%)] px-3 py-6 sm:px-6">
      <Card className="relative mx-auto max-w-3xl bg-card/90 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-heading text-2xl text-primary sm:text-3xl">
            膀胱炼狱 · 极限尿压
          </CardTitle>
          {state.phase !== "ready" && (
            <CardAction>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPending("reset")}
              >
                <RotateCcw />
                重新开始
              </Button>
            </CardAction>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg bg-muted/50 px-3 py-2 text-center">
              ⏳ 倒计时：
              <span className="font-mono text-lg">
                {over ? "-" : formatTime(state.remainingSeconds)}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-center text-sm">
              <span>阶段：{phaseLabel(state)}</span>
              <Separator orientation="vertical" className="hidden h-4 sm:block" />
              <span>轮数：{roundLabel(state)}</span>
              <Badge variant="secondary">累计 {state.waterTotal}ml</Badge>
            </div>
          </div>

          {state.timerKind !== "idle" && !over && (
            <Progress value={timerValue} className="h-2" />
          )}

          <Alert>
            <AlertDescription className="text-center text-base text-foreground">
              {state.resultText}
            </AlertDescription>
          </Alert>

          <WheelCanvas
            sectors={state.sectors}
            kind={state.wheelKind}
            visible={state.showWheel && !over}
            spinToken={spinRequest?.token ?? 0}
            targetIndex={spinRequest?.index ?? 0}
            onSpinComplete={onSpinComplete}
          />

          <div className="flex flex-col items-stretch justify-center gap-2 sm:flex-row sm:flex-wrap">
            {state.phase === "ready" && (
              <Button size="lg" onClick={() => dispatch({ type: "START_PREPARE" })}>
                <Play />
                开始挑战
              </Button>
            )}

            {state.showSkip && !over && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => dispatch({ type: "SKIP_TIMER" })}
                  >
                    <SkipForward />
                    跳过等待
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  {SKIP_TOOLTIP}
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {inChallenge && (
            <div className="flex flex-col gap-2 rounded-lg bg-destructive/5 p-3 sm:flex-row">
              {!state.peeActionUsed && (
                <Button
                  className="flex-1"
                  variant="destructive"
                  size="lg"
                  onClick={() => setPending("pee")}
                >
                  <Droplets />
                  主动排尿5秒 (仅一次, 后果严重)
                </Button>
              )}
              <Button
                className="flex-1"
                variant="destructive"
                size="lg"
                onClick={() => setPending("fail")}
              >
                <Flag />
                宣告失败 (失禁)
              </Button>
            </div>
          )}

          <div>
            <h2 className="mb-2 text-center text-lg text-primary">📜 日志</h2>
            <GameLog logs={state.logs} />
          </div>
        </CardContent>
      </Card>

      <RulesDialog />
      <ConfettiFx active={state.phase === "victory"} />
      <FailureFx active={state.phase === "failure"} />

      <DisclaimerDialog
        open={disclaimerOpen}
        onAccept={() => {
          setDisclaimerOpen(false)
        }}
      />

      <PunishmentDialog
        open={state.punishmentOpen}
        onOpenChange={(open) => {
          if (!open) dispatch({ type: "CLOSE_PUNISHMENT" })
        }}
      />

      <ConfirmDialog
        open={Boolean(state.pendingAmnesty)}
        title="使用白神赦免？"
        description="你持有【白神赦免】权，是否使用它来取消本次惩罚？"
        confirmLabel="使用赦免"
        cancelLabel="不使用"
        onConfirm={() => dispatch({ type: "RESOLVE_AMNESTY", use: true })}
        onCancel={() => {
          if (state.pendingAmnesty) {
            dispatch({ type: "RESOLVE_AMNESTY", use: false })
          }
        }}
      />

      <ConfirmDialog
        open={pending === "reset"}
        title="重新开始？"
        description="您确定要重新开始游戏吗？所有进度将被清空。"
        confirmLabel="重新开始"
        destructive
        onConfirm={() => {
          setPending(null)
          dispatch({ type: "RESET" })
        }}
        onCancel={() => setPending(null)}
      />

      <ConfirmDialog
        open={pending === "pee"}
        title="使用主动排尿？"
        description="你确定要使用一次性的【主动排尿5秒】权利吗？后果：游戏总轮数+2，且需要立即额外喝水250ml。"
        confirmLabel="确认使用"
        destructive
        onConfirm={() => {
          setPending(null)
          dispatch({ type: "USE_PEE_ACTION" })
        }}
        onCancel={() => setPending(null)}
      />

      <ConfirmDialog
        open={pending === "fail"}
        title="宣告失败？"
        description="你确定要宣告失禁失败吗？这将立即结束游戏并触发羞耻垮台惩罚。"
        confirmLabel="宣告失败"
        destructive
        onConfirm={() => {
          setPending(null)
          dispatch({ type: "DECLARE_FAILURE" })
        }}
        onCancel={() => setPending(null)}
      />
    </div>
  )
}
