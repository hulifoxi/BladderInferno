import type { GameState } from "./types"
import { initialState } from "./reducer"

const KEY = "fullgate.v1"
const DISCLAIMER_KEY = "fullgate.disclaimer.v2"

export function loadDisclaimer(): boolean {
  try {
    return localStorage.getItem(DISCLAIMER_KEY) === "1"
  } catch {
    return false
  }
}

export function saveDisclaimer(): void {
  try {
    localStorage.setItem(DISCLAIMER_KEY, "1")
  } catch {
    /* ignore */
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as GameState
    if (!parsed || typeof parsed !== "object") return null
    if (parsed.screen === "gate" || parsed.screen === "lobby") return null
    return { ...initialState(), ...parsed, wheel: parsed.wheel ? { ...parsed.wheel, spinning: false } : null }
  } catch {
    return null
  }
}

export function saveGame(state: GameState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export function clearGame(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
