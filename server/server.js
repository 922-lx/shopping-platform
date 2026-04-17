const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const multer  = require('multer');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// ========== 图片上传配置（multer）==========
// 确保上传目录存在
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads', 'products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${uuidv4().slice(0,8)}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 最大5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('只支持图片文件(jpg/png/gif/webp)'));
  }
});

// 静态资源服务 - 提供上传的图片访问
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ========== 内存数据存储 ==========
let users = [
  { id: '1', username: 'admin', password: '$2a$10$XqjvXiDr89C4GDTOtY53We/Hw3QUogNQrHb.Lu3.VtuePhtcokH2e', role: 'admin', nickname: '管理员' },
  { id: '2', username: 'user1', password: '$2a$10$XqjvXiDr89C4GDTOtY53We/Hw3QUogNQrHb.Lu3.VtuePhtcokH2e', role: 'user', nickname: '普通用户' }
];

let products = [
  { id: 'p1', name: '苹果 iPhone 15 Pro', price: 7999, stock: 50, image: '', category: '电子产品', status: 'active', description: '最新款iPhone，A17 Pro芯片' },
  { id: 'p2', name: '华为 Mate 60 Pro', price: 6999, stock: 30, image: '', category: '电子产品', status: 'active', description: '国产旗舰手机' },
  { id: 'p3', name: 'MacBook Pro 14寸 M3', price: 14999, stock: 20, image: '', category: '电脑', status: 'active', description: '苹果笔记本电脑' },
  { id: 'p4', name: 'AirPods Pro 2代', price: 1899, stock: 100, image: '', category: '配件', status: 'active', description: '降噪耳机' },
  { id: 'p5', name: '小米平板6 Pro', price: 2499, stock: 0, image: '', category: '平板', status: 'inactive', description: '高性价比平板' },
  { id: 'p6', name: '索尼 WH-1000XM5', price: 2499, stock: 40, image: '', category: '配件', status: 'active', description: '顶级降噪头戴耳机' },
];

let orders = [];
let carts = {};

// ========== 中间件：验证Token（简化版） ==========
const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ code: 401, message: '未登录' });
  const user = users.find(u => u.id === token);
  if (!user) return res.status(401).json({ code: 401, message: 'token无效' });
  req.user = user;
  next();
};

// ========== 用户相关API ==========

// 注册
app.post('/api/register', (req, res) => {
  const { username, password, nickname } = req.body;
  if (!username || !password) {
    return res.json({ code: 400, message: '用户名和密码不能为空' });
  }
  if (users.find(u => u.username === username)) {
    return res.json({ code: 400, message: '用户名已存在' });
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = { id: uuidv4(), username, password: hashedPassword, role: 'user', nickname: nickname || username };
  users.push(newUser);
  res.json({ code: 200, data: { id: newUser.id, username: newUser.username, role: newUser.role, nickname: newUser.nickname }, message: '注册成功' });
});

// 登录
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.json({ code: 400, message: '用户名或密码错误' });
  }
  res.json({ code: 200, data: { token: user.id, id: user.id, username: user.username, role: user.role, nickname: user.nickname }, message: '登录成功' });
});

// 获取当前用户信息
app.get('/api/user/info', authenticate, (req, res) => {
  res.json({ code: 200, data: { id: req.user.id, username: req.user.username, role: req.user.role, nickname: req.user.nickname } });
});

// ========== 商品相关API ==========

// 获取商品列表
app.get('/api/products', (req, res) => {
  const showAll = req.query.all === 'true';
  let list = products;
  if (!showAll) {
    list = products.filter(p => p.status === 'active' && p.stock > 0);
  }
  res.json({ code: 200, data: list, total: list.length });
});

// 获取单个商品
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.json({ code: 404, message: '商品不存在' });
  res.json({ code: 200, data: product });
});

// 图片上传接口
app.post('/api/upload/image', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ code: 403, message: '无权限' });
  upload.single('image')(req, res, (err) => {
    if (err) return res.json({ code: 400, message: err.message === "File too large" ? '图片大小不能超过5MB' : err.message || '图片上传失败' });
    if (!req.file) return res.json({ code: 400, message: '请选择要上传的图片' });
    const imageUrl = `/uploads/products/${req.file.filename}`;
    res.json({ code: 200, data: { url: imageUrl }, message: '图片上传成功' });
  });
});

