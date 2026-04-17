# 🛒 购物平台 Demo - 部署指南

## 一、本地启动（面试现场演示）

**双击 `启动服务.bat`** 即可一键运行，无需任何配置！

| 服务 | 地址 |
|------|------|
| 前端 | http://localhost:5173 |
| 后端API | http://localhost:3001 |

### 测试账号
- **管理员**：admin / 123456（管理商品、查看订单）
- **普通用户**：user1 / 123456（浏览、购物车、下单）

---

## 二、远程访问方式（发链接给面试官）

### 方式1：Cloudflare Tunnel（推荐，免费免注册）

在命令行中执行：
```bash
npx cloudflared tunnel --url http://localhost:5173
```
会输出一个类似 `https://xxx-xxx-xxx.trycloudflare.com` 的链接，直接发给对方即可。

> ⚠️ 注意：前端页面需要调用后端API。如果只暴露前端端口，后端API可能无法从外部访问。
> 解决方案：需要同时映射后端端口3001，或者将前端打包为静态文件后部署到免费托管平台。

---

### 方式2：Vercel 部署（推荐用于长期展示）

**步骤1：修改前端API地址**

编辑 `E:\购物系统\client\src\utils\api.js`，将 `BASE_URL` 改为你后端实际地址。

如果前后端都部署到 Vercel/Netlify，建议使用免费的云服务作为后端：

**方案A：用 Railway / Render 免费部署后端**

1. 注册 https://railway.app 或 https://render.com
2. 上传 `server` 文件夹内容
3. 获得一个公网URL如 `https://xxx.up.railway.app`
4. 修改前端的 API 地址指向该 URL

**方案B：Vercel + Render 组合**

```bash
# 1. 前端部署到 Vercel
cd E:\购物系统\client
npx vercel

# 2. 后端部署到 Render
# 在 render.com 创建新服务 → 连接 GitHub 或直接部署
# 获得 API 地址后更新前端 api.js 的 BASE_URL
```

---

### 方式3：GitHub Pages + 免费后端（零成本长期在线）

1. 将前端构建后的文件推送到 GitHub Pages
2. 后端部署到 Render/Railway（免费套餐）
3. 前端API地址指向后端公网URL

---

## 三、面试演示要点

### 功能清单

| 模块 | 演示操作 | 亮点说明 |
|------|---------|----------|
| 登录系统 | 切换管理员/用户角色 | 完整的RBAC权限控制 |
| 商品管理 | 添加商品→上传图片→上下架→改库存 | CRUD + 图片上传 |
| 用户浏览 | 看到实时库存和图片展示 | 数据联动 |
| 购物车 | 加购→调数量→删除商品 | 库存校验防超卖 |
| 结算流程 | 选自取/外送(填地址)→选支付方式→确认支付 | O2O完整链路 |
| 订单管理 | 查看历史订单→一键再次购买 | 用户体验闭环 |

### 技术亮点（面试说辞）

- **前后端分离架构**：Vue3 + Express，标准企业级开发模式
- **RESTful API设计**：规范的接口定义，可扩展性强
- **JWT认证鉴权**：角色权限分离（管理员/普通用户）
- **文件上传处理**：multer中间件实现图片上传与静态资源服务
- **库存并发控制**：购买时校验库存防止超卖
- **O2O业务逻辑**：自取+外送双模式，地址管理
- **模拟支付流程**：完整的支付状态流转

---

## 四、项目结构

```
E:\购物系统\
├── 启动服务.bat          ← 双击即可运行
├── client/               # Vue3 前端
│   ├── src/
│   │   ├── views/        # 页面组件
│   │   ├── components/   # 公共组件
│   │   ├── router/       # 路由配置
│   │   └── utils/api.js  # API封装
│   └── dist/             # 构建产物
├── server/
│   ├── server.js         # Express后端（含所有API）
│   └── uploads/products/ # 图片存储目录
└── README.md             # 本文件
```

## 五、常见问题

**Q：双击 bat 文件没反应？**
A：右键 → 以管理员身份运行，或检查是否安装了 Node.js

**Q：端口被占用？**
A：修改 `server.js` 最后的端口号，以及 `client/vite.config.js`

**Q：图片上传失败？**
A：确认 `server/uploads/products/` 目录存在且有写入权限
