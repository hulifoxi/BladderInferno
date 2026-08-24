import { DEFAULT_KG, FDV_ML, FSF_ML, SDV_ML, scaleMl } from "./physiology"
import type { DifficultyId, Dose } from "./types"

export type DifficultySpec = {
  id: DifficultyId
  label: string
  blurb: string
  mlPerKg: number
  holdSec: number
  needRateDrop: boolean
  standFromMl: number | null
  stormSec: number
  lastDrinkGateSec: number
  gamble: boolean
  gates: Array<"fsf" | "fdv" | "sdv">
  rewardSlots: { empty: number; fsf: number; fdv: number; sdv: number }
  dosesAt70: Array<{ atSec: number; ml: number; windowSec: number }>
}

export const DIFFICULTY_SPECS: Record<DifficultyId, DifficultySpec> = {
  novice: {
    id: "novice",
    label: "新手",
    blurb: "到 250 ml · 撑 8 分钟",
    mlPerKg: 8,
    holdSec: 8 * 60,
    needRateDrop: false,
    standFromMl: null,
    stormSec: 10 * 60,
    lastDrinkGateSec: 0,
    gamble: false,
    gates: ["fdv"],
    rewardSlots: { empty: 6, fsf: 5, fdv: 5, sdv: 4 },
    dosesAt70: [
      { atSec: 0, ml: 400, windowSec: 8 * 60 },
      { atSec: 24 * 60, ml: 160, windowSec: 5 * 60 },
    ],
  },
  mid: {
    id: "mid",
    label: "中级",
    blurb: "到 400 ml · 撑 12 分钟 · 站着",
    mlPerKg: 12,
    holdSec: 12 * 60,
    needRateDrop: false,
    standFromMl: FDV_ML,
    stormSec: 8 * 60,
    lastDrinkGateSec: 0,
    gamble: true,
    gates: ["fsf", "fdv", "sdv"],
    rewardSlots: { empty: 5, fsf: 4, fdv: 3, sdv: 2 },
    dosesAt70: [
      { atSec: 0, ml: 400, windowSec: 8 * 60 },
      { atSec: 30 * 60, ml: 280, windowSec: 5 * 60 },
      { atSec: 58 * 60, ml: 160, windowSec: 5 * 60 },
    ],
  },
  hard: {
    id: "hard",
    label: "高级",
    blurb: "到 400 ml · 撑 18 分钟",
    mlPerKg: 16,
    holdSec: 18 * 60,
    needRateDrop: false,
    standFromMl: FDV_ML,
    stormSec: 6 * 60,
    lastDrinkGateSec: 0,
    gamble: true,
    gates: ["fsf", "fdv", "sdv"],
    rewardSlots: { empty: 4, fsf: 3, fdv: 2, sdv: 1 },
    dosesAt70: [
      { atSec: 0, ml: 400, windowSec: 8 * 60 },
      { atSec: 32 * 60, ml: 300, windowSec: 5 * 60 },
      { atSec: 62 * 60, ml: 250, windowSec: 5 * 60 },
      { atSec: 92 * 60, ml: 170, windowSec: 5 * 60 },
    ],
  },
  hell: {
    id: "hell",
    label: "地狱",
    blurb: "到 450 ml · 撑 24 分钟",
    mlPerKg: 18,
    holdSec: 24 * 60,
    needRateDrop: true,
    standFromMl: FSF_ML,
    stormSec: 4 * 60,
    lastDrinkGateSec: 8 * 60,
    gamble: true,
    gates: ["fsf", "fdv", "sdv"],
    rewardSlots: { empty: 3, fsf: 2, fdv: 2, sdv: 1 },
    dosesAt70: [
      { atSec: 0, ml: 420, windowSec: 8 * 60 },
      { atSec: 32 * 60, ml: 320, windowSec: 5 * 60 },
      { atSec: 64 * 60, ml: 280, windowSec: 5 * 60 },
      { atSec: 94 * 60, ml: 240, windowSec: 5 * 60 },
    ],
  },
}

export const DIFFICULTY_ORDER: DifficultyId[] = ["novice", "mid", "hard", "hell"]

export function dosePlan(difficulty: DifficultyId, kg: number): Dose[] {
  return DIFFICULTY_SPECS[difficulty].dosesAt70.map((dose) => ({
    atSec: dose.atSec,
    ml: scaleMl(dose.ml, kg),
    windowSec: dose.windowSec,
  }))
}

export function plannedTotalMl(difficulty: DifficultyId, kg: number): number {
  return dosePlan(difficulty, kg).reduce((sum, dose) => sum + dose.ml, 0)
}

export function holdTargetSec(difficulty: DifficultyId, adjustSec: number): number {
  return Math.max(60, DIFFICULTY_SPECS[difficulty].holdSec + adjustSec)
}

export function bandOf(ml: number): "empty" | "fsf" | "fdv" | "sdv" {
  if (ml >= SDV_ML) return "sdv"
  if (ml >= FDV_ML) return "fdv"
  if (ml >= FSF_ML) return "fsf"
  return "empty"
}

export function bandMl(gate: "fsf" | "fdv" | "sdv"): number {
  if (gate === "sdv") return SDV_ML
  if (gate === "fdv") return FDV_ML
  return FSF_ML
}

export { DEFAULT_KG, FDV_ML, FSF_ML, SDV_ML }
