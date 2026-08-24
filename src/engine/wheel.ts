import { bandOf, DIFFICULTY_SPECS } from "./schedule"
import type { DifficultyId, GameState, Sector, SectorId, SectorKind } from "./types"

const REWARDS: Sector[] = [
  { id: "pee3", kind: "reward", label: "尿 3 秒" },
  { id: "skipDose", kind: "reward", label: "跳过下一杯" },
  { id: "halfDose", kind: "reward", label: "下一杯减半" },
  { id: "shaveHold", kind: "reward", label: "少撑 4 分钟" },
  { id: "skipWheel", kind: "reward", label: "下次免转" },
  { id: "amnesty", kind: "reward", label: "下次免罚" },
  { id: "sit5", kind: "reward", label: "坐下 5 分钟" },
  { id: "delayWheel", kind: "reward", label: "转盘推迟" },
]

const LIGHT: Sector[] = [
  { id: "waterSound", kind: "punish", label: "听流水" },
  { id: "slowWalk", kind: "punish", label: "慢走" },
  { id: "heelTap", kind: "punish", label: "点脚跟" },
  { id: "noWall", kind: "punish", label: "不许靠墙" },
  { id: "noClench", kind: "punish", label: "不许夹腿" },
  { id: "countOut", kind: "punish", label: "大声报数" },
]

const MED: Sector[] = [
  { id: "cough", kind: "punish", label: "咳嗽" },
  { id: "laugh", kind: "punish", label: "大笑" },
  { id: "squat", kind: "punish", label: "深蹲" },
  { id: "calf", kind: "punish", label: "提踵" },
  { id: "armsUp", kind: "punish", label: "抱头站" },
  { id: "addHold", kind: "punish", label: "多撑 3 分钟" },
  { id: "drink100", kind: "punish", label: "再喝 100 ml" },
]

const HEAVY: Sector[] = [
  { id: "smallJump", kind: "punish", label: "小跳" },
  { id: "jumpingJack", kind: "punish", label: "开合跳" },
  { id: "highKnee", kind: "punish", label: "高抬腿" },
  { id: "standWater", kind: "punish", label: "站着听流水" },
  { id: "march", kind: "punish", label: "踏步" },
  { id: "bearDown", kind: "punish", label: "往下用力" },
]

const EDGE: Sector[] = [
  { id: "statue", kind: "punish", label: "完全不许动" },
  { id: "noWiggle", kind: "punish", label: "不许扭夹" },
  { id: "breathOnly", kind: "punish", label: "只用呼吸" },
]

function shuffle<T>(items: T[], rng: () => number): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

function pick(pool: Sector[], n: number, rng: () => number): Sector[] {
  if (n <= 0 || pool.length === 0) return []
  const shuffled = shuffle(pool, rng)
  const out: Sector[] = []
  for (let i = 0; i < n; i++) out.push(shuffled[i % shuffled.length])
  return out
}

function availableRewards(state: GameState): Sector[] {
  const dosesLeft = state.nextDoseIndex < DIFFICULTY_SPECS[state.difficulty].dosesAt70.length
  const mustStand = DIFFICULTY_SPECS[state.difficulty].standFromMl != null
  return REWARDS.filter((sector) => {
    if (sector.id === "pee3" && state.peeUsed) return false
    if ((sector.id === "skipDose" || sector.id === "halfDose") && !dosesLeft) return false
    if (sector.id === "sit5" && !mustStand) return false
    if (sector.id === "amnesty" && state.hasAmnesty) return false
    return true
  })
}

function punishPool(ml: number): Sector[] {
  const pool = [...LIGHT]
  if (ml >= 250) pool.push(...MED)
  if (ml >= 400) pool.push(...HEAVY)
  if (ml >= 500) pool.push(...EDGE)
  return pool
}

export function buildWheel(
  state: GameState,
  opts: { allPunish?: boolean } = {},
  rng: () => number = Math.random,
): Sector[] {
  const band = bandOf(state.bladderMl)
  const rewardCount = opts.allPunish
    ? 0
    : DIFFICULTY_SPECS[state.difficulty].rewardSlots[band]
  const rewards = pick(availableRewards(state), rewardCount, rng)
  const need = Math.max(0, 8 - rewards.length)
  const punishments = pick(punishPool(state.bladderMl), need, rng)
  return shuffle([...rewards, ...punishments], rng).slice(0, 8)
}

export function sectorKind(id: SectorId): SectorKind {
  return REWARDS.some((s) => s.id === id) ? "reward" : "punish"
}

export function difficultyOf(id: DifficultyId) {
  return DIFFICULTY_SPECS[id]
}
