import { describeSector } from "./copy"
import { estimateBladderMl, holdStartMl, peeMl, round10, urineRateAt } from "./physiology"
import { bandMl, DIFFICULTY_SPECS, dosePlan, holdTargetSec } from "./schedule"
import type { Action, Dose, GameState, TaskCard, WheelReason } from "./types"
import { buildWheel } from "./wheel"

const WAVE_SEC = 70
const WAVE_GAP = 5 * 60
const MAX_EXTRA = 2

export function initialState(): GameState {
  return {
    screen: "gate",
    disclaimerOk: false,
    difficulty: "novice",
    weightKg: 70,
    startedAt: null,
    elapsedSec: 0,
    drinks: [],
    nextDoseIndex: 0,
    pendingDrink: null,
    skipNextDose: false,
    halfNextDose: false,
    extraDrinkCount: 0,
    bladderMl: 0,
    voidedMl: 0,
    urineRate: 1,
    peakRate: 1,
    holdStartedAt: null,
    holdElapsedSec: 0,
    holdAdjustSec: 0,
    gatesFired: [],
    nextStormAt: null,
    lastWaveAt: null,
    waveUntil: null,
    sitUntil: null,
    skipTickets: 0,
    hasAmnesty: false,
    peeUsed: false,
    lastDrinkGateDone: false,
    queuedReasons: [],
    wheel: null,
    task: null,
    peeUntilSec: null,
    punishCounts: {},
    logs: [],
    logSeq: 0,
  }
}

function log(state: GameState, text: string): GameState {
  const id = state.logSeq + 1
  return {
    ...state,
    logSeq: id,
    logs: [...state.logs.slice(-48), { id, atSec: Math.floor(state.elapsedSec), text }],
  }
}

function refresh(state: GameState): GameState {
  const bladderMl = estimateBladderMl(state.drinks, state.elapsedSec, state.voidedMl)
  const urineRate = urineRateAt(state.drinks, state.elapsedSec)
  return {
    ...state,
    bladderMl,
    urineRate,
    peakRate: Math.max(state.peakRate, urineRate),
    holdElapsedSec:
      state.holdStartedAt == null ? 0 : Math.max(0, state.elapsedSec - state.holdStartedAt),
  }
}

function occupied(state: GameState): boolean {
  return Boolean(state.pendingDrink || state.wheel || state.task || state.peeUntilSec != null)
}

function openWheel(state: GameState, reason: WheelReason, allPunish = false): GameState {
  if (state.wheel || state.task || state.peeUntilSec != null) {
    return { ...state, queuedReasons: [...state.queuedReasons, reason] }
  }
  if (reason !== "gamble" && state.skipTickets > 0) {
    return log({ ...state, skipTickets: state.skipTickets - 1 }, "用掉一张免转券。这次不用转。")
  }
  return log(
    {
      ...state,
      wheel: {
        reason,
        sectors: buildWheel(state, { allPunish }),
        spinning: false,
        landed: null,
      },
    },
    reason === "gamble" ? "转一盘惩罚，换早 3 分钟结束。" : "转盘来了。转。",
  )
}

function dequeue(state: GameState): GameState {
  if (occupied(state) || state.queuedReasons.length === 0) return state
  const [reason, ...rest] = state.queuedReasons
  return openWheel({ ...state, queuedReasons: rest }, reason, reason === "gamble")
}

function maybeHold(state: GameState): GameState {
  if (state.holdStartedAt != null || state.drinks.length === 0) return state
  const line = holdStartMl(state.difficulty)
  if (state.bladderMl < line) return state
  const spec = DIFFICULTY_SPECS[state.difficulty]
  return log(
    {
      ...state,
      holdStartedAt: state.elapsedSec,
      nextStormAt: state.elapsedSec + spec.stormSec,
    },
    `到 ${line} ml，开始计时。`,
  )
}

