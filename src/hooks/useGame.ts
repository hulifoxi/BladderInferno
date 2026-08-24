import { useEffect, useReducer } from "react"
import {
  debugOn,
  initialState,
  loadDisclaimer,
  loadGame,
  reducer,
  saveDisclaimer,
  saveGame,
  shouldPersist,
  type GameState,
} from "@/engine"

function boot(): GameState {
  const saved = loadGame()
  if (saved) return saved
  const next = initialState()
  if (loadDisclaimer()) return { ...next, disclaimerOk: true, screen: "lobby" }
  return next
}

export function useGame() {
  const [state, dispatch] = useReducer(reducer, undefined, boot)

  useEffect(() => {
    if (state.disclaimerOk) saveDisclaimer()
    if (shouldPersist(state)) saveGame(state)
  }, [state])

  useEffect(() => {
    if (state.screen !== "play") return
    const id = window.setInterval(() => dispatch({ type: "TICK", now: Date.now() }), 250)
    return () => window.clearInterval(id)
  }, [state.screen])

  return { state, dispatch, debug: debugOn() }
}
