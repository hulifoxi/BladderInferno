# 膀胱炼狱 · 极限尿压 - 转盘版

Vite + React + TypeScript + shadcn/ui 重写版。规则与原先单文件游戏一致，可部署到 GitHub Pages。

玩家通过旋转随机奖惩转盘，在累积尿意压力下完成多轮挑战。内容包含成人向模拟与惩罚描述，请仅在安全、私密、自愿的前提下使用。

## 本地开发

```bash
npm install
npm run dev
```

浏览器打开终端提示的地址即可。

```bash
npm run build
npm run preview
```

生产构建输出在 `dist/`。

## GitHub Pages

仓库已包含 `.github/workflows/deploy.yml`。首次部署需要：

1. 打开仓库 **Settings → Pages**
2. **Build and deployment → Source** 选 **GitHub Actions**
3. 推送到 `main`（或手动 Run workflow）

站点地址：`https://hulifoxi.github.io/BladderInferno/`

## 给后续维护用的结构

游戏规则在 `src/game/`，不要写进 React 组件里：

| 路径 | 职责 |
| --- | --- |
| `src/game/constants.ts` | 时间、水量、奖惩文案、免责声明 |
| `src/game/wheel.ts` | 奖励/惩罚转盘抽取 |
| `src/game/reducer.ts` | 状态机（回合、计时、胜负、奖惩效果） |
| `src/hooks/useGame.ts` | 计时器与转盘动画副作用 |
| `src/components/` | 界面；`ui/` 为 shadcn 组件 |

改玩法先改 `src/game/`，再视需要改 UI。

## 许可证

GPL-3.0