function maybeEvents(state: GameState): GameState {
  if (state.screen !== "play") return state
  let next = state
  const spec = DIFFICULTY_SPECS[next.difficulty]
  const plan = dosePlan(next.difficulty, next.weightKg)

  if (!next.pendingDrink && next.nextDoseIndex < plan.length) {
    const dose = plan[next.nextDoseIndex]
    if (next.elapsedSec >= dose.atSec) {
      if (next.skipNextDose) {
        return log(
          { ...next, skipNextDose: false, nextDoseIndex: next.nextDoseIndex + 1 },
          "跳过了这一杯。",
        )
      }
      let ml = dose.ml
      if (next.halfNextDose) {
        ml = round10(ml / 2)
        next = { ...next, halfNextDose: false }
      }
      const pending: Dose = { ...dose, ml }
      return log({ ...next, pendingDrink: pending }, `喝 ${ml} ml。`)
    }
  }

  if (occupied(next)) return next

  for (const gate of spec.gates) {
    const key = `gate:${gate}`
    if (next.gatesFired.includes(key)) continue
    if (next.bladderMl < bandMl(gate)) continue
    next = log(
      { ...next, gatesFired: [...next.gatesFired, key] },
      `尿量到了 ${bandMl(gate)} ml。转转盘。`,
    )
    return openWheel(next, "gate")
  }

  if (spec.lastDrinkGateSec > 0 && next.drinks.length > 0 && !next.lastDrinkGateDone) {
    const last = next.drinks[next.drinks.length - 1]
    if (
      next.nextDoseIndex >= plan.length &&
      next.elapsedSec >= last.atSec + spec.lastDrinkGateSec
    ) {
      next = log({ ...next, lastDrinkGateDone: true }, "末杯已经进肚子。再转一次。")
      return openWheel(next, "lastDrink")
    }
  }

  if (
    next.holdStartedAt != null &&
    next.nextStormAt != null &&
    next.elapsedSec >= next.nextStormAt
  ) {
    next = { ...next, nextStormAt: next.elapsedSec + spec.stormSec }
    return openWheel(log(next, "该转转盘了。"), "storm")
  }

  if (
    next.holdStartedAt != null &&
    next.bladderMl >= 400 &&
    next.waveUntil == null &&
    (next.lastWaveAt == null || next.elapsedSec >= next.lastWaveAt + WAVE_GAP)
  ) {
    next = log(
      {
        ...next,
        lastWaveAt: next.elapsedSec,
        waveUntil: next.elapsedSec + WAVE_SEC,
      },
      "尿意上来。",
    )
  }

  return next
}

function maybeWin(state: GameState): GameState {
  if (state.screen !== "play") return state
  if (occupied(state) || state.waveUntil != null) return state
  if (state.holdStartedAt == null) return state
  if (state.holdElapsedSec < holdTargetSec(state.difficulty, state.holdAdjustSec)) return state
  if (DIFFICULTY_SPECS[state.difficulty].needRateDrop && state.urineRate > state.peakRate / 2) {
    return state
  }
  return log({ ...state, screen: "won" }, "撑住了。去撒尿吧。")
}

function advance(state: GameState, now: number): GameState {
  if (state.screen !== "play" || state.startedAt == null) return state
  let next: GameState = { ...state, elapsedSec: Math.max(0, (now - state.startedAt) / 1000) }

  if (next.peeUntilSec != null && next.elapsedSec >= next.peeUntilSec) {
    const voided = peeMl(3)
    next = log(
      { ...next, peeUntilSec: null, voidedMl: next.voidedMl + voided, peeUsed: true },
      `尿了 3 秒，大约少了 ${voided} ml。到点停了。`,
    )
  }
  if (next.waveUntil != null && next.elapsedSec >= next.waveUntil) {
    next = { ...next, waveUntil: null }
  }

  next = refresh(next)
  next = maybeHold(next)
  next = maybeEvents(next)
  next = dequeue(next)
  return maybeWin(next)
}

function applyCard(state: GameState, card: TaskCard): GameState {
  let next = state
  const hasDose = next.nextDoseIndex < dosePlan(next.difficulty, next.weightKg).length

  if (card.grantSkipTicket) next = { ...next, skipTickets: next.skipTickets + 1 }
  if (card.grantAmnesty) next = { ...next, hasAmnesty: true }
  if (card.skipNextDose) {
    next = hasDose
      ? { ...next, skipNextDose: true }
      : { ...next, holdAdjustSec: next.holdAdjustSec - 3 * 60 }
  }
  if (card.halfNextDose) {
    next = hasDose
      ? { ...next, halfNextDose: true }
      : { ...next, holdAdjustSec: next.holdAdjustSec - 2 * 60 }
  }
  if (card.holdDeltaSec) next = { ...next, holdAdjustSec: next.holdAdjustSec + card.holdDeltaSec }
  if (card.sitSeconds) next = { ...next, sitUntil: next.elapsedSec + card.sitSeconds }
  if (card.delayWheelSec && next.nextStormAt != null) {
    next = { ...next, nextStormAt: next.nextStormAt + card.delayWheelSec }
  }
  if (card.forceWave) {
    next = {
      ...next,
      lastWaveAt: next.elapsedSec,
      waveUntil: next.elapsedSec + WAVE_SEC,
    }
  }
  if (card.extraWaterMl > 0) {
    if (next.extraDrinkCount >= MAX_EXTRA) {
      next = log(
        { ...next, holdAdjustSec: next.holdAdjustSec + 3 * 60 },
        "加喝次数用完了。改成多撑 3 分钟。",
      )
    } else {
      next = log(
        {
          ...next,
          extraDrinkCount: next.extraDrinkCount + 1,
          drinks: [...next.drinks, { atSec: next.elapsedSec, ml: card.extraWaterMl }],
        },
        `又喝了 ${card.extraWaterMl} ml。`,
      )
    }
  }
  if (card.peeSeconds > 0) next = { ...next, peeUntilSec: next.elapsedSec + card.peeSeconds }
  return next
}

