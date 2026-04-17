<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="title">{{ isLogin ? '欢迎登录' : '注册账号' }}</h1>
      
      <form @submit.prevent="handleSubmit" class="form">
        <div class="field">
          <label>用户名</label>
          <input v-model="form.username" type="text" placeholder="请输入用户名" required />
        </div>

        <div v-if="!isLogin" class="field">
          <label>昵称</label>
          <input v-model="form.nickname" type="text" placeholder="请输入昵称" />
        </div>

        <div class="field">
          <label>密码</label>
          <input v-model="form.password" type="password" placeholder="请输入密码" required />
        </div>

        <div v-if="!isLogin" class="field">
          <label>确认密码</label>
          <input v-model="form.confirmPassword" type="password" placeholder="再次输入密码" required />
        </div>

        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
        <p v-if="successMsg" class="success">{{ successMsg }}</p>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? '处理中...' : (isLogin ? '登 录' : '注 册') }}
        </button>
      </form>

      <p class="switch-text">
        {{ isLogin ? '还没有账号？' : '已有账号？' }}
        <a @click="toggleMode">{{ isLogin ? '立即注册' : '去登录' }}</a>
      </p>

      <div class="demo-accounts">
        <p class="demo-title">快速体验（默认账号）：</p>
        <button class="btn-demo btn-admin" @click="quickLogin('admin')">管理员账号</button>
        <button class="btn-demo btn-user" @click="quickLogin('user1')">普通用户账号</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { userApi } from '../utils/api'

const router = useRouter()
const isLogin = ref(true)
const loading = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  nickname: ''
})

function toggleMode() {
  isLogin.value = !isLogin.value
  errorMsg.value = ''
  successMsg.value = ''
}

async function handleSubmit() {
  errorMsg.value = ''
  successMsg.value = ''

  if (!isLogin.value) {
    if (form.password !== form.confirmPassword) {
      errorMsg.value = '两次密码不一致'
      return
    }
    loading.value = true
    const res = await userApi.register({
      username: form.username,
      password: form.password,
      nickname: form.nickname
    })
    loading.value = false

    if (res.code === 200) {
      successMsg.value = res.message
      setTimeout(() => { isLogin.value = true }, 1500)
    } else {
      errorMsg.value = res.message
    }
  } else {
    loading.value = true
    const res = await userApi.login({
      username: form.username,
      password: form.password
    })
    loading.value = false

    if (res.code === 200) {
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('userId', res.data.id)
      localStorage.setItem('userName', res.data.username)
      localStorage.setItem('nickname', res.data.nickname || '')
      localStorage.setItem('userRole', res.data.role)

      if (res.data.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    } else {
      errorMsg.value = res.message
    }
  }
}

async function quickLogin(username) {
  const res = await userApi.login({ username, password: '123456' })
  if (res.code === 200) {
    localStorage.setItem('token', res.data.token)
    localStorage.setItem('userId', res.data.id)
    localStorage.setItem('userName', res.data.username)
    localStorage.setItem('nickname', res.data.nickname || '')
    localStorage.setItem('userRole', res.data.role)

    if (res.data.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/')
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.title {
  text-align: center;
  font-size: 28px;
  color: #333;
  margin-bottom: 32px;
  font-weight: 700;
}

.form .field {
  margin-bottom: 20px;
}

.form label {
  display: block;
  font-size: 14px;
  color: #555;
  margin-bottom: 6px;
  font-weight: 500;
}

.form input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e1e5eb;
  border-radius: 10px;
  font-size: 15px;
  transition: border-color 0.3s;
  outline: none;
}

.form input:focus {
  border-color: #667eea;
}

.error {
  color: #e74c3c;
  font-size: 13px;
  margin-bottom: 12px;
  text-align: center;
}

.success {
  color: #27ae60;
  font-size: 13px;
  margin-bottom: 12px;
  text-align: center;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s;
}

.btn-primary:hover { opacity: 0.9; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.switch-text {
  text-align: center;
  margin-top: 20px;
  color: #888;
  font-size: 14px;
}

.switch-text a {
  color: #667eea;
  cursor: pointer;
  font-weight: 600;
}

.demo-accounts {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.demo-title {
  text-align: center;
  color: #999;
  font-size: 13px;
  margin-bottom: 12px;
}

.btn-demo {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 8px;
  transition: opacity 0.3s;
}
.btn-demo:hover { opacity: 0.85; }

.btn-admin { background: #f39c12; color: white; }
.btn-user { background: #3498db; color: white; }
</style>
