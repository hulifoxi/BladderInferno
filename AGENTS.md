# BladderInferno

Vite + React + TypeScript + Tailwind v4 + shadcn/ui 的静态站点，部署目标是 GitHub Pages。

## 改游戏规则

所有玩法都在 `src/game/`：

- 时间、水量、奖惩条目、弹窗文案：`src/game/constants.ts`
- 转盘 30%/70% 与特殊标记（赦免、跳过奖励、替换惩罚）：`src/game/wheel.ts`
- 回合推进、喝水、奖惩效果、胜负：`src/game/reducer.ts`

不要把规则散落到 `App.tsx` 或组件里。组件只读取 `GameState` 并 `dispatch` 已有 action。

新增奖惩时：

1. 在 `REWARDS` / `PUNISHMENTS` 加 `{ id, label, kind }`
2. 在 `describePunishment` 或 `applyReward` 写效果
3. 不要改 Canvas 绘制逻辑，除非要改转盘外观

## UI

- shadcn 组件用 CLI 添加：`npx shadcn@latest add <name>`
- 业务组件放 `src/components/`，不要改 `src/components/ui/` 除非升级 shadcn
- 计时与自动旋转在 `src/hooks/useGame.ts`，转盘绘制在 `src/components/WheelCanvas.tsx`

## 部署

`vite.config.ts` 在 `GITHUB_PAGES=true` 时使用 `base: '/BladderInferno/'`。GitHub Actions 工作流会设置该变量并把 `dist/` 发到 Pages。