export function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "HYDRATE":
      return action.state
    case "ACCEPT_DISCLAIMER":
      return { ...state, disclaimerOk: true, screen: "lobby" }
    case "SET_WEIGHT":
      return { ...state, weightKg: Math.min(130, Math.max(40, Math.round(action.kg))) }
    case "CHOOSE_DIFFICULTY":
      return { ...state, difficulty: action.difficulty }
    case "BEGIN_EMPTY":
      return log({ ...state, screen: "empty" }, "先撒空。")
    case "CONFIRM_EMPTY": {
      const fresh = initialState()
      return log(
        {
          ...fresh,
          disclaimerOk: true,
          screen: "play",
          difficulty: state.difficulty,
          weightKg: state.weightKg,
          startedAt: action.now,
        },
        "开始。",
      )
    }
    case "TICK":
      return advance(state, action.now)
    case "CONFIRM_DRINK": {
      if (!state.pendingDrink) return state
      const drink = { atSec: state.elapsedSec, ml: state.pendingDrink.ml }
      let next: GameState = {
        ...state,
        drinks: [...state.drinks, drink],
        pendingDrink: null,
        nextDoseIndex: state.nextDoseIndex + 1,
      }
      next = log(next, `喝完 ${drink.ml} ml。`)
      next = refresh(next)
      return maybeHold(next)
    }
    case "SPIN":
      if (!state.wheel || state.wheel.spinning || state.wheel.landed) return state
      return { ...state, wheel: { ...state.wheel, spinning: true } }
    case "SPIN_LAND": {
      if (!state.wheel) return state
      const landed = state.wheel.sectors[action.index] ?? state.wheel.sectors[0]
      return { ...state, wheel: { ...state.wheel, spinning: false, landed } }
    }
    case "USE_SKIP_TICKET": {
      if (!state.wheel || state.skipTickets <= 0 || state.wheel.reason === "gamble") return state
      return dequeue(
        log({ ...state, wheel: null, skipTickets: state.skipTickets - 1 }, "免转券用掉了。"),
      )
    }
    case "USE_AMNESTY": {
      if (!state.wheel?.landed || !state.hasAmnesty || state.wheel.landed.kind !== "punish") {
        return state
      }
      return dequeue(log({ ...state, wheel: null, hasAmnesty: false }, "免罚用掉了。这次不做。"))
    }
    case "ACK_RESULT": {
      if (!state.wheel?.landed) return state
      const landed = state.wheel.landed
      const gamble = state.wheel.reason === "gamble"
      const repeat = (state.punishCounts[landed.id] ?? 0) + 1
      const card = describeSector(landed.id, repeat)
      let next: GameState = {
        ...state,
        wheel: null,
        task: null,
        punishCounts:
          landed.kind === "punish"
            ? { ...state.punishCounts, [landed.id]: repeat }
            : state.punishCounts,
      }
      if (gamble) {
        next = log({ ...next, holdAdjustSec: next.holdAdjustSec - 3 * 60 }, "收下惩罚。早结束 3 分钟。")
      }
      next = applyCard(next, card)
      next = log(next, card.kind === "reward" ? `奖励：${card.title}` : `惩罚：${card.title}`)
      next = refresh(next)
      next = maybeHold(next)
      next = dequeue(next)
      return maybeWin(next)
    }
    case "FINISH_TASK": {
      if (!state.task) return state
      const card = state.task
      let next: GameState = { ...state, task: null }
      next = applyCard(next, card)
      next = log(next, card.kind === "reward" ? `奖励：${card.title}` : `惩罚：${card.title}`)
      next = refresh(next)
      next = maybeHold(next)
      next = dequeue(next)
      return maybeWin(next)
    }
    case "GAMBLE": {
      if (state.screen !== "play") return state
      if (!DIFFICULTY_SPECS[state.difficulty].gamble) return state
      if (state.holdStartedAt == null || occupied(state)) return state
      return openWheel(state, "gamble", true)
    }
    case "GIVE_UP":
      return log(
        {
          ...state,
          screen: "lost",
          pendingDrink: null,
          wheel: null,
          task: null,
          peeUntilSec: null,
        },
        "认输了。去撒尿，然后按清单做。",
      )
    case "RESET":
      return { ...initialState(), disclaimerOk: true, screen: "lobby" }
    case "DEBUG_JUMP":
      if (state.startedAt == null) return state
      return advance({ ...state, startedAt: state.startedAt - action.seconds * 1000 }, action.now)
    case "DEBUG_WIN":
      return { ...state, screen: "won" }
    case "DEBUG_LOSE":
      return { ...state, screen: "lost" }
  }
}

export function shouldPersist(state: GameState): boolean {
  return (
    state.screen === "empty" ||
    state.screen === "play" ||
    state.screen === "won" ||
    state.screen === "lost"
  )
}
