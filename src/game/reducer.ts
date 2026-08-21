import {
  DEFAULT_TOTAL_ROUNDS,
  FAILURE_STEPS,
  MAX_WATER,
  PREPARE_SECONDS,
  WAIT_SECONDS,
  WATER_PER_ROUND,
  describePunishment,
} from "./constants"
import type { GameAction, GameState, LogEntry } from "./types"
import { pickWheel } from "./wheel"

function nowTime(): string {
  return new Date().toLocaleTimeString()
}

function log(state: GameState, text: string): GameState {
  const entry: LogEntry = {
    id: state.logSeq + 1,
    time: nowTime(),
    text,
  }
  return { ...state, logSeq: entry.id, logs: [entry, ...state.logs] }
}

function logMany(state: GameState, lines: string[]): GameState {
  return lines.reduce((next, line) => log(next, line), state)
}

function startTimer(
  state: GameState,
  kind: "prepare" | "wait",
  seconds: number,
): GameState {
  return {
    ...state,
    timerKind: kind,
    remainingSeconds: seconds,
    timerDuration: seconds,
    timerToken: state.timerToken + 1,
    showSkip: true,
  }
}

function stopTimer(state: GameState): GameState {
  return {
    ...state,
    timerKind: "idle",
    remainingSeconds: 0,
    timerDuration: 0,
  }
}

export function createInitialState(): GameState {
  return {
    phase: "ready",
    currentRound: 0,
    totalRounds: DEFAULT_TOTAL_ROUNDS,
    waterTotal: 0,
    remainingSeconds: PREPARE_SECONDS,
    timerKind: "idle",
    timerDuration: 0,
    timerToken: 0,
    punishCounts: {},
    usedRewardIds: [],
    peeActionUsed: false,
    pee3secUsed: false,
    canSkipNextDrink: false,
    canReplaceNextPunishment: false,
    hasAmnesty: false,
    skipNextReward: false,
    isSpinning: false,
    awaitingSpin: false,
    showWheel: false,
    showSkip: false,
    wheelKind: null,
    sectors: [],
    resultText: "等待开始…",
    logs: [
      {
        id: 1,
        time: nowTime(),
        text: "游戏已加载。请阅读规则，准备好后点击\"开始挑战\"。",
      },
    ],
    logSeq: 1,
    pendingAmnesty: null,
    punishmentOpen: false,
  }
}

function beginWait(state: GameState): GameState {
  return startTimer(
    {
      ...state,
      isSpinning: false,
      awaitingSpin: false,
    },
    "wait",
    WAIT_SECONDS,
  )
}

function victory(state: GameState): GameState {
  return stopTimer(
    log(
      {
        ...state,
        phase: "victory",
        resultText: "🎉 挑战成功！你赢了！",
        showWheel: false,
        showSkip: false,
        awaitingSpin: false,
        isSpinning: false,
        pendingAmnesty: null,
      },
      "🏆🎉🎉 恭喜！你完成了所有轮次并成功憋住！胜利！ 🎉🎉🏆",
    ),
  )
}

function advanceRound(state: GameState, rng: () => number): GameState {
  if (state.isSpinning) return state

  const currentRound = state.currentRound + 1
  if (currentRound > state.totalRounds) {
    return victory(state)
  }

  let next: GameState = {
    ...state,
    currentRound,
    showSkip: false,
    showWheel: true,
    pendingAmnesty: null,
    isSpinning: false,
  }

  if (next.canSkipNextDrink) {
    next = log(
      next,
      `🚫 第${currentRound}轮：根据奖励效果，跳过本轮喝水！`,
    )
    next = {
      ...next,
      canSkipNextDrink: false,
      resultText: "跳过喝水，准备转动轮盘…",
    }
  } else {
    next = log(next, `🥤 第${currentRound}轮：喝水 ${WATER_PER_ROUND}ml`)
    next = { ...next, waterTotal: next.waterTotal + WATER_PER_ROUND }
    if (next.waterTotal > MAX_WATER) {
      next = log(next, "⚠️ 警告！水量已超出建议容量！")
    }
    next = {
      ...next,
      resultText: `喝水 ${WATER_PER_ROUND}ml，然后转动轮盘…`,
    }
  }

  const pick = pickWheel(next, rng)
  next = {
    ...next,
    wheelKind: pick.kind,
    sectors: pick.sectors,
    canReplaceNextPunishment: pick.canReplaceNextPunishment,
    skipNextReward: pick.skipNextReward,
  }
  next = logMany(next, pick.logs)

  if (next.wheelKind === "reward" && next.sectors.length === 0) {
    next = log(next, "🚫 所有奖励已用完！本轮无奖励。")
    return beginWait({
      ...next,
      resultText: "所有奖励已用完！",
      showWheel: true,
    })
  }

  return { ...next, awaitingSpin: true }
}

