export type DifficultyId = "novice" | "mid" | "hard" | "hell"
export type ScreenId = "gate" | "lobby" | "empty" | "play" | "won" | "lost"
export type WheelReason = "gate" | "storm" | "gamble" | "lastDrink"
export type SectorKind = "reward" | "punish"
export type Band = "empty" | "fsf" | "fdv" | "sdv"

export type SectorId =
  | "pee3"
  | "skipDose"
  | "halfDose"
  | "shaveHold"
  | "skipWheel"
  | "amnesty"
  | "sit5"
  | "delayWheel"
  | "waterSound"
  | "slowWalk"
  | "heelTap"
  | "noWall"
  | "noClench"
  | "countOut"
  | "cough"
  | "laugh"
  | "squat"
  | "calf"
  | "armsUp"
  | "addHold"
  | "drink100"
  | "smallJump"
  | "jumpingJack"
  | "highKnee"
  | "standWater"
  | "march"
  | "bearDown"
  | "statue"
  | "noWiggle"
  | "breathOnly"

export type Sector = {
  id: SectorId
  kind: SectorKind
  label: string
}

export type DrinkEvent = {
  atSec: number
  ml: number
}

export type Dose = {
  atSec: number
  ml: number
  windowSec: number
}

export type TaskCard = {
  id: SectorId
  kind: SectorKind
  title: string
  body: string
  extraWaterMl: number
  peeSeconds: number
  sitSeconds: number
  holdDeltaSec: number
  skipNextDose: boolean
  halfNextDose: boolean
  grantSkipTicket: boolean
  grantAmnesty: boolean
  delayWheelSec: number
  forceWave: boolean
}

export type WheelState = {
  reason: WheelReason
  sectors: Sector[]
  spinning: boolean
  landed: Sector | null
}

export type LogLine = {
  id: number
  atSec: number
  text: string
}

export type GameState = {
  screen: ScreenId
  disclaimerOk: boolean
  difficulty: DifficultyId
  weightKg: number
  startedAt: number | null
  elapsedSec: number
  drinks: DrinkEvent[]
  nextDoseIndex: number
  pendingDrink: Dose | null
  skipNextDose: boolean
  halfNextDose: boolean
  extraDrinkCount: number
  bladderMl: number
  voidedMl: number
  urineRate: number
  peakRate: number
  holdStartedAt: number | null
  holdElapsedSec: number
  holdAdjustSec: number
  gatesFired: string[]
  nextStormAt: number | null
  lastWaveAt: number | null
  waveUntil: number | null
  sitUntil: number | null
  skipTickets: number
  hasAmnesty: boolean
  peeUsed: boolean
  lastDrinkGateDone: boolean
  queuedReasons: WheelReason[]
  wheel: WheelState | null
  task: TaskCard | null
  peeUntilSec: number | null
  punishCounts: Partial<Record<SectorId, number>>
  logs: LogLine[]
  logSeq: number
}

export type Action =
  | { type: "HYDRATE"; state: GameState }
  | { type: "ACCEPT_DISCLAIMER" }
  | { type: "SET_WEIGHT"; kg: number }
  | { type: "CHOOSE_DIFFICULTY"; difficulty: DifficultyId }
  | { type: "BEGIN_EMPTY" }
  | { type: "CONFIRM_EMPTY"; now: number }
  | { type: "TICK"; now: number }
  | { type: "CONFIRM_DRINK"; now: number }
  | { type: "SPIN" }
  | { type: "SPIN_LAND"; index: number }
  | { type: "ACK_RESULT" }
  | { type: "USE_AMNESTY" }
  | { type: "USE_SKIP_TICKET" }
  | { type: "FINISH_TASK" }
  | { type: "GAMBLE" }
  | { type: "GIVE_UP" }
  | { type: "RESET" }
  | { type: "DEBUG_JUMP"; seconds: number; now: number }
  | { type: "DEBUG_WIN" }
  | { type: "DEBUG_LOSE" }
