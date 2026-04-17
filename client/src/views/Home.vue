<template>
  <div class="home-page">
    <NavBar />

    <main class="main-content">
      <div class="page-header">
        <h2>🛒 商品列表</h2>
        <router-link to="/cart" class="cart-link">
          🛍️ 购物车
          <span v-if="cartCount > 0" class="badge">{{ cartCount }}</span>
        </router-link>
      </div>

      <div class="product-grid">
        <div v-for="p in products" :key="p.id" class="product-card">
          <div class="product-img">
            <span class="category-tag">{{ p.category }}</span>
            <img v-if="p.image" :src="getImageUrl(p.image)" alt="" class="product-image" />
            <span v-else class="product-placeholder">{{ p.name.charAt(0) }}</span>
          </div>
          <div class="product-info">
            <h3>{{ p.name }}</h3>
            <p class="desc">{{ p.description || '暂无描述' }}</p>
            <div class="price-row">
              <span class="price">¥{{ p.price.toLocaleString() }}</span>
              <span class="stock">库存: {{ p.stock }}件</span>
            </div>
            <button
              class="btn-add"
              @click="addToCart(p)"
              :disabled="!canAdd(p)"
              :class="{ disabled: !canAdd(p) }"
            >
              {{ p.stock > 0 ? '加入购物车' : '已售罄' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="products.length === 0" class="empty">
        暂无商品，请稍后再来~
      </div>

      <!-- 底部导航 -->
      <BottomNav />
    </main>

    <Toast v-if="toast.show" :message="toast.message" :type="toast.type" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import BottomNav from '../components/BottomNav.vue'
import Toast from '../components/Toast.vue'
import { productApi, cartApi, getBaseUrl } from '../utils/api'

const router = useRouter()
const products = ref([])
const cartItems = ref([])
const toast = ref({ show: false, message: '', type: 'success' })

onMounted(async () => {
  await Promise.all([loadProducts(), loadCart()])
})

async function loadProducts() {
  const res = await productApi.getList(false)
  if (res.code === 200) products.value = res.data
}

async function loadCart() {
  const token = localStorage.getItem('token')
  if (!token) return
  const res = await cartApi.get()
  if (res.code === 200) cartItems.value = res.data
}

const cartCount = computed(() => cartItems.value.reduce((sum, item) => sum + item.quantity, 0))

function canAdd(product) {
  const inCart = cartItems.value.find(c => c.productId === product.id)
  const inCartQty = inCart ? inCart.quantity : 0
  return product.stock > inCartQty
}

function showToast(message, type = 'success') {
  toast.value = { show: true, message, type }
  setTimeout(() => { toast.value.show = false }, 2000)
}

async function addToCart(product) {
  const res = await cartApi.add({ productId: product.id, quantity: 1 })
  if (res.code === 200) {
    showToast(`已添加「${product.name}」到购物车`)
    await loadCart()
  } else {
    showToast(res.message, 'error')
  }
}

function getImageUrl(imagePath) {
  if (!imagePath) return ''
  if (imagePath.startsWith('http')) return imagePath
  return getBaseUrl() + imagePath
}
</script>

<style scoped>
.home-page { min-height: 100vh; }

.main-content { padding: 80px 20px 100px; max-width: 1200px; margin: 0 auto; }

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.page-header h2 { font-size: 24px; color: #333; }
.cart-link {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #667eea;
  color: white;
  padding: 10px 18px;
  border-radius: 10px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}
.badge {
  background: #e74c3c;
  color: white;
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 99px;
  min-width: 18px;
  text-align: center;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.product-card {
  background: white;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  transition: transform 0.25s, box-shadow 0.25s;
}
.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.product-img {
  height: 160px;
  background: linear-gradient(135deg, #e0e5ec, #f5f7fa);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  position: relative;
}
.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.product-placeholder { font-size: 48px; }
.category-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(102,126,234,0.9);
  color: white;
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 12px;
}

.product-info { padding: 16px; }
.product-info h3 { font-size: 16px; color: #222; margin-bottom: 6px; }
.desc { font-size: 13px; color: #888; margin-bottom: 12px; line-height: 1.4; }

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.price { font-size: 22px; color: #e74c3c; font-weight: 700; }
.stock { font-size: 12px; color: #999; }

.btn-add {
  width: 100%;
  padding: 11px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 9px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.25s;
}
.btn-add:hover { opacity: 0.88; }
.btn-add.disabled { background: #ccc; cursor: not-allowed; opacity: 0.65; }

.empty { text-align: center; color: #999; padding: 60px 0; font-size: 16px; }
</style>
