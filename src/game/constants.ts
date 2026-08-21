import type { PunishmentOutcome, WheelSector } from "./types"

export const PREPARE_SECONDS = 90 * 60
export const WAIT_SECONDS = 15 * 60
export const WATER_PER_ROUND = 250
export const MAX_WATER = 2300
export const DEFAULT_TOTAL_ROUNDS = 5
export const REWARD_CHANCE = 0.3
export const SPIN_DELAY_MS = 1000
export const SPIN_DURATION_MS = 3500

export const DISCLAIMER_STORAGE_KEY = "disclaimerAccepted"

export const REWARDS: WheelSector[] = [
  { id: "pee3s", label: "排尿3秒 (仅1次)", kind: "reward" },
  { id: "pee5s", label: "排尿5秒 (轮数+2, 喝水+300)", kind: "reward" },
  { id: "rest5", label: "躺下休息5分钟", kind: "reward" },
  { id: "unclamp5", label: "摘除控尿夹5分钟", kind: "reward" },
  { id: "roundsMinus1", label: "游戏轮数-1", kind: "reward" },
  { id: "skipDrink", label: "跳过下次喝水", kind: "reward" },
  { id: "meditate3", label: "闭眼冥想3分钟", kind: "reward" },
  { id: "replacePunish", label: "更换下次惩罚", kind: "reward" },
  { id: "blindfold5", label: "蒙眼暂停5分钟", kind: "reward" },
  { id: "amnesty", label: "白神赦免惩罚 (仅1次)", kind: "reward" },
]

export const PUNISHMENTS: WheelSector[] = [
  { id: "highKnees", label: "高抬腿", kind: "punishment" },
  { id: "wallHold", label: "裸腹撑墙", kind: "punishment" },
  { id: "clampMax", label: "控尿夹Max+喝水200", kind: "punishment" },
  { id: "kneelMoan", label: "裸跪哼叫", kind: "punishment" },
  { id: "dogCrawl", label: "狗爬姿势+刺激", kind: "punishment" },
  { id: "corner", label: "站墙角裸露+录音", kind: "punishment" },
  { id: "mirrorSlap", label: "镜前羞辱+自扇", kind: "punishment" },
  { id: "bladderKick", label: "抱膀胱甩腿+提拉", kind: "punishment" },
  { id: "coldWater", label: "冷水泼裤+剥夺奖励", kind: "punishment" },
  { id: "ropeJump", label: "绑绳下体+跳跃", kind: "punishment" },
]

export const FAILURE_STEPS = [
  "惩罚1: 全裸或半裸，固定姿势（建议狗爬）持续10分钟。",
  "惩罚2: 站到镜子前，大声念出羞耻悔过书5次。（例如：\"我控制不住我的膀胱，我像狗一样失禁了，我不配做人类...\"）",
  "惩罚3: 拍下裤子和地面的尿渍照片，作为耻辱纪念。",
  "惩罚4: 喝下最后 300ml 水。",
  "惩罚5: 戴上控尿夹（如有）或使用压环，持续30分钟。这是你失败的烙印。",
] as const

export const DISCLAIMER_ITEMS = [
  "年满18岁，身心健康，泌尿系统无明显问题。",
  "有紧急停止机制（安全词/按钮）",
  "处于私密安全环境，避免违法、伤害他人或自己行为。",
  "所有道具安全清洁并按说明使用。",
  "请清晰认识到：使用本网站造成的任何生理和心理创伤与本网站作者和Github无关。",
] as const

export const RULE_SECTIONS = [
  {
    title: "1️⃣ 准备阶段（90分钟）",
    items: [
      "排空膀胱",
      "准备足够的水（建议6L）",
      "准备必要道具（控尿夹/尿道压环等）",
      "确保环境安全私密",
    ],
  },
  {
    title: "2️⃣ 挑战阶段",
    items: [
      "每轮强制喝水250ml",
      "随机转动轮盘获得奖励或惩罚",
      "每轮间隔15分钟",
      "总共5轮（可能因奖惩增减）",
    ],
  },
  {
    title: "3️⃣ 奖励机制",
    items: [
      "30%概率触发奖励轮盘",
      "包含排尿机会、休息时间等",
      "某些奖励可能附带额外条件",
    ],
  },
  {
    title: "4️⃣ 惩罚机制",
    items: [
      "70%概率触发惩罚轮盘",
      "同一惩罚重复触发会升级（最高3级）",
      "某些惩罚包含额外喝水要求",
    ],
  },
  {
    title: "5️⃣ 特殊机制",
    items: [
      "可使用一次性主动排尿权（代价：轮数+2，额外喝水250ml）",
      "超过2300ml总水量会收到警告",
      "失败后会触发专属惩罚流程",
    ],
  },
  {
    title: "6️⃣ 胜利条件",
    items: ["完成所有轮次且未失禁", "全程遵守规则执行奖惩"],
  },
] as const

