# 🌐 购物平台 Demo - 公网部署教程

> 本文档包含 **2 套完整方案**，任选其一即可让面试官通过链接在线访问你的项目！

---

# 方案二：Render + Vercel（推荐 ⭐⭐⭐）

**特点**：免费、稳定、速度快、简历里放个链接很专业**

## 📋 准备工作

1. 注册账号（用 GitHub 登录即可，免费）
   - [Vercel](https://vercel.com/signup) — 部署前端
   - [Render](https://dashboard.render.com/register) — 部署后端
2. 一个 **GitHub 账号**（用于托管代码）

---

## 第一步：把代码推送到 GitHub

### 1.1 创建 Git 仓库

打开 PowerShell / CMD，依次执行：

```bash
# 1. 进入项目目录
cd E:\购物系统

# 2. 初始化 Git
git init

# 3. 添加 .gitignore 文件（排除 node_modules 等不需要上传的文件）
echo "node_modules/
dist/
uploads/
.env" > .gitignore

# 4. 提交代码
git add .
git commit -m "feat: 购物平台系统 v1.0"

# 5. 在 GitHub 上创建新仓库（手动去 github.com 创建，名字叫 shopping-platform 或随便取）
```

### 1.2 推送到 GitHub

```bash
# 把下面的 YOUR_USERNAME 替换成你的 GitHub 用户名
git remote add origin https://github.com/YOUR_USERNAME/shopping-platform.git
git branch -M main
git push -u origin main
```

---

## 第二步：部署后端到 Render

### 2.1 打开 Render 控制台

1. 登录 https://dashboard.render.com
2. 点击 **「+ New」** → **「Web Service」**
3. 选择 **「Connect an existing repository」** → 找到你刚推送的仓库 → 点击 **「Connect」**

### 2.2 配置后端服务

填写以下配置：

| 配置项 | 填写内容 |
|--------|----------|
| **Name** | `shopping-api`（或任意名称） |
| **Runtime** | `Node` |
| **Build Command** | （留空即可，因为后端没有构建步骤） |
| **Start Command** | `node server.js` |
| **Instance Type** | 选 **Free**（免费套餐） |

### 2.3 关键设置

往下滚动，找到以下选项并确认：

- **Auto-Deploy**: ✅ 开启（每次 push 自动更新）
- **Public**: ❌ 不勾选（后端API不需要公开访问入口）

点击底部的 **「Create Web Service」** 按钮

### 2.4 获取后端地址

等待约 2-3 分钟部署完成后：
- Render 会给你的服务分配一个 URL，类似：
  ```
  https://shopping-api.onrender.com
  ```

**📝 记下这个地址！** 后面要用到。

### 2.5 验证后端是否正常运行

在浏览器或 Postman 中访问：
```
https://你的render域名/api/products
```
如果返回 JSON 数据就说明成功了 ✅

---

## 第三步：修改前端 API 地址

### 3.1 编辑 api.js

打开 `E:\购物系统\client\src\utils\api.js`，找到：

```javascript
const BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3001'
```

改为：

```javascript
const BASE_URL = 'https://你的render域名'
```

例如（假设你的 Render 域名是 `shopping-api.onrender.com`）：

```javascript
const BASE_URL = 'https://shopping-api.onrender.com'
```

### 3.2 提交更改

```bash
cd E:\购物系统
git add .
git commit -m "fix: 更新API地址为Render生产环境"
git push
```

---

## 第四步：部署前端到 Vercel

### 4.1 打开 Vercel 控制台

1. 登录 https://vercel.com/dashboard
2. 点击 **「Add New...」** → **「Project」**

### 4.2 导入项目

1. 在 Import 列表中选择你的 `shopping-platform` 仓库
2. 如果没看到，点 **「Import Git Repository」** 手动添加
3. 点 **「Import」**

### 4.3 配置项目参数

Vercel 会自动检测到这是一个 Vue/Vite 项目，但我们需要指定正确的前端目录：

| 配置项 | 填写内容 |
|--------|----------|
| **Framework Preset** | 选择 `Vite` |
| **Root Directory** | 改为 `client`（重要！因为前端代码在 client 子目录里） |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### 4.4 设置环境变量（可选）

如果你的 API 地址想用环境变量管理（更专业的方式），可以在 **Environment Variables** 中添加：

| Key | Value |
|-----|-------|
| `VITE_API_BASE` | `https://你的render域名` |

但因为我们已经在 `api.js` 里硬编码了地址，这步可以跳过。

### 4.5 部署

点击 **「Deploy」** 按钮！等待约 1-2 分钟。

### 4.6 获取前端地址

部署成功后，Vercel 会给你分配一个 URL，类似：
```
https://shopping-platform.vercel.app
```

**这就是你要发给面试官的链接！** 🎉

---

## 第五步：测试验证

用浏览器打开你的 Vercel 地址，测试以下流程：

1. ✅ 用 admin/123456 登录管理员系统
2. ✅ 添加商品 + 上传图片
3. ✅ 切换到 user1 用户
4. ✅ 浏览商品 → 加购 → 结算 → 下单支付
5. ✅ 查看订单历史 → 再次购买

全部通过的话，就可以把这个链接发给面试官了！

---

## 🔧 Render 免费版注意事项

| 问题 | 解决方案 |
|------|----------|
| 后端首次启动较慢（冷启动） | 免费版特性，正常现象，等30秒左右 |
| 服务休眠（15分钟无请求会自动停止） | 有请求时自动唤醒，面试前先自己访问一次预热 |
| 免费额度有限 | 个人Demo完全够用 |

---

# 方案三：Railway + GitHub Pages（零成本长期在线）

**特点**：同样免费、Railway部署体验好、GitHub Pages有个人品牌加成**

## 📋 准备工作

1. 注册账号
   - [Railway](https://railway.app) — 部署后端（支持 GitHub 登录）
   - [GitHub](https://github.com) — Pages 部署前端

---

## 第一步：后端部署到 Railway

### 1.1 创建 Railway 项目

1. 登录 https://railway.app/dashboard
2. 点击 **「+ New Project」** → **「Deploy from GitHub repo」**
3. 授权 GitHub 并选择你的 `shopping-platform` 仓库
4. 点击 **「Deploy Now」**

Railway 会自动检测 Node.js 项目，默认运行 `node server.js`

### 1.2 配置源代码路径

Railway 默认从根目录部署，但你的 `server.js` 在 `server/` 子目录中。有两种方式处理：

#### 方式A（推荐）：调整 Railway 的 Source Code Path

1. 在 Railway 项目设置中，找到 **Source Code Path**
2. 改为：`server`

#### 方式B：在根目录加 package.json

在项目根目录 `E:\购物系统\package.json` 创建：

```json
{
  "name": "shopping-platform",
  "version": "1.0.0",
  "scripts": {
    "start": "node server/server.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3",
    "uuid": "^9.0.0",
    "multer": "^1.4.5-lts.1"
  }
}
```

然后在 Railway 的 Start Command 设为：`node server/server.js`

### 1.3 获取 Railway 后端地址

部署成功后，Railway 会自动生成一个公开 URL，格式如：
```
https://xxx.up.railway.app
```

**记下这个地址**，后面配置前端要用。

### 1.4 验证后端

访问：`https://你的railway域名/api/products`
返回 JSON 数据即成功 ✅

---

## 第二步：前端部署到 GitHub Pages

### 2.1 修改 API 地址

和方案二一样，编辑 `E:\购物系统\client\src\utils\api.js`：

```javascript
const BASE_URL = 'https://你的railway域名'
```

### 2.2 修改 Vite 构建配置

编辑 `E:\购物系统\client\vite.config.js`，添加 base 路径：

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/shopping-platform/',  // ← 改成你的仓库名
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
```

### 2.3 添加 gh-pages 部署脚本

在 `E:\购物系统\client\package.json` 的 scripts 中添加：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "gh-pages -d dist"
  }
}
```

### 2.4 安装部署工具 & 构建 & 部署

```bash
cd E:\购物系统\client

# 安装 gh-pages 工具
npm install --save-dev gh-pages

# 构建
npm run build

# 部署到 GitHub Pages
npm run deploy
```

执行完后，会把 `dist` 目录的内容推送到仓库的 `gh-pages` 分支。

### 2.5 开启 GitHub Pages

1. 打开你的 GitHub 仓库页面
2. 进入 **Settings** → 左侧菜单找 **Pages**
3. Source 选择 ** Deploy from a branch **
4. Branch 选择 `gh-pages` / `(root)` 
5. 点击 **Save**

等待约 1-2 分钟，GitHub Pages 就会生效！

### 2.6 获取前端地址

GitHub Pages 地址格式为：
```
https://YOUR_GITHUB_USERNAME.github.io/shopping-platform/
```

**这就是最终链接！** 发给面试官就能直接访问了 🎉

---

# 🎯 方案对比

| 对比项 | 方案二 (Render + Vercel) | 方案三 (Railway + GitHub Pages) |
|--------|-------------------------|-------------------------------|
| **速度** | ⭐⭐⭐ 全球CDN加速 | ⭐⭐ 国内访问稍慢 |
| **稳定性** | ⭐⭐⭐ 很稳定 | ⭐⭐⭐ 很稳定 |
| **免费额度** | 每月750小时够用 | 每月$5免费额度够用 |
| **自定义域名** | 支持 | 支持 |
| **自动部署** | push代码自动更新 | 需要手动跑 deploy 命令 |
| **简历加分项** | 专业 | 有GitHub个人品牌感 |
| **上手难度** | ⭐⭐ 简单 | ⭐⭐⭐ 稍复杂 |
| **推荐场景** | 快速上线、面试展示 | 长期维护、作品集展示 |

---

# 💡 面试演示话术参考

> "这个项目采用了前后端分离架构，前端使用 Vue3 + Vite 构建，
> 后端基于 Express 实现 RESTful API。我已经将项目部署到了云端，
> 您可以随时通过这个链接在线体验完整功能..."

---

# 🚨 常见问题 FAQ

**Q1：部署后图片不显示？**
> A：图片存储在后端服务器上。如果是 Render/Railway 免费版，文件系统是临时的（重启后会丢失）。建议后续改用云存储（如阿里云OSS/腾讯云COS）。现阶段Demo演示不受影响。

**Q2：跨域问题怎么办？**
> A：后端 `server.js` 已经配置了 CORS（`app.use(cors())`），一般不会有跨域问题。如果遇到，检查浏览器控制台的报错信息。

**Q3：域名太难记怎么办？**
> A：Vercel 和 GitHub Pages 都支持绑定自定义域名，你可以买个 `.com` 或 `.top` 域名绑定上去。

**Q4：如何确认服务是否在线？**
> A：访问 `你的域名/api/products`，返回 JSON 数据就说明在线。如果报错可能是服务还在启动（免费版有冷启动延迟）。
