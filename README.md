# 憋尿挑战

在线模拟憋尿挑战。仅供娱乐。可部署到 GitHub Pages。

## 本地运行

```bash
npm install
npm run dev
```

浏览器打开提示的地址。加 `?debug=1` 会显示跳时按钮，方便查流程。

## 部署到 GitHub Pages

仓库已包含 `.github/workflows/pages.yml`。首次部署需要：

1. 打开仓库 **Settings → Pages**
2. **Build and deployment → Source** 选 **GitHub Actions**
3. 推送到 `main`

站点地址：`https://hulifoxi.github.io/BladderInferno/`

`vite` 的 `base` 是相对路径 `./`，项目站点和个人站点都能打开。

## 玩法

进门先签模拟声明。之后只有两条路：撑到结束，或认输后按清单受罚。

只喝常温白水。可填体重，用来按公斤缩放喝水量。膀胱感觉阈值不按体重改。

## 技术

Vite + React + TypeScript。规则在 `src/engine/`，界面只读状态、只发 action。
