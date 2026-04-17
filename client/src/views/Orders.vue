<template>
  <div class="orders-page">
    <NavBar />

    <main class="main-content">
      <h2>📋 我的订单</h2>

      <div v-if="orders.length === 0" class="empty">
        <p>暂无订单~</p>
        <router-link to="/" class="btn-go">去购物</router-link>
      </div>

      <div v-else class="order-list">
        <div v-for="o in orders" :key="o.id" class="order-card">
          <div class="order-header">
            <span class="order-id">订单号：{{ o.id }}</span>
            <span class="order-status" :class="statusClass(o.status)">{{ statusText(o.status) }}</span>
          </div>

          <div class="delivery-info">
            📍 {{ o.deliveryType === 'pickup' ? '到店自取' : '外送配送' }}
            <span v-if="o.deliveryType === 'delivery' && o.address"> - {{ o.address }}</span>
          </div>

          <div class="items-list">
            <div v-for="(item, idx) in o.items" :key="idx" class="item-row">
              <div class="order-item-info">
                <img v-if="item.productImage" :src="getImageUrl(item.productImage)" alt="" class="order-item-img" />
                <span>{{ item.productName }}</span>
              </div>
              <span>×{{ item.quantity }}</span>
              <span class="sub">¥{{ item.subtotal?.toLocaleString() || 0 }}</span>
            </div>
          </div>

          <div class="order-footer">
            <span class="total">合计：<strong>¥{{ o.totalAmount?.toLocaleString() || 0 }}</strong></span>
            <div class="actions">
              <button
                v-if="o.status === 'paid'"
                class="btn-rebuy"
                @click="rebuyOrder(o)"
                :disabled="rebuyingId === o.id"
              >
                {{ rebuyingId === o.id ? '处理中...' : '🔄 再次购买' }}
              </button>
              <router-link
                v-if="o.status === 'pending'"
                class="btn-pay-now"
                :to="{ path: '/payment/result', query: { orderId: o.id } }"
              >
                去支付
              </router-link>
            </div>
          </div>

          <p class="time">{{ formatTime(o.createdAt) }}</p>
        </div>
      </div>

      <BottomNav />
    </main>

    <Toast v-if="toast.show" :message="toast.message" :type="toast.type" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import BottomNav from '../components/BottomNav.vue'
import Toast from '../components/Toast.vue'
import { orderApi, getBaseUrl } from '../utils/api'

const router = useRouter()
const orders = ref([])
const rebuyingId = ref(null)
const toast = ref({ show: false, message: '', type: 'success' })

onMounted(() => loadOrders())

async function loadOrders() {
  const res = await orderApi.getList()
  if (res.code === 200) orders.value = res.data
}

function statusText(status) {
  const map = { pending: '待支付', paid: '已支付', completed: '已完成' }
  return map[status] || status
}

function statusClass(status) {
  return { paid: 'tag-paid', pending: 'tag-pending', completed: 'tag-completed' }[status] || ''
}

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function getImageUrl(imagePath) {
  if (!imagePath) return ''
  if (imagePath.startsWith('http')) return imagePath
  return getBaseUrl() + imagePath
}

function showToast(msg, type = 'success') {
  toast.value = { show: true, message: msg, type }
  setTimeout(() => { toast.value.show = false }, 2500)
}

async function rebuyOrder(order) {
  rebuyingId.value = order.id
  const res = await orderApi.rebuy(order.id)
  rebuyingId.value = null

  if (res.code === 200) {
    showToast('已加入购物车，请确认后结算')
    router.push('/cart')
  } else {
    showToast(res.message || '操作失败', 'error')
  }
}
</script>

<style scoped>
.orders-page { min-height: 100vh; }

.main-content { padding: 80px 20px 100px; max-width: 700px; margin: 0 auto; }

h2 { font-size: 24px; color: #333; margin-bottom: 24px; }

.empty { text-align: center; padding: 60px 20px; color: #999; }
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

.order-list { display: flex; flex-direction: column; gap: 16px; }

.order-card {
  background: white;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.order-id { font-size: 13px; color: #888; }

.order-status {
  padding: 3px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}
.tag-paid { background: #e8f8ee; color: #27ae60; }
.tag-pending { background: #fff4e5; color: #f39c12; }
.tag-completed { background: #eef2ff; color: #667eea; }

.delivery-info {
  font-size: 13px;
  color: #666;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #eee;
}

.items-list { margin-bottom: 16px; }
.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 7px 0;
  font-size: 14px;
  color: #444;
}
.item-row .sub { color: #e74c3c; font-weight: 500; min-width: 70px; text-align: right; }

.order-item-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}
.order-item-img {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 14px;
  border-top: 1px solid #f0f0f0;
}
.order-footer .total { font-size: 15px; color: #555; }
.order-footer strong { color: #e74c3c; font-size: 18px; }

.actions { display: flex; gap: 10px; }

.btn-rebuy, .btn-pay-now {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  text-decoration: none;
  display: inline-block;
}
.btn-rebuy {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}
.btn-rebuy:hover { opacity: 0.88; }
.btn-rebuy:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-pay-now {
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
}

.time {
  text-align: right;
  font-size: 11px;
  color: #bbb;
  margin-top: 10px;
}
</style>
