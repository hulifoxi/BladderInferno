import { useGame } from "@/hooks/useGame"
import { clearGame } from "@/engine"
import { EmptyScreen } from "@/screens/EmptyScreen"
import { EndScreen } from "@/screens/EndScreen"
import { GateScreen } from "@/screens/GateScreen"
import { LobbyScreen } from "@/screens/LobbyScreen"
import { PlayScreen } from "@/screens/PlayScreen"

export default function App() {
  const { state, dispatch, debug } = useGame()

  if (state.screen === "gate") {
    return <GateScreen onAccept={() => dispatch({ type: "ACCEPT_DISCLAIMER" })} />
  }
  if (state.screen === "lobby") {
    return (
      <LobbyScreen
        difficulty={state.difficulty}
        weightKg={state.weightKg}
        onWeight={(kg) => dispatch({ type: "SET_WEIGHT", kg })}
        onChoose={(difficulty) => dispatch({ type: "CHOOSE_DIFFICULTY", difficulty })}
        onStart={() => dispatch({ type: "BEGIN_EMPTY" })}
      />
    )
  }
  if (state.screen === "empty") {
    return (
      <EmptyScreen
        difficulty={state.difficulty}
        weightKg={state.weightKg}
        onConfirm={() => dispatch({ type: "CONFIRM_EMPTY", now: Date.now() })}
        onBack={() => dispatch({ type: "RESET" })}
      />
    )
  }
  if (state.screen === "play") {
    return <PlayScreen state={state} dispatch={dispatch} debug={debug} />
  }
  return (
    <EndScreen
      won={state.screen === "won"}
      difficulty={state.difficulty}
      bladderMl={state.bladderMl}
      onAgain={() => {
        clearGame()
        dispatch({ type: "RESET" })
      }}
    />
  )
}
