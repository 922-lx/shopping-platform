<template>
  <div class="admin-page">
    <nav class="admin-nav">
      <div class="logo">🛒 购物平台 · 管理后台</div>
      <span class="admin-user">{{ nickname }} (管理员)</span>
      <button @click="goHome" class="btn-home">🏠 前台</button>
      <button @click="handleLogout" class="btn-logout">退出</button>
    </nav>

    <main class="admin-main">
      <!-- Tab 切换 -->
      <div class="tabs">
        <button :class="{ active: activeTab === 'products' }" @click="activeTab = 'products'">📦 商品管理</button>
        <button :class="{ active: activeTab === 'orders' }" @click="activeTab = 'orders'">📋 订单管理</button>
      </div>

      <!-- ========== 商品管理 ========== -->
      <section v-if="activeTab === 'products'" class="tab-content">
        <div class="toolbar">
          <h3>商品列表</h3>
          <button class="btn-add" @click="showAddForm = true">+ 新增商品</button>
        </div>

        <!-- 添加/编辑表单 -->
        <div v-if="showAddForm || editingProduct" class="form-card">
          <h4>{{ editingProduct ? '编辑商品' : '新增商品' }}</h4>
          <form @submit.prevent="saveProduct" class="product-form">
            <div class="f-row">
              <label>名称</label>
              <input v-model="form.name" type="text" placeholder="商品名称" required />
            </div>
            <div class="f-row two-col">
              <div><label>价格</label>
              <input v-model.number="form.price" type="number" placeholder="0.00" min="0" step="0.01" required /></div>
              <div><label>库存数量</label>
              <input v-model.number="form.stock" type="number" placeholder="0" min="0" required /></div>
            </div>
            <div class="f-row two-col">
              <div><label>分类</label>
                <select v-model="form.category">
                  <option value="电子产品">电子产品</option>
                  <option value="电脑">电脑</option>
                  <option value="配件">配件</option>
                  <option value="平板">平板</option>
                  <option value="其他">其他</option>
                </select></div>
            </div>
            <div class="f-row">
              <label>描述</label>
              <input v-model="form.description" type="text" placeholder="简短描述（可选）" />
            </div>

            <!-- 图片上传区域 -->
            <div class="f-row">
              <label>商品图片</label>
              <div class="image-upload-area">
                <div v-if="form.image" class="image-preview-wrapper">
                  <img :src="getImageUrl(form.image)" alt="预览" class="image-preview" />
                  <button type="button" class="btn-remove-img" @click="form.image = ''">✕ 移除图片</button>
                </div>
                <label v-else class="upload-label">
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    @change="handleImageUpload"
                    style="display:none"
                  />
                  <span class="upload-placeholder">📷 点击选择图片（支持jpg/png/gif/webp，最大5MB）</span>
                </label>
                <p v-if="uploadingImage" class="upload-status">⏳ 上传中...</p>
                <p v-if="imageError" class="error-text">{{ imageError }}</p>
              </div>
            </div>

            <div class="f-actions">
              <button type="submit" class="btn-save">{{ editingProduct ? '保存修改' : '添加商品' }}</button>
              <button type="button" class="btn-cancel" @click="cancelEdit">取消</button>
            </div>
          </form>
        </div>

        <!-- 商品表格 -->
        <table class="data-table">
          <thead>
            <tr>
              <th>图片</th>
              <th>ID</th>
              <th>名称</th>
              <th>分类</th>
              <th>价格(¥)</th>
              <th>库存</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in products" :key="p.id">
              <td>
                <img v-if="p.image" :src="getImageUrl(p.image)" class="table-img" alt="" />
                <span v-else class="no-img">无图</span>
              </td>
              <td>{{ p.id }}</td>
              <td><strong>{{ p.name }}</strong></td>
              <td><span class="cat-tag">{{ p.category }}</span></td>
              <td class="price-cell">{{ p.price.toLocaleString() }}</td>
              <td>
                <input
                  type="number"
                  :value="p.stock"
                  @change="(e) => updateStock(p.id, e.target.value)"
                  min="0"
                  class="stock-input"
                />
              </td>
              <td>
                <span class="status-tag" :class="p.status === 'active' ? 'on' : 'off'">
                  {{ p.status === 'active' ? '上架中' : '已下架' }}
                </span>
              </td>
              <td class="actions-cell">
                <button class="btn-edit" @click="startEdit(p)">✏️ 编辑</button>
                <button
                  class="btn-toggle"
                  @click="toggleStatus(p)"
                >
                  {{ p.status === 'active' ? '⬇️ 下架' : '⬆️ 上架' }}
                </button>
                <button class="btn-delete" @click.stop="deleteProduct(p)">🗑️ 删除</button>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-if="products.length === 0" class="empty-text">暂无商品数据</p>
      </section>

      <!-- ========== 订单管理 ========== -->
      <section v-if="activeTab === 'orders'" class="tab-content">
        <h3>全部订单 ({{ orders.length }})</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>订单号</th>
              <th>用户</th>
              <th>配送方式</th>
              <th>金额(¥)</th>
              <th>状态</th>
              <th>时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in orders" :key="o.id">
              <td>{{ o.id }}</td>
              <td>{{ o.userName }}</td>
              <td>{{ o.deliveryType === 'pickup' ? '自取' : `外送: ${o.address}` }}</td>
              <td class="price-cell">{{ o.totalAmount?.toLocaleString() || 0 }}</td>
              <td>
                <span class="status-tag" :class="o.status === 'paid' ? 'on' : (o.status === 'pending' ? 'warn' : '')">
                  {{ { pending: '待支付', paid: '已支付', completed: '已完成' }[o.status] || o.status }}
                </span>
              </td>
              <td style="font-size:12px;color:#999;">{{ formatTime(o.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="orders.length === 0" class="empty-text">暂无订单</p>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { productApi as publicProductApi, adminProductApi, adminOrderApi, uploadApi, getBaseUrl } from '../../utils/api'

const router = useRouter()
const activeTab = ref('products')
const products = ref([])
const orders = ref([])
const showAddForm = ref(false)
const editingProduct = ref(null)

const form = reactive({
  name: '',
  price: 0,
  stock: 0,
  category: '电子产品',
  description: '',
  image: ''
})

const uploadingImage = ref(false)
const imageError = ref('')
const fileInput = ref(null)

const nickname = localStorage.getItem('nickname') || localStorage.getItem('userName') || ''

onMounted(async () => {
  await Promise.all([loadProducts(), loadOrders()])
})

async function loadProducts() {
  const res = await publicProductApi.getList(true)
  if (res.code === 200) products.value = res.data
}

async function loadOrders() {
  const res = await adminOrderApi.getList()
  if (res.code === 200) orders.value = res.data
}

function resetForm() {
  form.name = ''
  form.price = 0
  form.stock = 0
  form.category = '电子产品'
  form.description = ''
  form.image = ''
  imageError.value = ''
}

function cancelEdit() {
  showAddForm.value = false
  editingProduct.value = null
  resetForm()
}

async function saveProduct() {
  const data = {
    name: form.name,
    price: form.price,
    stock: form.stock,
    category: form.category,
    description: form.description,
    image: form.image
  }

  let res
  if (editingProduct.value) {
    res = await adminProductApi.update(editingProduct.value.id, data)
  } else {
    res = await adminProductApi.add(data)
  }

  if (res.code === 200) {
    alert(res.message)
    cancelEdit()
    await loadProducts()
  } else {
    alert(res.message || '操作失败')
  }
}

function startEdit(product) {
  editingProduct.value = product
  showAddForm.value = false
  form.name = product.name
  form.price = product.price
  form.stock = product.stock
  form.category = product.category || '其他'
  form.description = product.description || ''
  form.image = product.image || ''
}

// 图片上传处理
async function handleImageUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  // 校验文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    imageError.value = '仅支持 jpg/png/gif/webp 格式'
    return
  }

  // 校验文件大小（5MB）
  if (file.size > 5 * 1024 * 1024) {
    imageError.value = '图片大小不能超过5MB'
    return
  }

  uploadingImage.value = true
  imageError.value = ''

  try {
    const res = await uploadApi.image(file)
    if (res.code === 200 && res.data?.url) {
      form.image = res.data.url
    } else {
      imageError.value = res.message || '上传失败，请重试'
    }
  } catch (e) {
    imageError.value = '网络错误，请检查后端是否运行'
  } finally {
    uploadingImage.value = false
    // 重置 file input 以便重复选择同一文件
    if (fileInput.value) fileInput.value.value = ''
  }
}

function getImageUrl(imagePath) {
  if (!imagePath) return ''
  if (imagePath.startsWith('http')) return imagePath
  return getBaseUrl() + imagePath
}

async function toggleStatus(product) {
  const newStatus = product.status === 'active' ? 'inactive' : 'active'
  const res = await adminProductApi.toggleStatus(product.id, newStatus)
  if (res.code === 200) {
    await loadProducts()
  } else {
    alert(res.message)
  }
}

async function updateStock(id, val) {
  const qty = parseInt(val)
  if (isNaN(qty) || qty < 0) return
  const res = await adminProductApi.update(id, { stock: qty })
  if (res.code !== 200) {
    alert(res.message || '更新失败')
    await loadProducts()
  }
}

async function deleteProduct(product) {
  if (!confirm(`确定删除「${product.name}」吗？`)) return
  const res = await adminProductApi.delete(product.id)
  if (res.code === 200) {
    await loadProducts()
  } else {
    alert(res.message)
  }
}

function goHome() {
  router.push('/')
}

function handleLogout() {
  if (!confirm('确定退出登录吗？')) return
  localStorage.clear()
  router.push('/login')
}

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t)
  return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}
