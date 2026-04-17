<template>
  <div class="checkout-page">
    <NavBar />

    <main class="main-content">
      <h2>📝 订单结算</h2>

      <!-- 配送方式 -->
      <div class="section">
        <h3 class="section-title">配送方式</h3>
        <div class="delivery-options">
          <label class="option" :class="{ active: deliveryType === 'pickup' }">
            <input type="radio" v-model="deliveryType" value="pickup" />
            <span class="icon">🏪</span>
            <span>到店自取</span>
          </label>
          <label class="option" :class="{ active: deliveryType === 'delivery' }">
            <input type="radio" v-model="deliveryType" value="delivery" />
            <span class="icon">🚚</span>
            <span>外送配送</span>
          </label>
        </div>
      </div>

      <!-- 外送地址 -->
      <div v-if="deliveryType === 'delivery'" class="section">
        <h3 class="section-title">配送地址</h3>
        <textarea
          v-model="address"
          placeholder="请输入详细收货地址（省/市/区/街道/门牌号）"
          rows="3"
          class="address-input"
        ></textarea>
      </div>

      <!-- 商品清单 -->
      <div class="section">
        <h3 class="section-title">商品清单（{{ cartItems.length }}件）</h3>
        <div class="order-items">
          <div v-for="item in cartItems" :key="item.id" class="order-item-row">
            <div class="checkout-item-info">
              <img v-if="item.product?.image" :src="getImageUrl(item.product.image)" alt="" class="checkout-item-img" />
              <span>{{ item.product?.name }}</span>
            </div>
            <span>×{{ item.quantity }}</span>
            <span class="sub-price">¥{{ ((item.product?.price || 0) * item.quantity).toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <!-- 支付方式 -->
      <div class="section">
        <h3 class="section-title">支付方式</h3>
        <div class="payment-options">
          <label class="pay-option" :class="{ active: paymentMethod === 'alipay' }">
            <input type="radio" v-model="paymentMethod" value="alipay" />
            <span class="pay-icon">💳 支付宝</span>
          </label>
          <label class="pay-option" :class="{ active: paymentMethod === 'wechat' }">
            <input type="radio" v-model="paymentMethod" value="wechat" />
            <span class="pay-icon">💚 微信支付</span>
          </label>
          <label class="pay-option" :class="{ active: paymentMethod === 'bankcard' }">
            <input type="radio" v-model="paymentMethod" value="bankcard" />
            <span class="pay-icon">🏦 银行卡</span>
          </label>
        </div>
      </div>

      <!-- 合计 -->
      <div class="summary-card">
        <div class="total-line">
          <span>应付金额</span>
          <span class="amount">¥{{ totalPrice.toLocaleString() }}</span>
        </div>
      </div>

      <button
        class="btn-submit"
        @click="submitOrder"
        :disabled="submitting || !canSubmit"
      >
        {{ submitting ? '提交中...' : '确认下单' }}
      </button>

      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

      <BottomNav />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import BottomNav from '../components/BottomNav.vue'
import { cartApi, orderApi, getBaseUrl } from '../utils/api'

const router = useRouter()
const cartItems = ref([])
const deliveryType = ref('pickup')
const address = ref('')
const paymentMethod = ref('alipay')
const submitting = ref(false)
const errorMsg = ref('')

onMounted(() => loadCart())

async function loadCart() {
  const res = await cartApi.get()
  if (res.code === 200) cartItems.value = res.data
}

const totalPrice = computed(() =>
  cartItems.value.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)
)

const canSubmit = computed(() => {
  if (cartItems.value.length === 0) return false
  if (!paymentMethod.value) return false
  if (deliveryType.value === 'delivery' && !address.value.trim()) return false
  return true
})

function getImageUrl(imagePath) {
  if (!imagePath) return ''
  if (imagePath.startsWith('http')) return imagePath
  return getBaseUrl() + imagePath
}

async function submitOrder() {
  errorMsg.value = ''
  submitting.value = true

  const res = await orderApi.create({
    deliveryType: deliveryType.value,
    address: deliveryType.value === 'delivery' ? address.value.trim() : '',
    paymentMethod: paymentMethod.value
  })

  submitting.value = false

  if (res.code === 200) {
    // 进入支付确认页
    router.push({
      path: '/payment/result',
      query: { orderId: res.data.id }
    })
  } else {
    errorMsg.value = res.message
  }
}
</script>

<style scoped>
.checkout-page { min-height: 100vh; }

.main-content { padding: 80px 20px 100px; max-width: 700px; margin: 0 auto; }

h2 { font-size: 24px; color: #333; margin-bottom: 24px; }

.section {
  background: white;
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 14px;
}

.delivery-options, .payment-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.option, .pay-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  border: 2px solid #e1e5eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s;
  font-size: 14px;
  user-select: none;
}
.option.active, .pay-option.active {
  border-color: #667eea;
  background: #f0efff;
}
.option .icon, .pay-icon { font-size: 18px; }

.address-input {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e1e5eb;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  outline: none;
  transition: border-color 0.25s;
}
.address-input:focus { border-color: #667eea; }

.order-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
  font-size: 14px;
}
.order-item-row:last-child { border-bottom: none; }

.checkout-item-info {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}
.checkout-item-img {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.sub-price { color: #e74c3c; font-weight: 600; min-width: 80px; text-align: right; }

.summary-card {
  background: white;
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.total-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 17px;
  font-weight: 600;
}
.amount { color: #e74c3c; font-size: 26px; font-weight: 700; }

.btn-submit {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.25s;
}
.btn-submit:hover { opacity: 0.9; }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

.error-msg {
  text-align: center;
  color: #e74c3c;
  font-size: 14px;
  margin-top: 12px;
}
</style>
