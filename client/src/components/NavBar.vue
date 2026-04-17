<template>
  <nav class="navbar">
    <div class="nav-inner">
      <router-link to="/" class="logo">🛒 购物平台</router-link>
      <div class="nav-right">
        <span class="user-info">{{ nickname || userName }} ({{ userRole === 'admin' ? '管理员' : '用户' }})</span>
        <router-link v-if="userRole === 'admin'" to="/admin" class="nav-link admin-btn">管理后台</router-link>
        <button class="logout-btn" @click="handleLogout">退出</button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userName = localStorage.getItem('userName') || ''
const nickname = localStorage.getItem('nickname') || ''
const userRole = localStorage.getItem('userRole') || ''

function handleLogout() {
  localStorage.clear()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  z-index: 1000;
  box-shadow: 0 2px 12px rgba(0,0,0,0.15);
}

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 20px;
  font-weight: 700;
  color: white;
  text-decoration: none;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info { font-size: 14px; opacity: 0.9; }

.nav-link {
  color: white;
  text-decoration: none;
  padding: 6px 14px;
  border-radius: 8px;
  background: rgba(255,255,255,0.2);
  font-size: 13px;
}
.admin-btn { background: rgba(243,156,18,0.9); }

.logout-btn {
  padding: 6px 14px;
  border: 1px solid rgba(255,255,255,0.5);
  background: transparent;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
}
.logout-btn:hover { background: rgba(255,255,255,0.15); }
</style>
