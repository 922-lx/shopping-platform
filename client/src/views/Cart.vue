<template>
  <div class="cart-page">
    <NavBar />

    <main class="main-content">
      <h2>🛍️ 购物车</h2>

      <div v-if="cartItems.length === 0" class="empty">
        <p>购物车空空如也~</p>
        <router-link to="/" class="btn-go">去逛逛</router-link>
      </div>

      <template v-else>
        <div class="cart-list">
          <div v-for="item in cartItems" :key="item.id" class="cart-item">
            <div class="item-img">
              <img v-if="item.product?.image" :src="getImageUrl(item.product.image)" alt="" class="cart-item-img" />
              <span v-else>{{ (item.product?.name || '?').charAt(0) }}</span>
            </div>
            <div class="item-info">
              <h3>{{ item.product?.name }}</h3>
              <p class="price">¥{{ item.product?.price?.toLocaleString() }} / 件</p>
              <p class="stock-hint">库存: {{ item.product?.stock }}件</p>
            </div>
            <div class="item-qty">
              <button @click="updateQty(item, -1)" :disabled="item.quantity <= 1">−</button>
              <input type="number" :value="item.quantity" @change="(e) => setQty(item, e.target.value)" min="1" />
              <button @click="updateQty(item, 1)" :disabled="!canIncrease(item)">+</button>
            </div>
            <div class="item-subtotal">¥{{ ((item.product?.price || 0) * item.quantity).toLocaleString() }}</div>
            <button class="btn-remove" @click.stop="removeItem(item.id)">🗑️</button>
          </div>
        </div>

        <div class="cart-summary">
          <div class="summary-row total-row">
            <span>合计：</span>
            <span class="total-price">¥{{ totalPrice.toLocaleString() }}</span>
          </div>
          <router-link to="/checkout" class="btn-checkout">去结算（{{ cartItems.length }}件商品）</router-link>
        </div>
      </template>

      <BottomNav />
    </main>

    <Toast v-if="toast.show" :message="toast.message" :type="toast.type" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import BottomNav from '../components/BottomNav.vue'
import Toast from '../components/Toast.vue'
import { cartApi, getBaseUrl } from '../utils/api'

const router = useRouter()
const cartItems = ref([])
const toast = ref({ show: false, message: '', type: 'success' })

onMounted(() => loadCart())

async function loadCart() {
  const res = await cartApi.get()
  if (res.code === 200) cartItems.value = res.data
}

const totalPrice = computed(() =>
  cartItems.value.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)
)

function canIncrease(item) {
  return (item.quantity || 0) < (item.product?.stock || 0)
}

function showToast(msg, type = 'success') {
  toast.value = { show: true, message: msg, type }
  setTimeout(() => { toast.value.show = false }, 2000)
}

async function updateQty(item, delta) {
  const newQty = item.quantity + delta
  if (newQty < 1) return
  if (newQty > (item.product?.stock || 0)) {
    showToast('超过库存上限', 'error')
    return
  }
  await doUpdateQty(item.id, newQty)
}

async function setQty(item, val) {
  const qty = parseInt(val)
  if (isNaN(qty) || qty < 1) {
    await loadCart()
    return
  }
  if (qty > (item.product?.stock || 0)) {
    showToast('超过库存上限', 'error')
    await loadCart()
    return
  }
  await doUpdateQty(item.id, qty)
}

async function doUpdateQty(id, qty) {
  const res = await cartApi.update(id, qty)
  if (res.code !== 200) showToast(res.message || '更新失败', 'error')
  await loadCart()
}

function getImageUrl(imagePath) {
  if (!imagePath) return ''
  if (imagePath.startsWith('http')) return imagePath
  return getBaseUrl() + imagePath
}

async function removeItem(id) {
  if (!confirm('确定要删除该商品吗？')) return
  try {
    const res = await cartApi.remove(id)
    if (res.code === 200) {
      showToast('已移除')
      cartItems.value = cartItems.value.filter(item => item.id !== id)
    } else {
      showToast(res.message || '删除失败', 'error')
    }
  } catch(e) {
    showToast('网络错误，请重试', 'error')
  }
}
</script>

<style scoped>
.cart-page { min-height: 100vh; }

.main-content { padding: 80px 20px 100px; max-width: 900px; margin: 0 auto; }

h2 { font-size: 24px; color: #333; margin-bottom: 24px; }

.empty {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}
.empty p { font-size: 18px; margin-bottom: 16px; }

.btn-go {
  display: inline-block;
  padding: 12px 30px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 10px;
  text-decoration: none;
  font-size: 15px;
}

.cart-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }

.cart-item {
  background: white;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.item-img {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  background: #eef0f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  flex-shrink: 0;
}
.cart-item-img {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  object-fit: cover;
}

.item-info { flex: 1; min-width: 0; }
.item-info h3 { font-size: 15px; color: #222; margin-bottom: 4px; }
.price { color: #e74c3c; font-size: 14px; font-weight: 600; }
.stock-hint { font-size: 12px; color: #aaa; margin-top: 2px; }

.item-qty {
  display: flex;
  align-items: center;
  gap: 6px;
}
.item-qty button {
  width: 30px;
  height: 30px;
  border: 1.5px solid #ddd;
  background: #f9f9f9;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}
.item-qty button:disabled { opacity: 0.4; cursor: not-allowed; }
.item-qty input {
  width: 48px;
  height: 30px;
  text-align: center;
  border: 1.5px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}
/* 隐藏number input箭头 */
.item-qty input::-webkit-inner-spin-button,
.item-qty input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }

.item-subtotal {
  font-size: 16px;
  font-weight: 700;
  color: #e74c3c;
  min-width: 80px;
  text-align: right;
}

.btn-remove {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 4px;
}
.btn-remove:hover { transform: scale(1.15); }

.cart-summary {
  background: white;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 15px; }
.total-row { font-size: 18px; margin-bottom: 16px; }
.total-price { color: #e74c3c; font-weight: 700; font-size: 24px; }

.btn-checkout {
  display: block;
  text-align: center;
  padding: 14px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 10px;
  text-decoration: none;
  font-size: 17px;
  font-weight: 600;
}
.btn-checkout:hover { opacity: 0.9; }
</style>
