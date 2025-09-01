# Bridge UTXO - Bitcoin Multisig Visualization

这是一个比特币 UTXO 可视化项目，展示了多签配置的交互式气泡图。

## 功能特性

- 🔵 **实时 UTXO 可视化**: 动态气泡图显示比特币 UTXO
- 🔐 **多签配置**: 每个 UTXO 都使用 2-2 多签 P2WSH 脚本
- 📊 **统计信息**: 显示总 UTXO 数量、唯一用户数、总金额等
- 🎨 **颜色编码**: 根据金额大小使用不同颜色
- 📱 **响应式设计**: 适配不同屏幕尺寸
- ⚡ **物理模拟**: 气泡具有碰撞和边界反弹效果

## 安装要求

在运行此项目之前，您需要安装以下软件：

### 1. 安装 Node.js

请访问 [Node.js 官网](https://nodejs.org/) 下载并安装最新的 LTS 版本（推荐 18.x 或更高版本）。

安装完成后，在命令行中验证安装：

```bash
node --version
npm --version
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

或者使用：

```bash
npm start
```

### 3. 访问应用

开发服务器启动后，在浏览器中访问：

```
http://localhost:3000
```

## 项目结构

```
BridgeUtxo/
├── src/
│   ├── components/
│   │   └── BitcoinUTXOBubbles.jsx    # 主要组件
│   ├── App.jsx                       # 应用入口组件
│   ├── main.jsx                      # React 入口文件
│   └── index.css                     # 样式文件
├── public/
├── index.html                        # HTML 模板
├── package.json                      # 项目配置和依赖
├── vite.config.js                    # Vite 配置
├── tailwind.config.js                # Tailwind CSS 配置
└── postcss.config.js                 # PostCSS 配置
```

## 技术栈

- **React 18**: 前端框架
- **Vite**: 构建工具和开发服务器
- **Tailwind CSS**: CSS 框架
- **Lucide React**: 图标库
- **SVG**: 用于绘制气泡图

## 使用说明

1. **查看 UTXO**: 页面加载后会自动生成 50 个模拟的 UTXO 气泡
2. **点击气泡**: 点击任意气泡查看详细信息，包括：
   - 金额和交易信息
   - 多签配置详情
   - 签名者信息
3. **刷新数据**: 点击右上角的"Refresh Data"按钮生成新的 UTXO 数据
4. **颜色说明**:
   - 🔵 蓝色: < 0.01 BTC
   - 🟢 绿色: 0.01 - 0.1 BTC
   - 🟡 黄色: 0.1 - 1 BTC
   - 🔴 红色: 1 - 10 BTC
   - 🟣 紫色: > 10 BTC

## 多签架构

- **签名方案**: 2-2 多签（需要两个签名）
- **脚本类型**: P2WSH (Pay to Witness Script Hash)
- **签名者**: 用户 + 委员会
- **安全机制**: 每笔交易都需要用户私钥 + 委员会共识

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 故障排除

### 常见问题

1. **端口被占用**: 如果 3000 端口被占用，Vite 会自动使用下一个可用端口
2. **依赖安装失败**: 尝试删除 `node_modules` 文件夹和 `package-lock.json`，然后重新运行 `npm install`
3. **样式不生效**: 确保 Tailwind CSS 配置正确，检查 `tailwind.config.js` 文件

### 系统要求

- Node.js 16.x 或更高版本
- npm 7.x 或更高版本
- 现代浏览器（Chrome, Firefox, Safari, Edge）

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

