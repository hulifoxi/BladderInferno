import { formatClock } from "../lib/utils"
import { DISPLAY_CAP_ML } from "./physiology"
import { DIFFICULTY_SPECS, dosePlan, holdTargetSec } from "./schedule"
import type { GameState } from "./types"

export function fillRatio(state: GameState): number {
  return Math.min(1, state.bladderMl / DISPLAY_CAP_ML)
}

export function mustStand(state: GameState): boolean {
  const from = DIFFICULTY_SPECS[state.difficulty].standFromMl
  if (from == null) return false
  if (state.bladderMl < from) return false
  if (state.sitUntil != null && state.elapsedSec < state.sitUntil) return false
  return true
}

export function holdNeedSec(state: GameState): number {
  return holdTargetSec(state.difficulty, state.holdAdjustSec)
}

export function holdLeftSec(state: GameState): number {
  if (state.holdStartedAt == null) return holdNeedSec(state)
  return Math.max(0, holdNeedSec(state) - state.holdElapsedSec)
}

export function nextDose(state: GameState) {
  return dosePlan(state.difficulty, state.weightKg)[state.nextDoseIndex] ?? null
}

export function commandText(state: GameState): { title: string; body?: string } {
  if (state.peeUntilSec != null) {
    const left = Math.max(0, Math.ceil(state.peeUntilSec - state.elapsedSec))
    return { title: `尿 ${left} 秒`, body: "到点停。" }
  }
  if (state.task) {
    return { title: state.task.title, body: state.task.body }
  }
  if (state.wheel?.landed) {
    return { title: state.wheel.landed.label }
  }
  if (state.wheel) {
    return { title: "转盘" }
  }
  if (state.pendingDrink) {
    const left = Math.max(
      0,
      Math.ceil(state.pendingDrink.atSec + state.pendingDrink.windowSec - state.elapsedSec),
    )
    return {
      title: `喝 ${state.pendingDrink.ml} ml`,
      body: left > 0 ? `${formatClock(left)} 内尽快喝完。` : "尽快喝完。",
    }
  }
  if (state.holdStartedAt != null) {
    return {
      title: `还要 ${formatClock(holdLeftSec(state))}`,
      body: state.waveUntil != null ? "顶过去。" : mustStand(state) ? "站着。" : undefined,
    }
  }
  if (state.waveUntil != null) {
    return { title: "顶过去" }
  }
  const dose = nextDose(state)
  if (dose) {
    const wait = Math.max(0, dose.atSec - state.elapsedSec)
    return {
      title: wait > 0 ? `${formatClock(wait)} 后喝` : "喝水",
      body: `${dose.ml} ml`,
    }
  }
  return { title: "等尿量" }
}

export function canGamble(state: GameState): boolean {
  return (
    state.screen === "play" &&
    DIFFICULTY_SPECS[state.difficulty].gamble &&
    state.holdStartedAt != null &&
    !state.pendingDrink &&
    !state.wheel &&
    !state.task &&
    state.peeUntilSec == null
  )
}

export function debugOn(): boolean {
  if (typeof window === "undefined") return false
  return new URLSearchParams(window.location.search).has("debug")
}
