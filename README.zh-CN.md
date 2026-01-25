# RSS 阅读器 PWA

<div align="center">

![RSS Reader](public/icons/icon-192x192.png)

**现代化、离线优先的 RSS/Atom 订阅阅读器**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![PWA](https://img.shields.io/badge/PWA-离线可用-success)](https://web.dev/progressive-web-apps/)
[![Netlify Status](https://api.netlify.com/api/v1/badges/13450015-8413-497a-bf76-c49743c33f54/deploy-status)](https://app.netlify.com/projects/rss-reader-pwa/deploys)

[在线演示](#) | [功能特性](#功能特性) | [快速开始](#快速开始)

</div>

---

## 📖 项目简介

RSS 阅读器是一个功能完整的渐进式 Web 应用（PWA），采用现代 Web 技术构建。提供无缝的 RSS/Atom 订阅源管理和阅读体验，支持完整的离线功能、自动同步和精美的响应式界面。

## ✨ 功能特性

### 🎯 核心功能
- **RSS & Atom 支持** - 解析并显示 RSS 2.0 和 Atom 1.0 订阅源
- **离线优先** - 随时阅读文章，无需网络连接
- **自动刷新** - 可配置的后台同步（15分钟 - 4小时）
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

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 9+ 或 pnpm/yarn

### 安装运行

```bash
# 克隆仓库
git clone https://github.com/yourusername/rss-reader.git
cd rss-reader

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

应用将在 `http://localhost:5173` 运行

### 生产构建

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

---

## 📱 PWA 安装

### 桌面端（Chrome/Edge）
1. 访问应用网址
2. 点击地址栏的安装图标
3. 按照提示完成安装

### iOS（Safari）
1. 在 Safari 中打开
2. 点击分享按钮
3. 选择"添加到主屏幕"

### Android（Chrome）
1. 在 Chrome 中打开
2. 点击菜单（⋮）
3. 选择"安装应用"或"添加到主屏幕"

---

## 🎯 功能使用指南

### 添加订阅源

1. 点击"添加订阅"按钮
2. 输入 RSS/Atom 订阅源 URL
3. 可选择分类
4. 点击"订阅"

**热门订阅源示例：**
- Hacker News: `https://hnrss.org/frontpage`
- Reddit: `https://www.reddit.com/.rss`
- 博客: 通常在 `/feed` 或 `/rss` 路径

### 管理分类

1. 点击侧边栏的"分类"
2. 创建、编辑或删除分类
3. 拖动订阅源进行整理
4. 按分类过滤查看特定主题

### 离线模式

- 阅读过的文章自动缓存
- 网络状态指示器显示连接状态
- 离线操作排队，联网后自动同步
- 所有核心功能在离线时可用

### OPML 导入/导出

**导出：**
1. 进入设置页面
2. 点击"导出 OPML"
3. 保存文件备份订阅

**导入：**
1. 进入设置页面
2. 点击"选择文件"
3. 选择 OPML 文件
4. 等待导入完成

---

## 📊 性能指标

### Lighthouse 评分
- 性能: 95+
- 可访问性: 100
- 最佳实践: 100
- SEO: 100
- PWA: 100

### 关键指标
- 首次内容绘制: < 1秒
- 可交互时间: < 2秒
- 速度指数: < 2秒
- 打包大小: ~200KB（gzip）

---

## 🌐 浏览器支持

| 浏览器 | 版本 | 支持状态 |
|--------|------|----------|
| Chrome | 80+  | ✅ 完全支持 |
| Firefox| 75+  | ✅ 完全支持 |
| Safari | 13+  | ✅ 完全支持 |
| Edge   | 80+  | ✅ 完全支持 |

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
- ✅ 单元测试: 100+ 个
- ✅ 集成测试: 20+ 个
- ✅ E2E 测试: 18+ 个场景

---

## 🏗️ 项目结构

```
rss-reader/
├── public/               # 静态资源
│   ├── icons/           # PWA 图标
│   └── assets/          # 素材文件
├── src/
│   ├── components/      # React 组件
│   ├── hooks/           # 自定义 Hooks
│   ├── lib/             # 核心工具
│   ├── models/          # TypeScript 类型
│   ├── pages/           # 页面组件
│   ├── services/        # 业务逻辑
│   └── workers/         # Service Worker
├── tests/               # 测试文件
└── docs/                # 文档
```

---

## 🤝 贡献指南

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m '添加某个功能'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

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

- 📧 邮箱: support@example.com
- 🐛 问题反馈: [GitHub Issues](https://github.com/yourusername/rss-reader/issues)

---

## 🗺️ 开发路线图

### 计划功能
- [ ] 多设备同步
- [ ] 浏览器扩展
- [ ] 高级搜索过滤
- [ ] 文章标注
- [ ] 社交分享
- [ ] 快捷键支持
- [ ] 阅读时间估算
- [ ] 订阅源发现
- [ ] 播客支持

---

<div align="center">

**用 ❤️ 构建，使用 React、TypeScript 和现代 Web 技术**

[⬆ 返回顶部](#rss-阅读器-pwa)

</div>