function enterChallenge(state: GameState, rng: () => number): GameState {
  const started = log(
    {
      ...state,
      phase: "challenge",
    },
    "✅ 准备时间结束，挑战正式开始！",
  )
  return advanceRound(started, rng)
}

function applyReward(state: GameState, index: number): GameState {
  const sector = state.sectors[index]
  if (!sector) return beginWait(state)

  if (
    (sector.id === "pee3s" && state.pee3secUsed) ||
    (sector.id === "amnesty" && state.usedRewardIds.includes("amnesty"))
  ) {
    let next = log(
      state,
      `🚫 奖励 "${sector.label}" 已使用过或条件不符，重新选择...`,
    )
    next = {
      ...next,
      resultText: `🎁 奖励 "${sector.label}" 已使用过，无效果。`,
    }
    return beginWait(next)
  }

  let next: GameState = {
    ...state,
    usedRewardIds: state.usedRewardIds.includes(sector.id)
      ? state.usedRewardIds
      : [...state.usedRewardIds, sector.id],
  }

  switch (sector.id) {
    case "pee3s": {
      const full = "排尿3秒（仅一次机会）"
      next = logMany(next, [`🎁 奖励：${full}`, "💧 请自觉执行。"])
      next = { ...next, pee3secUsed: true, resultText: `🎁 奖励：${full}` }
      break
    }
    case "pee5s": {
      const full = "排尿5秒（使用后，游戏总轮数+2，强制喝水300ml）"
      const totalRounds = next.totalRounds + 2
      const waterTotal = next.waterTotal + 300
      next = logMany(next, [
        `🎁 奖励：${full}`,
        "💧 请自觉执行。",
        `🔄 游戏总轮数增加到 ${totalRounds}`,
        `💧 请立即额外喝水 300ml (当前总量: ${waterTotal}ml)`,
      ])
      next = {
        ...next,
        totalRounds,
        waterTotal,
        resultText: `🎁 奖励：${full}`,
      }
      break
    }
    case "rest5": {
      const full = "躺下休息5分钟（保持憋尿状态，不得弯腰）"
      next = logMany(next, [`🎁 奖励：${full}`, "🧘 请自觉执行。"])
      next = { ...next, resultText: `🎁 奖励：${full}` }
      break
    }
    case "unclamp5": {
      const full = "摘除控尿夹5分钟（如有佩戴）"
      next = logMany(next, [`🎁 奖励：${full}`, "🔓 请自觉执行。"])
      next = { ...next, resultText: `🎁 奖励：${full}` }
      break
    }
    case "roundsMinus1": {
      const full = "游戏次数-1"
      const totalRounds = Math.max(1, next.totalRounds - 1)
      next = logMany(next, [
        `🎁 奖励：${full}`,
        `🔄 游戏总轮数减少到 ${totalRounds}`,
      ])
      next = { ...next, totalRounds, resultText: `🎁 奖励：${full}` }
      if (next.currentRound >= totalRounds) {
        next = log(next, "🎉 由于奖励效果，你已完成所有轮次！")
        return victory(next)
      }
      break
    }
    case "skipDrink": {
      const full = "喝水轮可跳一次"
      next = logMany(next, [
        `🎁 奖励：${full}`,
        "🚫 下一轮开始时将自动跳过喝水。",
      ])
      next = {
        ...next,
        canSkipNextDrink: true,
        resultText: `🎁 奖励：${full}`,
      }
      break
    }
    case "meditate3": {
      const full = "闭眼专注冥想3分钟，降低尿意"
      next = logMany(next, [`🎁 奖励：${full}`, "🧘 请自觉执行。"])
      next = { ...next, resultText: `🎁 奖励：${full}` }
      break
    }
    case "replacePunish": {
      const full = "可自行更换下一轮惩罚内容"
      next = logMany(next, [
        `🎁 奖励：${full}`,
        "⏭️ 如果下一轮触发惩罚，将自动替换为奖励轮盘。",
      ])
      next = {
        ...next,
        canReplaceNextPunishment: true,
        resultText: `🎁 奖励：${full}`,
      }
      break
    }
    case "blindfold5": {
      const full = "蒙眼暂停5分钟（禁闭状态，缓冲过激）"
      next = logMany(next, [`🎁 奖励：${full}`, "🙈 请自觉执行。"])
      next = { ...next, resultText: `🎁 奖励：${full}` }
      break
    }
    case "amnesty": {
      const full =
        "白神特赐：戴项圈跪着，主人一句话取消一次惩罚（仅一次）"
      next = logMany(next, [
        `🎁 奖励：${full}`,
        "👑 下一次触发惩罚时，可选择使用此赦免权。",
      ])
      next = { ...next, hasAmnesty: true, resultText: `🎁 奖励：${full}` }
      break
    }
    default: {
      next = log(next, `🎁 奖励：${sector.label}`)
      next = { ...next, resultText: `🎁 奖励：${sector.label}` }
    }
  }

  return beginWait(next)
}