// 添加商品（管理员）
app.post('/api/admin/products', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ code: 403, message: '无权限' });
  const { name, price, stock, category, description, image } = req.body;
  if (!name || !price) return res.json({ code: 400, message: '商品名称和价格不能为空' });
  const newProduct = { id: 'p' + uuidv4().slice(0, 8), name, price: Number(price), stock: Number(stock) || 0, image: image || '', category: category || '其他', description: description || '', status: 'active' };
  products.push(newProduct);
  res.json({ code: 200, data: newProduct, message: '添加成功' });
});

// 编辑商品（管理员）
app.put('/api/admin/products/:id', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ code: 403, message: '无权限' });
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.json({ code: 404, message: '商品不存在' });
  const { name, price, stock, category, description, status, image } = req.body;
  if (name !== undefined) products[idx].name = name;
  if (price !== undefined) products[idx].price = Number(price);
  if (stock !== undefined) products[idx].stock = Number(stock);
  if (category !== undefined) products[idx].category = category;
  if (description !== undefined) products[idx].description = description;
  if (status !== undefined) products[idx].status = status;
  if (image !== undefined) products[idx].image = image;
  res.json({ code: 200, data: products[idx], message: '更新成功' });
});

// 删除商品（管理员）
app.delete('/api/admin/products/:id', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ code: 403, message: '无权限' });
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.json({ code: 404, message: '商品不存在' });
  products.splice(idx, 1);
  res.json({ code: 200, message: '删除成功' });
});

// 上架/下架（管理员）
app.patch('/api/admin/products/:id/status', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ code: 403, message: '无权限' });
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.json({ code: 404, message: '商品不存在' });
  product.status = req.body.status || (product.status === 'active' ? 'inactive' : 'active');
  res.json({ code: 200, data: product, message: `已${product.status === 'active' ? '上架' : '下架'}` });
});

// ========== 购物车相关API ==========

// 获取购物车
app.get('/api/cart', authenticate, (req, res) => {
  const cartItems = carts[req.user.id] || [];
  // 关联商品信息
  const itemsWithProducts = cartItems.map(item => {
    const product = products.find(p => p.id === item.productId);
    return { ...item, product: product || null };
  }).filter(item => item.product);
  res.json({ code: 200, data: itemsWithProducts });
});

// 添加到购物车
app.post('/api/cart', authenticate, (req, res) => {
  const { productId, quantity } = req.body;
  const product = products.find(p => p.id === productId);
  if (!product) return res.json({ code: 404, message: '商品不存在' });
  if (product.status !== 'active') return res.json({ code: 400, message: '该商品已下架' });

  if (!carts[req.user.id]) carts[req.user.id] = [];
  const existingItem = carts[req.user.id].find(item => item.productId === productId);

  if (existingItem) {
    const newQty = existingItem.quantity + (quantity || 1);
    if (newQty > product.stock) return res.json({ code: 400, message: `库存不足，剩余 ${product.stock} 件` });
    existingItem.quantity = newQty;
  } else {
    const qty = quantity || 1;
    if (qty > product.stock) return res.json({ code: 400, message: `库存不足，剩余 ${product.stock} 件` });
    carts[req.user.id].push({ id: uuidv4(), productId, quantity: qty });
  }
  res.json({ code: 200, message: '添加成功' });
});

// 更新购物车数量
app.put('/api/cart/:id', authenticate, (req, res) => {
  const cartItems = carts[req.user.id] || [];
  const item = cartItems.find(i => i.id === req.params.id);
  if (!item) return res.json({ code: 404, message: '购物车项不存在' });
  const product = products.find(p => p.id === item.productId);
  const newQty = Number(req.body.quantity);
  if (newQty > product.stock) return res.json({ code: 400, message: `库存不足，剩余 ${product.stock} 件` });
  if (newQty <= 0) {
    carts[req.user.id] = cartItems.filter(i => i.id !== req.params.id);
  } else {
    item.quantity = newQty;
  }
  res.json({ code: 200, message: '更新成功' });
});

// 删除购物车项
app.delete('/api/cart/:id', authenticate, (req, res) => {
  if (carts[req.user.id]) {
    carts[req.user.id] = carts[req.user.id].filter(i => i.id !== req.params.id);
  }
  res.json({ code: 200, message: '删除成功' });
});

