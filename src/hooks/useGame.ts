import { useCallback, useEffect, useReducer, useRef, useState } from "react"
import { SPIN_DELAY_MS, createInitialState, gameReducer } from "@/game"

export type SpinRequest = {
  token: number
  index: number
}

export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState)
  const [spinRequest, setSpinRequest] = useState<SpinRequest | null>(null)
  const spinSeq = useRef(0)
  const endedForToken = useRef<number | null>(null)

  useEffect(() => {
    if (state.timerKind === "idle") return
    if (state.phase === "victory" || state.phase === "failure") return

    const token = state.timerToken
    const startedAt = Date.now()
    const durationMs = state.timerDuration * 1000
    endedForToken.current = null

    const id = window.setInterval(() => {
      const remaining = Math.max(
        0,
        Math.ceil((startedAt + durationMs - Date.now()) / 1000),
      )
      dispatch({ type: "TICK", remainingSeconds: remaining })
      if (remaining <= 0 && endedForToken.current !== token) {
        endedForToken.current = token
        dispatch({ type: "TIMER_ENDED" })
      }
    }, 250)

    return () => window.clearInterval(id)
  }, [state.timerToken, state.timerKind, state.timerDuration, state.phase])

  useEffect(() => {
    if (!state.awaitingSpin || state.sectors.length === 0) return

    const sectors = state.sectors
    const id = window.setTimeout(() => {
      const index = Math.floor(Math.random() * sectors.length)
      spinSeq.current += 1
      dispatch({ type: "BEGIN_SPIN" })
      setSpinRequest({ token: spinSeq.current, index })
    }, SPIN_DELAY_MS)

    return () => window.clearTimeout(id)
  }, [state.awaitingSpin, state.currentRound, state.sectors])

  const onSpinComplete = useCallback((index: number) => {
    dispatch({ type: "SPIN_COMPLETE", index })
  }, [])

  return { state, dispatch, spinRequest, onSpinComplete }
}
