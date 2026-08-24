# BladderInferno

Vite + React + TypeScript + Tailwind v4 + shadcn/ui 静态站点，部署到 GitHub Pages。

## 改游戏规则

所有玩法都在 `src/engine/`：

- 生理阈值与产尿：`physiology.ts`
- 喝水时间表与难度：`schedule.ts`
- 回合、喝水、撑、胜负：`reducer.ts`
- 转盘：`wheel.ts`
- 界面文案：`copy.ts`
- 派生数据：`selectors.ts`
- 本地存档：`persist.ts`

不要把规则散落到组件里。组件只读取 `GameState` 并 `dispatch` 已有 action。

新增转盘格或惩罚时：先改 `wheel.ts` / `copy.ts`，再视需要改 `reducer.ts`。

## UI

- shadcn 组件用 CLI 添加：`npx shadcn@latest add <name>`
- 页面在 `src/screens/`，业务组件在 `src/components/`
- 计时与存档副作用在 `src/hooks/useGame.ts`

## 校验

```bash
npm run sim
npm run build
```

`?debug=1` 会显示跳时按钮。

## 部署

`vite.config.ts` 的 `base` 是 `./`。推送到 `main` 后，`.github/workflows/pages.yml` 会发布到 GitHub Pages。