</script>

<style scoped>
.admin-page { min-height: 100vh; background: #f0f2f5; }

.admin-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 58px;
  background: linear-gradient(135deg, #2c3e50, #34495e);
  color: white;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 16px;
  z-index: 1000;
}
.logo { font-size: 18px; font-weight: 700; flex-shrink: 0; }
.admin-user { font-size: 13px; opacity: 0.8; margin-left: auto; }

.btn-home, .btn-logout {
  padding: 6px 14px;
  border-radius: 7px;
  font-size: 13px;
  cursor: pointer;
  border: none;
}
.btn-home { background: rgba(102,126,234,0.9); color: white; }
.btn-logout { background: rgba(231,76,60,0.85); color: white; }

.admin-main { padding: 74px 24px 40px; max-width: 1100px; margin: 0 auto; }

.tabs { display: flex; gap: 12px; margin-bottom: 20px; }
.tabs button {
  padding: 10px 22px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  background: #e1e5eb;
  color: #666;
  transition: all 0.25s;
}
.tabs button.active { background: #2c3e50; color: white; }

.tab-content {
  background: white;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.toolbar h3 { font-size: 18px; color: #333; }
.btn-add {
  padding: 10px 20px;
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  border: none;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.form-card {
  background: #f9fafb;
  border: 2px solid #e1e5eb;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}
.form-card h4 { font-size: 17px; color: #333; margin-bottom: 18px; }

.product-form .f-row { margin-bottom: 14px; }
.product-form label { display: block; font-size: 13px; color: #555; margin-bottom: 6px; font-weight: 500; }
.product-form input[type="text"],
.product-form input[type="number"],
.product-form select {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}
.product-form input:focus, .product-form select:focus { border-color: #667eea; }

.f-row.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

.f-actions { display: flex; gap: 10px; margin-top: 8px; }
.btn-save {
  padding: 11px 28px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.btn-cancel {
  padding: 11px 22px;
  background: #eee;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

/* 表格 */
.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  background: #f5f7fa;
  padding: 12px 14px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #555;
  border-bottom: 2px solid #e1e5eb;
}
.data-table td {
  padding: 12px 14px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  vertical-align: middle;
}
.data-table tr:hover { background: #fafbfc; }

.price-cell { font-weight: 700; color: #e74c3c; }

.cat-tag {
  display: inline-block;
  background: #eef2ff;
  color: #667eea;
  padding: 2px 10px;
  border-radius: 5px;
  font-size: 12px;
}

.status-tag {
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}
.status-tag.on { background: #e8f8ee; color: #27ae60; }
.status-tag.off { background: #fef0f0; color: #e74c3c; }
.status-tag.warn { background: #fff4e5; color: #f39c12; }

.stock-input {
  width: 70px;
  padding: 6px 8px;
  border: 2px solid #ddd;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
  outline: none;
}
.stock-input:focus { border-color: #667eea; }

.actions-cell { display: flex; gap: 6px; flex-wrap: wrap; }
.actions-cell button {
  padding: 5px 10px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}
.btn-edit { background: #eef2ff; color: #667eea; }
.btn-toggle { background: #fff4e5; color: #f39c12; }
.btn-delete { background: #fef0f0; color: #e74c3c; }

/* 图片上传区域 */
.image-upload-area { margin-top: 4px; }
.upload-label {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #ccc;
  border-radius: 10px;
  padding: 24px;
  cursor: pointer;
  background: #fafbfc;
  transition: border-color 0.25s, background 0.25s;
}
.upload-label:hover {
  border-color: #667eea;
  background: #f0f2ff;
}
.upload-placeholder {
  font-size: 14px;
  color: #888;
}

.image-preview-wrapper {
  position: relative;
  display: inline-block;
}
.image-preview {
  max-width: 200px;
  max-height: 150px;
  border-radius: 10px;
  border: 2px solid #e1e5eb;
  object-fit: cover;
}
.btn-remove-img {
  display: inline-block;
  margin-top: 8px;
  padding: 4px 12px;
  background: #fef0f0;
  color: #e74c3c;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
}
.btn-remove-img:hover { background: #fad0d0; }

.upload-status { margin-top: 6px; font-size: 13px; color: #667eea; }
.error-text { margin-top: 6px; font-size: 13px; color: #e74c3c; }

/* 表格图片 */
.table-img {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid #eee;
}
.no-img {
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 6px;
  font-size: 11px;
  color: #bbb;
}

.empty-text { text-align: center; color: #aaa; padding: 30px; font-size: 15px; }
</style>