function applyPunishment(state: GameState, sectorId: string): GameState {
  const count = (state.punishCounts[sectorId] ?? 0) + 1
  const level = Math.min(count, 3)
  const outcome = describePunishment(sectorId, level)

  let next: GameState = {
    ...state,
    punishCounts: { ...state.punishCounts, [sectorId]: count },
    skipNextReward: outcome.skipNextReward,
  }

  next = log(next, `💀 惩罚 Lv${level}：${outcome.full}`)
  next = { ...next, resultText: `💀 惩罚 Lv${level}：${outcome.full}` }
  next = log(next, `➡️ 请立即执行惩罚：${outcome.execute}`)

  if (outcome.extraWater > 0) {
    const waterTotal = next.waterTotal + outcome.extraWater
    next = {
      ...next,
      waterTotal,
    }
    next = log(
      next,
      `💧 请立即额外喝水 ${outcome.extraWater}ml (当前总量: ${waterTotal}ml)`,
    )
  }
  if (outcome.skipNextReward) {
    next = log(
      next,
      "🚫 注意：下一轮如果抽中奖励轮盘，奖励将被跳过！",
    )
  }

  return beginWait(next)
}

function onTimerEnded(state: GameState, rng: () => number): GameState {
  if (state.phase === "prepare") {
    return enterChallenge(state, rng)
  }
  if (state.phase === "challenge") {
    return advanceRound(state, rng)
  }
  return state
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  const rng = "rng" in action && action.rng ? action.rng : Math.random

  switch (action.type) {
    case "START_PREPARE": {
      if (state.phase !== "ready") return state
      return startTimer(
        logMany(
          {
            ...state,
            phase: "prepare",
            resultText: "请完成准备，然后开始挑战...",
          },
          [
            "🚀 挑战开始！你有90分钟准备时间。",
            "⏳ 请在这段时间内：",
            "1. 排空尿液",
            "2. 准备道具：水6L、转盘、控尿夹/尿道压环等",
            "3. 确保环境安全私密",
            "4. 调整好心态",
          ],
        ),
        "prepare",
        PREPARE_SECONDS,
      )
    }
    case "TICK":
      if (state.phase === "victory" || state.phase === "failure") {
        return { ...state, remainingSeconds: 0 }
      }
      return { ...state, remainingSeconds: action.remainingSeconds }
    case "TIMER_ENDED":
    case "SKIP_TIMER": {
      if (state.phase === "victory" || state.phase === "failure") return state
      if (state.phase === "ready") return state
      if (action.type === "SKIP_TIMER") {
        const skipped =
          state.phase === "prepare"
            ? log(state, "⏩ 跳过准备时间...")
            : log(state, "⏩ 跳过当前15分钟等待...")
        return onTimerEnded(stopTimer(skipped), rng)
      }
      return onTimerEnded(stopTimer(state), rng)
    }
    case "BEGIN_SPIN":
      if (!state.awaitingSpin || state.phase !== "challenge") return state
      return {
        ...state,
        awaitingSpin: false,
        isSpinning: true,
        resultText: `旋转 ${state.wheelKind === "reward" ? "奖励" : "惩罚"} 轮盘中...`,
      }
    case "SPIN_COMPLETE": {
      if (state.phase !== "challenge") return state
      const sector = state.sectors[action.index]
      if (!sector) return beginWait({ ...state, isSpinning: false })

      if (sector.kind === "reward") {
        return applyReward({ ...state, isSpinning: false }, action.index)
      }

      if (state.hasAmnesty) {
        return {
          ...state,
          isSpinning: false,
          pendingAmnesty: sector,
        }
      }
      return applyPunishment({ ...state, isSpinning: false }, sector.id)
    }
    case "RESOLVE_AMNESTY": {
      const sector = state.pendingAmnesty
      if (!sector) return state
      if (action.use) {
        const counts = { ...state.punishCounts }
        return beginWait(
          log(
            {
              ...state,
              pendingAmnesty: null,
              hasAmnesty: false,
              resultText: "👑 惩罚已赦免！",
              punishCounts: counts,
            },
            "👑 使用【白神赦免】，本次惩罚被取消！",
          ),
        )
      }
      return applyPunishment(
        log(
          { ...state, pendingAmnesty: null },
          "⚠️ 你选择不使用【白神赦免】权。",
        ),
        sector.id,
      )
    }
    case "USE_PEE_ACTION": {
      if (state.phase !== "challenge" || state.peeActionUsed) {
        return state
      }
      const totalRounds = state.totalRounds + 2
      const waterTotal = state.waterTotal + 250
      return logMany(
        {
          ...state,
          peeActionUsed: true,
          totalRounds,
          waterTotal,
          resultText: "使用了排尿权，轮数+2，请额外喝水250ml。",
        },
        [
          "💧 你使用了主动排尿5秒的权利！",
          "⚠️ 后果：游戏总轮数 +2",
          "💧 后果：额外喝水 250ml",
          `💧 请立即额外喝水 250ml (当前总量: ${waterTotal}ml)`,
        ],
      )
    }
    case "DECLARE_FAILURE": {
      if (state.phase !== "challenge") return state
      let next = logMany(stopTimer(state), [
        "🏳️⚠️ 你宣告失败（失禁）！准备接受羞耻垮台惩罚... ⚠️🏳️",
        "------- 失禁惩罚流程开始 -------",
        ...FAILURE_STEPS.map((step) => `➡️ ${step}`),
        "------- 失禁惩罚流程结束 -------",
      ])
      return {
        ...next,
        phase: "failure",
        resultText: "😖 挑战失败...",
        showWheel: false,
        showSkip: false,
        awaitingSpin: false,
        isSpinning: false,
        pendingAmnesty: null,
        punishmentOpen: true,
      }
    }
    case "CLOSE_PUNISHMENT":
      return { ...state, punishmentOpen: false }
    case "RESET":
      return createInitialState()
    default:
      return state
  }
}

export function isGameOver(state: GameState): boolean {
  return state.phase === "victory" || state.phase === "failure"
}

export function phaseLabel(state: GameState): string {
  switch (state.phase) {
    case "ready":
      return "准备期"
    case "prepare":
      return "准备中"
    case "challenge":
      return "挑战中"
    case "victory":
      return "胜利 ✅"
    case "failure":
      return "失败 ❌"
  }
}

export function roundLabel(state: GameState): string {
  if (state.phase === "victory") return "已完成"
  return `${state.currentRound} / ${state.totalRounds}`
}
