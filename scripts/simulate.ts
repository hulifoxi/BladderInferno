import { estimateBladderMl, holdStartMl, urineRateAt } from "../src/engine/physiology.ts"
import { DIFFICULTY_ORDER, DIFFICULTY_SPECS, dosePlan } from "../src/engine/schedule.ts"

for (const id of DIFFICULTY_ORDER) {
  const drinks = dosePlan(id, 70).map((d) => ({ atSec: d.atSec, ml: d.ml }))
  const line = holdStartMl(id)
  let holdAt: number | null = null
  console.log(`\n== ${DIFFICULTY_SPECS[id].label}  计划 ${drinks.reduce((s, d) => s + d.ml, 0)} ml ==`)
  for (let min = 0; min <= 180; min += 5) {
    const t = min * 60
    const ml = estimateBladderMl(drinks, t, 0)
    const rate = urineRateAt(drinks, t)
    if (holdAt == null && ml >= line && drinks.length > 0) holdAt = min
    if (min % 10 === 0 || holdAt === min) {
      console.log(
        `${String(min).padStart(3)} min  ${String(Math.round(ml)).padStart(4)} ml  ${rate.toFixed(1)} ml/min${holdAt === min ? "  <- 锁闸" : ""}`,
      )
    }
  }
  console.log(`锁闸约 ${holdAt ?? "?"} 分钟（门槛 ${line} ml）`)
}
