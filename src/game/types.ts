export type Phase = "ready" | "prepare" | "challenge" | "victory" | "failure"

export type TimerKind = "idle" | "prepare" | "wait"

export type WheelKind = "reward" | "punishment"

export type LogEntry = {
  id: number
  time: string
  text: string
}

export type WheelSector = {
  id: string
  label: string
  kind: WheelKind
}

export type PunishmentOutcome = {
  full: string
  execute: string
  extraWater: number
  skipNextReward: boolean
}

export type GameState = {
  phase: Phase
  currentRound: number
  totalRounds: number
  waterTotal: number
  remainingSeconds: number
  timerKind: TimerKind
  timerDuration: number
  timerToken: number
  punishCounts: Record<string, number>
  usedRewardIds: string[]
  peeActionUsed: boolean
  pee3secUsed: boolean
  canSkipNextDrink: boolean
  canReplaceNextPunishment: boolean
  hasAmnesty: boolean
  skipNextReward: boolean
  isSpinning: boolean
  awaitingSpin: boolean
  showWheel: boolean
  showSkip: boolean
  wheelKind: WheelKind | null
  sectors: WheelSector[]
  resultText: string
  logs: LogEntry[]
  logSeq: number
  pendingAmnesty: WheelSector | null
  punishmentOpen: boolean
}

export type GameAction =
  | { type: "START_PREPARE" }
  | { type: "TICK"; remainingSeconds: number }
  | { type: "TIMER_ENDED"; rng?: () => number }
  | { type: "SKIP_TIMER"; rng?: () => number }
  | { type: "BEGIN_SPIN" }
  | { type: "SPIN_COMPLETE"; index: number }
  | { type: "RESOLVE_AMNESTY"; use: boolean }
  | { type: "USE_PEE_ACTION" }
  | { type: "DECLARE_FAILURE" }
  | { type: "RESET" }
  | { type: "CLOSE_PUNISHMENT" }
