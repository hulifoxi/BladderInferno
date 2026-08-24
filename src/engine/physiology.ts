import type { DifficultyId, DrinkEvent } from "./types"

/** Baseline urine output: ~1 ml/min ≈ 0.86 ml/kg/h at 70 kg, inside 0.5–1.0 ml/kg/h. */
export const BASELINE_ML_PER_MIN = 1

/** Peak water diuresis in oral overload is ~778 ml/h ≈ 13 ml/min. */
export const RATE_CAP_ML_PER_MIN = 13

/** ICS-style filling sensations. Not scaled by weight. */
export const FSF_ML = 180
export const FDV_ML = 250
export const SDV_ML = 400
export const MCC_ML = 500
export const DISPLAY_CAP_ML = 520

/** Typical voiding flow, used only for timed pee rewards. */
export const PEE_ML_PER_SEC = 20
export const PEE_ML_CAP = 120

export const MIN_KG = 40
export const MAX_KG = 130
export const DEFAULT_KG = 70

export function clampKg(kg: number): number {
  if (!Number.isFinite(kg)) return DEFAULT_KG
  return Math.min(MAX_KG, Math.max(MIN_KG, Math.round(kg)))
}

export function round10(ml: number): number {
  return Math.max(10, Math.round(ml / 10) * 10)
}

export function scaleMl(mlAt70: number, kg: number): number {
  return round10((mlAt70 * clampKg(kg)) / DEFAULT_KG)
}

/**
 * Extra urine rate from one water bolus.
 * Water reaches plasma in ~5 min, peaks ~20 min; gastric T50 ~13 min.
 * Peak diuresis after a water load is 60–120 min later.
 * Extra volume over ~3 h is calibrated near 90% of the drink (water-load test).
 */
export function bolusExtraRate(ageMin: number, ml: number): number {
  if (ageMin < 0 || ml <= 0) return 0
  if (ageMin < 12) return 0
  const size = ml / 400
  const peak = Math.min(11, 4.6 * size)
  const t = ageMin - 12
  if (t < 18) return peak * 0.4 * (t / 18)
  if (t < 38) return peak * (0.4 + 0.6 * ((t - 18) / 20))
  if (t < 68) return peak
  if (t < 108) return peak * (1 - 0.75 * ((t - 68) / 40))
  if (t < 168) return peak * 0.25 * (1 - (t - 108) / 60)
  return 0
}

export function urineRateAt(drinks: DrinkEvent[], elapsedSec: number): number {
  let extra = 0
  for (const drink of drinks) {
    extra += bolusExtraRate((elapsedSec - drink.atSec) / 60, drink.ml)
  }
  return Math.min(RATE_CAP_ML_PER_MIN, BASELINE_ML_PER_MIN + extra)
}

export function estimateBladderMl(
  drinks: DrinkEvent[],
  elapsedSec: number,
  voidedMl: number,
): number {
  if (elapsedSec <= 0) return 0
  const step = 10
  let volume = 0
  for (let t = 0; t < elapsedSec; t += step) {
    const dtMin = Math.min(step, elapsedSec - t) / 60
    volume += urineRateAt(drinks, t) * dtMin
  }
  return Math.max(0, volume - voidedMl)
}

export function peeMl(seconds: number): number {
  return Math.min(PEE_ML_CAP, Math.round(seconds * PEE_ML_PER_SEC))
}

export function sensationLabel(ml: number): string {
  if (ml >= MCC_ML) return "已经顶到头"
  if (ml >= SDV_ML) return "非常想尿"
  if (ml >= FDV_ML) return "想尿了"
  if (ml >= FSF_ML) return "开始有尿"
  return "还不算急"
}

export function holdStartMl(difficulty: DifficultyId): number {
  if (difficulty === "novice") return FDV_ML
  if (difficulty === "hell") return 450
  return SDV_ML
}
