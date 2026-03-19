# RSS 阅读器 PWA 🦞

<div align="center">

![RSS Reader](public/icons/icon-192x192.png)

**现代化、离线优先的 RSS/Atom 订阅阅读器**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![PWA](https://img.shields.io/badge/PWA-离线可用-success)](https://web.dev/progressive-web-apps/)
[![CI](https://github.com/chiga0/rss-reader/actions/workflows/ci.yml/badge.svg)](https://github.com/chiga0/rss-reader/actions/workflows/ci.yml)

[在线演示](https://reader.chigao.site/) · [功能特性](#-功能特性) · [快速开始](#-快速开始) · [文档](#-文档)

</div>

---

## 📖 项目简介

RSS 阅读器是一个功能完整的渐进式 Web 应用（PWA），采用现代 Web 技术构建。提供无缝的 RSS/Atom 订阅源管理和阅读体验，支持完整的离线功能、自动同步和精美的响应式界面。

> 💡 **为什么需要这个应用？** 在没有算法和广告干扰的情况下，关注你喜欢的博客、新闻网站和内容创作者。你掌控阅读内容和时间。

## 🚀 快速开始

```bash
# 克隆仓库
git clone https://github.com/chiga0/rss-reader.git
cd rss-reader

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开 http://localhost:5173 查看应用！

---

## ✨ 功能特性

### 🎯 核心功能
- **RSS & Atom 支持** - 解析并显示 RSS 2.0 和 Atom 1.0 订阅源
- **离线优先** - 随时阅读文章，无需网络连接
- **自动刷新** - 可配置的后台同步（15 分钟 - 4 小时）
- **智能缓存** - 智能内容缓存与自动清理
- **OPML 导入/导出** - 无缝迁移订阅源

### 🎨 用户体验
- **深色/浅色主题** - 系统主题感知，支持手动切换
- **响应式设计** - 完美适配手机、平板和桌面
- **分类管理** - 将订阅源组织到自定义分类
- **收藏与历史** - 保存重要文章并跟踪阅读历史
- **搜索与过滤** - 按分类或状态快速查找文章

### 🚀 PWA 特性
- **可安装** - 添加到任何设备的主屏幕
- **离线支持** - 无网络时完整功能可用
- **后台同步** - 后台自动更新订阅源
- **推送通知** - 新文章通知（可选）
- **快速轻量** - 优化性能，体积小巧

---

## 🛠️ 技术栈

- **前端框架**: React 18
- **开发语言**: TypeScript 5.3
- **构建工具**: Vite 5
- **样式方案**: Tailwind CSS 4.0
- **状态管理**: Zustand
- **本地存储**: IndexedDB
- **离线支持**: Workbox Service Worker
- **测试框架**: Vitest + Playwright

---

## 📦 安装

### 环境要求

- **Node.js** 18+ 
- **npm** 9+ (或 pnpm/yarn)

### 验证安装

```bash
node --version  # 应该是 v18 或更高
npm --version   # 应该是 v9 或更高
```

---

## 🔧 配置

### 环境变量

在根目录创建 `.env` 或 `.env.local` 文件：

```env
# AI 集成（可选）
AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=你的_api_密钥
AI_MODEL=gpt-4o-mini

# 功能开关
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_PUSH_NOTIFICATIONS=true

# 开发
VITE_DEBUG=false
```

> ⚠️ **安全提示**：不要将 `.env.local` 提交到版本控制，已添加到 `.gitignore`。

---

## 🧪 测试

```bash
# 运行所有测试
npm run test:run

# 单元测试
npm run test:unit

# 集成测试
npm run test:integration

# E2E 测试
npm run test:e2e
```

**测试覆盖率：**
- ✅ 143/143 测试通过
- ✅ 单元测试：100+ 个
- ✅ 集成测试：20+ 个
- ✅ E2E 测试：18+ 个场景

---

## 🐛 故障排查

### 常见问题

**端口 5173 已被占用：**
```bash
# 终止进程或使用不同端口
npm run dev -- --port 3000
```

**依赖安装失败：**
```bash
# 清除缓存并重新安装
rm -rf node_modules package-lock.json
npm install
```

**PWA 不工作：**
- 确保使用 HTTPS（service worker 必需）
- 检查浏览器控制台的错误
- 尝试在 DevTools 中注销 service worker

**构建失败：**
```bash
# 清除构建缓存
rm -rf dist node_modules/.vite
npm run build
```

### 已知限制

- [ ]  favicon 可能不会立即更新（浏览器缓存）
- [ ] 某些非标准 RSS 订阅源可能无法正确解析
- [ ] iOS Safari：后台同步需要定期打开应用

查看 [Issues](https://github.com/chiga0/rss-reader/issues) 获取完整列表。

---

## 🌐 浏览器支持

| 浏览器 | 版本 | 支持状态 |
|--------|------|----------|
| Chrome | 80+  | ✅ 完全支持 |
| Firefox| 75+  | ✅ 完全支持 |
| Safari | 13+  | ✅ 完全支持 |
| Edge   | 80+  | ✅ 完全支持 |

---

## 🤝 贡献指南

欢迎贡献！🎉

### 如何贡献

1. **Fork** 仓库
2. **创建分支** (`git checkout -b feature/amazing-feature`)
3. **提交更改** (`git commit -m '添加某个功能'`)
4. **推送** (`git push origin feature/amazing-feature`)
5. **创建 Pull Request**

### 开发规范

- ✅ 为新功能编写测试
- ✅ 遵循现有代码风格（ESLint + Prettier）
- ✅ 根据需要更新文档
- ✅ 提交前确保所有测试通过

```bash
# 提交前运行所有检查
npm run type-check
npm run lint
npm run test:run
```

### 需要帮助？

- 💬 通过 Issue 提问
- 📖 查看现有 Issue 了解已知问题
- 📝 阅读 [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) 了解项目详情

---

## 📝 更新日志

### 版本 1.0.0 (2026-01-25)
- ✨ 首次发布
- ✅ RSS/Atom 订阅源支持
- ✅ 离线优先架构
- ✅ 自动刷新功能
- ✅ 分类管理
- ✅ OPML 导入/导出
- ✅ 主题定制
- ✅ 收藏与历史
- ✅ 完整 PWA 支持

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 🙏 致谢

- RSS 2.0 规范
- Atom 1.0 规范
- React 文档
- Tailwind CSS
- Web.dev PWA 指南

---

## 📞 支持

- 🐛 **Bug 报告**: [GitHub Issues](https://github.com/chiga0/rss-reader/issues)
- 💡 **功能建议**: [GitHub Issues](https://github.com/chiga0/rss-reader/issues)
- 📖 **文档**: 查看 `docs/` 文件夹和 [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)

---

<div align="center">

**用 ❤️ 构建，使用 React、TypeScript 和现代 Web 技术**

[⬆ 返回顶部](#rss-阅读器-pwa)

</div>
