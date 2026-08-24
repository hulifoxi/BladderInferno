import { peeMl } from "./physiology"
import type { SectorId, TaskCard } from "./types"

function card(
  id: SectorId,
  kind: TaskCard["kind"],
  title: string,
  body: string,
  extra: Partial<TaskCard> = {},
): TaskCard {
  return {
    id,
    kind,
    title,
    body,
    extraWaterMl: 0,
    peeSeconds: 0,
    sitSeconds: 0,
    holdDeltaSec: 0,
    skipNextDose: false,
    halfNextDose: false,
    grantSkipTicket: false,
    grantAmnesty: false,
    delayWheelSec: 0,
    forceWave: false,
    ...extra,
  }
}

export function describeSector(id: SectorId, repeat: number): TaskCard {
  const n = Math.min(3, Math.max(1, repeat))

  switch (id) {
    case "pee3":
      return card(
        id,
        "reward",
        "尿 3 秒",
        `尿 3 秒，到点停。大约少 ${peeMl(3)} ml。每局一次。`,
        { peeSeconds: 3 },
      )
    case "skipDose":
      return card(id, "reward", "跳过下一杯", "下一杯不用喝了。没有下一杯，就少撑 3 分钟。", {
        skipNextDose: true,
      })
    case "halfDose":
      return card(id, "reward", "下一杯减半", "下一杯只喝一半。没有下一杯，就少撑 2 分钟。", {
        halfNextDose: true,
      })
    case "shaveHold":
      return card(id, "reward", "少撑 4 分钟", "开始计时以后要撑的时间少 4 分钟。", {
        holdDeltaSec: -4 * 60,
      })
    case "skipWheel":
      return card(id, "reward", "下次免转", "发一张免转券。下次转盘出来时可以不转。", {
        grantSkipTicket: true,
      })
    case "amnesty":
      return card(id, "reward", "下次免罚", "下次抽到惩罚可以不做。", { grantAmnesty: true })
    case "sit5":
      return card(id, "reward", "坐下 5 分钟", "可以坐下 5 分钟。时间一到，该站还得站。", {
        sitSeconds: 5 * 60,
      })
    case "delayWheel":
      return card(id, "reward", "转盘推迟", "下次转盘推迟 3 分钟。", { delayWheelSec: 3 * 60 })
    case "waterSound":
      return card(
        id,
        "punish",
        "听流水",
        `打开水龙头，听流水 ${n === 1 ? 60 : n === 2 ? 90 : 120} 秒。`,
      )
    case "slowWalk":
      return card(id, "punish", "慢走", "在屋里慢慢走 2 分钟。")
    case "heelTap":
      return card(
        id,
        "punish",
        "点脚跟",
        `脚后跟轻轻点地 ${n === 1 ? 40 : n === 2 ? 55 : 70} 次，边点边报数。`,
      )
    case "noWall":
      return card(id, "punish", "不许靠墙", "双手背后，分开站 2 分钟。")
    case "noClench":
      return card(
        id,
        "punish",
        "不许夹腿",
        "双手离开身体，90 秒。夹腿或踮脚就算漏。",
      )
    case "countOut":
      return card(
        id,
        "punish",
        "大声报数",
        "大声从 1 数到 40。漏数就重来。",
      )
    case "cough":
      return card(
        id,
        "punish",
        "咳嗽",
        `对着镜子咳嗽 ${n === 1 ? 5 : n === 2 ? 8 : 12} 声，每声报数。`,
      )
    case "laugh":
      return card(id, "punish", "大笑", "对着镜子大声笑 20 秒。")
    case "squat":
      return card(
        id,
        "punish",
        "深蹲",
        `深蹲 ${n === 1 ? 10 : n === 2 ? 14 : 18} 次。蹲下去再站直，算一次。`,
      )
    case "calf":
      return card(
        id,
        "punish",
        "提踵",
        `踮脚提踵 ${n === 1 ? 30 : n === 2 ? 40 : 50} 次。脚跟离地再放下，算一次。`,
      )
    case "armsUp":
      return card(id, "punish", "抱头站", "双手抱头站 90 秒。")
    case "addHold":
      return card(id, "punish", "多撑 3 分钟", "开始计时以后要多撑 3 分钟。", { holdDeltaSec: 3 * 60 })
    case "drink100":
      return card(
        id,
        "punish",
        "再喝 100 ml",
        "2 分钟内再喝 100 ml。加喝过两次则改成多撑 3 分钟。",
        { extraWaterMl: 100 },
      )
    case "smallJump":
      return card(
        id,
        "punish",
        "小跳",
        `原地小跳 ${n === 1 ? 15 : n === 2 ? 20 : 25} 下。双脚离地才算。`,
      )
    case "jumpingJack":
      return card(
        id,
        "punish",
        "开合跳",
        `开合跳 ${n === 1 ? 20 : n === 2 ? 30 : 40} 下。`,
      )
    case "highKnee":
      return card(
        id,
        "punish",
        "高抬腿",
        `高抬腿 ${n === 1 ? 30 : n === 2 ? 40 : 50} 次。膝盖尽量抬到腰。`,
      )
    case "standWater":
      return card(id, "punish", "站着听流水", "站着听流水 2 分钟。")
    case "march":
      return card(id, "punish", "踏步", "原地踏步 90 秒。")
    case "bearDown":
      return card(
        id,
        "punish",
        "往下用力",
        "站好，闭气往下用力 5 秒，做 3 次。头晕就停，停了也算做完。",
      )
    case "statue":
      return card(
        id,
        "punish",
        "完全不许动",
        `定一个姿势，静止 ${n === 1 ? 3 : 5} 分钟。`,
      )
    case "noWiggle":
      return card(id, "punish", "不许扭夹", "4 分钟内不扭胯、不夹腿、不踮脚。")
    case "breathOnly":
      return card(
        id,
        "punish",
        "只用呼吸",
        "接下来 60 秒只用呼吸顶。不换姿势。",
        { forceWave: true },
      )
  }
}

