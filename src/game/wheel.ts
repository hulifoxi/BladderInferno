import {
  PUNISHMENTS,
  REWARD_CHANCE,
  REWARDS,
} from "./constants"
import type { GameState, WheelKind, WheelSector } from "./types"

export type WheelPick = {
  kind: WheelKind
  sectors: WheelSector[]
  logs: string[]
  canReplaceNextPunishment: boolean
  skipNextReward: boolean
}

export function availableRewards(usedRewardIds: string[]): WheelSector[] {
  return REWARDS.filter((reward) => !usedRewardIds.includes(reward.id))
}

export function pickWheel(
  state: Pick<
    GameState,
    | "canReplaceNextPunishment"
    | "hasAmnesty"
    | "skipNextReward"
    | "usedRewardIds"
  >,
  rng: () => number = Math.random,
): WheelPick {
  const leftover = {
    canReplaceNextPunishment: false,
    skipNextReward: state.skipNextReward,
  }

  if (state.canReplaceNextPunishment) {
    const sectors = availableRewards(state.usedRewardIds)
    const logs = ["⏭️ 根据奖励效果，本轮自动更换为奖励轮盘！"]
    if (sectors.length === 0) {
      return {
        kind: "punishment",
        sectors: [...PUNISHMENTS],
        logs: [
          ...logs,
          "🎲 抽取类型：奖励 ✨",
          "🚫 所有奖励已用完！无法更换。",
          "🎲 抽取类型：惩罚 😈",
        ],
        ...leftover,
      }
    }
    return {
      kind: "reward",
      sectors,
      logs: [...logs, "🎲 抽取类型：奖励 ✨"],
      ...leftover,
    }
  }

  if (state.hasAmnesty) {
    if (rng() < REWARD_CHANCE) {
      return {
        kind: "reward",
        sectors: availableRewards(state.usedRewardIds),
        logs: ["🎲 抽取类型：奖励 ✨"],
        ...leftover,
      }
    }
    return {
      kind: "punishment",
      sectors: [...PUNISHMENTS],
      logs: ["🎲 抽取类型：惩罚 😈 (持有赦免权)"],
      ...leftover,
    }
  }

  if (state.skipNextReward) {
    return {
      kind: "punishment",
      sectors: [...PUNISHMENTS],
      logs: [
        "🚫 根据惩罚效果，本轮强制跳过奖励轮盘！",
        "🎲 抽取类型：惩罚 😈",
      ],
      canReplaceNextPunishment: false,
      skipNextReward: false,
    }
  }

  if (rng() < REWARD_CHANCE) {
    return {
      kind: "reward",
      sectors: availableRewards(state.usedRewardIds),
      logs: ["🎲 抽取类型：奖励 ✨"],
      ...leftover,
    }
  }

  return {
    kind: "punishment",
    sectors: [...PUNISHMENTS],
    logs: ["🎲 抽取类型：惩罚 😈"],
    ...leftover,
  }
}