export const SKIP_TOOLTIP =
  "跳过等待不是游戏流程的一部分，仅用于错误排查。如果您在正常游玩游戏，请不要跳过等待时间。"

export function formatTime(totalSeconds: number): string {
  if (totalSeconds <= 0) return "00:00"
  const min = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0")
  const sec = (totalSeconds % 60).toString().padStart(2, "0")
  return `${min}:${sec}`
}

export function describePunishment(
  id: string,
  level: number,
): PunishmentOutcome {
  const lv = Math.min(Math.max(level, 1), 3)

  switch (id) {
    case "highKnees": {
      const count = lv === 1 ? 100 : lv === 2 ? 200 : 300
      const full = `高抬腿${count}次`
      return { full, execute: full, extraWater: 0, skipNextReward: false }
    }
    case "wallHold": {
      const duration = lv === 1 ? 90 : 120
      const full = `裸腹倒立式撑墙保持${duration}秒`
      return { full, execute: full, extraWater: 0, skipNextReward: false }
    }
    case "clampMax":
      return {
        full: "控尿夹调至Max压制+喝水200ml",
        execute: "控尿夹调至Max压制，并喝水200ml",
        extraWater: 200,
        skipNextReward: false,
      }
    case "kneelMoan": {
      const duration = lv === 1 ? 2 : 3
      const extra = lv >= 2 ? "＋咬牙棒羞辱" : ""
      return {
        full: `裸跪＋哼叫"我不能尿！"持续${duration}分钟${extra}`,
        execute: `裸跪，哼叫"我不能尿！"持续${duration}分钟${extra}`,
        extraWater: 0,
        skipNextReward: false,
      }
    }
    case "dogCrawl":
      return {
        full: "狗爬姿势＋电击/冰块冷敷交叉刺激5分钟",
        execute: "保持狗爬姿势，进行电击/冰块冷敷交叉刺激5分钟",
        extraWater: 0,
        skipNextReward: false,
      }
    case "corner": {
      const extra = lv >= 2 ? "（门锁）" : ""
      const recording = lv >= 2 ? "旁放录音\"憋着！\"" : ""
      return {
        full: `站墙角脚打开 + 下体裸露${extra} ${recording} 3分钟`,
        execute: `站墙角，双脚打开，下体裸露${extra}。${recording ? "播放录音\"憋着！\"" : ""} 持续3分钟`,
        extraWater: 0,
        skipNextReward: false,
      }
    }
    case "mirrorSlap":
      return {
        full: "镜前念出羞耻的话，如'我是憋尿狗'并自扇耳光左右各5下",
        execute: "站到镜子前，大声念出指定羞辱语，并左右各扇耳光5下",
        extraWater: 0,
        skipNextReward: false,
      }
    case "bladderKick":
      return {
        full: "抱膀胱姿势原地原地甩腿＋提拉裤子前裆持续60秒",
        execute: "抱紧膀胱，原地甩腿，同时不断提拉裤子前裆，持续60秒",
        extraWater: 0,
        skipNextReward: false,
      }
    case "coldWater":
      return {
        full: "冷水泼前裤（制造失禁错觉刺激）＋剥夺下轮奖励资格",
        execute: "向前裤泼冷水，并剥夺下一轮获得奖励的机会",
        extraWater: 0,
        skipNextReward: true,
      }
    case "ropeJump":
      return {
        full: "强制绑绳下体+跳跃20次（贴尿感区）— 憋尿快感刺激临界",
        execute: "用绳子绑住下体（紧贴尿感区），然后跳跃20次",
        extraWater: 0,
        skipNextReward: false,
      }
    default:
      return {
        full: id,
        execute: id,
        extraWater: 0,
        skipNextReward: false,
      }
  }
}
