<template>
  <div class="payment-page">
    <NavBar />

    <main class="main-content">
      <!-- 步骤1: 确认支付 -->
      <div v-if="step === 'confirm'" class="card">
        <h2>💳 确认支付</h2>

        <div class="order-info">
          <p><strong>订单号：</strong>{{ orderId }}</p>
          <p><strong>支付方式：</strong>{{ paymentLabel }}</p>
          <div class="amount-display">¥{{ orderAmount }}</div>
        </div>

        <button class="btn-pay" @click="confirmPay" :disabled="paying">
          {{ paying ? '支付中...' : `确认支付 ¥${orderAmount}` }}
        </button>
      </div>

      <!-- 步骤2: 支付成功 -->
      <div v-if="step === 'success'" class="card success-card">
        <div class="success-icon">✅</div>
        <h2>支付成功！</h2>
        <p class="success-text">您的订单已支付完成，感谢购买~</p>

        <div class="success-actions">
          <router-link to="/orders" class="btn-action btn-primary-action">查看订单</router-link>
          <router-link to="/" class="btn-action btn-secondary-action">继续购物</router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NavBar from '../components/NavBar.vue'
import { orderApi, cartApi } from '../utils/api'

const route = useRoute()
const router = useRouter()

const step = ref('confirm')
const orderId = ref(route.query.orderId || '')
const orderData = ref(null)
const paying = ref(false)
const selectedPayment = ref('alipay')

onMounted(async () => {
  if (!orderId.value) {
    router.push('/cart')
    return
  }
  // 获取订单详情
  const res = await orderApi.getOne(orderId.value)
  if (res.code === 200 && res.data) {
    orderData.value = res.data
    if (res.data.paymentMethod) selectedPayment.value = res.data.paymentMethod

    // 如果已经支付过了，直接显示成功
    if (res.data.status !== 'pending') {
      step.value = 'success'
    }
  }
})

const orderAmount = computed(() => orderData.value?.totalAmount?.toLocaleString() || '0')
const paymentLabel = computed(() => {
  const map = { alipay: '支付宝', wechat: '微信支付', bankcard: '银行卡' }
  return map[selectedPayment.value] || '支付宝'
})

async function confirmPay() {
  paying.value = true
  // 模拟支付延迟
  setTimeout(async () => {
    const res = await orderApi.pay(orderId.value, selectedPayment.value)
    paying.value = false
    if (res.code === 200) {
      step.value = 'success'
    } else {
      alert(res.message || '支付失败，请重试')
    }
  }, 1200) // 模拟网络延迟
}
</script>

<style scoped>
.payment-page { min-height: 100vh; background: #f5f7fa; }

.main-content { padding: 80px 20px 40px; max-width: 500px; margin: 0 auto; }

.card {
  background: white;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  box-shadow: 0 8px 30px rgba(0,0,0,0.08);
}

.card h2 { font-size: 22px; color: #333; margin-bottom: 24px; }

.order-info {
  text-align: left;
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}
.order-info p { font-size: 14px; color: #555; margin-bottom: 8px; line-height: 1.6; }
.order-info strong { color: #333; }

.amount-display {
  text-align: center;
  font-size: 36px;
  color: #e74c3c;
  font-weight: 800;
  margin-top: 16px;
}

.btn-pay {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #27ae60, #2ecc71);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
}
.btn-pay:hover { opacity: 0.9; }
.btn-pay:disabled { opacity: 0.6; cursor: not-allowed; }

.success-card { padding: 48px 32px; }
.success-icon { font-size: 64px; margin-bottom: 16px; }
.success-card h2 { color: #27ae60; }
.success-text { color: #666; font-size: 15px; margin-bottom: 28px; }

.success-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.btn-action {
  display: block;
  text-align: center;
  padding: 14px;
  border-radius: 10px;
  text-decoration: none;
  font-size: 15px;
  font-weight: 600;
}
.btn-primary-action { background: linear-gradient(135deg, #667eea, #764ba2); color: white; }
.btn-secondary-action { background: #f0efff; color: #667eea; border: 2px solid #e1dfff; }
</style>