// 清空购物车
app.delete('/api/cart', authenticate, (req, res) => {
  carts[req.user.id] = [];
  res.json({ code: 200, message: '购物车已清空' });
});

// ========== 订单相关API ==========

// 创建订单
app.post('/api/orders', authenticate, (req, res) => {
  const { deliveryType, address, paymentMethod } = req.body;
  const cartItems = carts[req.user.id] || [];

  if (cartItems.length === 0) return res.json({ code: 400, message: '购物车为空' });
  if (deliveryType === 'delivery' && !address) return res.json({ code: 400, message: '请填写配送地址' });

  // 验证库存并锁定
  const orderItems = [];
  for (const item of cartItems) {
    const product = products.find(p => p.id === item.productId);
    if (!product || product.status !== 'active') return res.json({ code: 400, message: `${product?.name || '某'}商品不可用` });
    if (item.quantity > product.stock) return res.json({ code: 400, message: `${product.name} 库存不足` });
    orderItems.push({
      productId: product.id,
      productName: product.name,
      productImage: product.image || '',
      price: product.price,
      quantity: item.quantity,
      subtotal: product.price * item.quantity
    });
    // 扣减库存
    product.stock -= item.quantity;
  }

  const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);

  // 创建待支付订单
  const order = {
    id: 'O' + Date.now(),
    userId: req.user.id,
    userName: req.user.nickname || req.user.username,
    items: orderItems,
    totalAmount,
    deliveryType, // pickup / delivery
    address: address || '',
    paymentMethod: paymentMethod || '',
    status: 'pending', // pending -> paid -> completed
    createdAt: new Date().toISOString()
  };

  orders.push(order);
  // 清空购物车
  carts[req.user.id] = [];

  res.json({ code: 200, data: order, message: '订单创建成功' });
});

// 支付订单
app.post('/api/orders/:id/pay', authenticate, (req, res) => {
  const order = orders.find(o => o.id === req.params.id && o.userId === req.user.id);
  if (!order) return res.json({ code: 404, message: '订单不存在' });
  if (order.status !== 'pending') return res.json({ code: 400, message: '订单状态异常' });
  order.paymentMethod = req.body.paymentMethod || order.paymentMethod;
  order.status = 'paid';
  order.paidAt = new Date().toISOString();
  res.json({ code: 200, data: order, message: '支付成功' });
});

// 获取我的订单列表
app.get('/api/orders', authenticate, (req, res) => {
  let myOrders = orders.filter(o => o.userId === req.user.id);
  myOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ code: 200, data: myOrders, total: myOrders.length });
});

// 获取订单详情
app.get('/api/orders/:id', authenticate, (req, res) => {
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.json({ code: 404, message: '订单不存在' });
  res.json({ code: 200, data: order });
});

// 一键再次购买
app.post('/api/orders/:id/rebuy', authenticate, (req, res) => {
  const order = orders.find(o => o.id === req.params.id && o.userId === req.user.id);
  if (!order) return res.json({ code: 404, message: '订单不存在' });
  if (order.status !== 'paid') return res.json({ code: 400, message: '只能对已支付的订单重新购买' });

  if (!carts[req.user.id]) carts[req.user.id] = [];

  for (const item of order.items) {
    const product = products.find(p => p.id === item.productId);
    if (!product || product.status !== 'active' || product.stock <= 0) continue;

    const addQty = Math.min(item.quantity, product.stock);
    const existingItem = carts[req.user.id].find(c => c.productId === item.productId);
    if (existingItem) {
      const newTotal = existingItem.quantity + addQty;
      existingItem.quantity = Math.min(newTotal, product.stock);
    } else {
      carts[req.user.id].push({ id: uuidv4(), productId: item.productId, quantity: addQty });
    }
  }

  res.json({ code: 200, message: '已加入购物车，请确认后结算' });
});

// 管理员获取所有订单
app.get('/api/admin/orders', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ code: 403, message: '无权限' });
  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ code: 200, data: sortedOrders, total: sortedOrders.length });
});

// 启动服务器
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 购物平台服务器运行在 http://localhost:${PORT}`);
  console.log(`📝 默认账号: admin/123456 (管理员), user1/123456 (用户)`);
});