export const FAIL_STEPS = [
  "去厕所，把尿撒干净。",
  "脱掉下身，跪 10 分钟。",
  "对着镜子说「我没憋住」5 遍，带上这一局难度。",
  "拍一张自己留着。10 分钟后再穿回去。",
] as const

export const DISCLAIMER = {
  title: "免责声明",
  product: "憋尿挑战",
  effective: "2026年8月25日",
  preamble:
    "请在继续使用前完整阅读本声明。点击「同意并继续」即表示您已阅读、理解并接受下列全部条款。如您不同意，请立即停止使用并关闭本页面。",
  articles: [
    {
      heading: "第一条 性质与用途",
      body: "「憋尿挑战」是一项在线模拟娱乐。页面中的饮水安排、尿量估算、计时、转盘及惩罚清单均为虚拟规则，仅用于游戏流程。上述内容不构成医疗建议、诊断、治疗、训练方案、合同要约或任何具有强制力的指令，亦不得替代执业医师或其他专业人士的意见。",
    },
    {
      heading: "第二条 年龄与行为能力",
      body: "您确认：您已年满十八周岁，具有完全民事行为能力，并基于本人真实意愿使用本页面。未成年人不得使用本页面。",
    },
    {
      heading: "第三条 健康风险",
      body: "长时间憋尿及短时间内大量饮水可能引起不适，并可能对泌尿系统、肾功能、心血管系统及其他身体状况造成风险。如您有泌尿系统疾病、肾功能异常、心血管疾病、妊娠、近期手术史，或存在其他不宜长时间憋尿或大量饮水的情形，请勿使用本页面，亦请勿依据页面内容进行任何真实操作。如出现疼痛、头晕、恶心、血尿或其他异常，应立即停止并寻求医疗帮助。本页面不提供紧急救助或医疗中止服务。",
    },
    {
      heading: "第四条 自愿使用与责任承担",
      body: "是否饮水、憋尿、执行转盘结果或惩罚清单，完全由您自行决定。因使用本页面、依据页面内容行动或不行动而产生的任何人身损害、健康后果、财产损失、精神损害或其他责任，均由您自行承担。在法律允许的最大范围内，页面提供方不对上述后果承担任何责任。",
    },
    {
      heading: "第五条 游戏规则说明",
      body: "进入对局后，中途如厕、漏尿或选择认输，均视为该局失败。失败后页面将展示惩罚清单。该清单属于游戏内容，不具有强制执行力。您仍须自行判断是否以及如何行动，并自行承担相应后果。",
    },
    {
      heading: "第六条 其他",
      body: "本声明构成您使用本页面的前提条件。页面提供方可修订本声明；修订后继续使用即视为接受修订后的条款。",
    },
  ],
  checkbox: "本人确认已年满十八周岁，已阅读并同意本免责声明的全部条款。",
  accept: "同意并继续",
}

export const LOBBY_DIFFICULTY_HINT = "毫升是开始计时的尿量，不是喝多少。分钟是到线后要撑多久，不是整局时长。"

export const RULES = [
  {
    title: "怎么过",
    items: [
      "按表喝水。到点尽快喝完。尿量到线后计时，撑满就算过。",
      "地狱还要等产尿速度掉到本局高峰一半。",
      "转盘出来就转。",
    ],
  },
  {
    title: "转盘",
    items: [
      "奖：少喝、少撑、坐下、免转、免罚。",
      "罚：听流水、深蹲、跳、夹腿限制、再喝、多撑。",
      "尿量越大，惩罚格越多。中级以上可做一次全惩罚转盘，换早 3 分钟结束。",
    ],
  },
  {
    title: "认输",
    items: ["去撒尿即认输，然后按清单做。"],
  },
]
