<template>
  <div class="bottom-nav">
    <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }">
      <span class="icon">🏠</span>
      <span>首页</span>
    </router-link>
    <router-link to="/cart" class="nav-item" :class="{ active: $route.path === '/cart' }">
      <span class="icon">🛒</span>
      <span>购物车</span>
    </router-link>
    <router-link to="/orders" class="nav-item" :class="{ active: $route.path === '/orders' }">
      <span class="icon">📋</span>
      <span>订单</span>
    </router-link>
  </div>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: white;
  display: flex;
  border-top: 1px solid #e1e5eb;
  z-index: 999;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #888;
  font-size: 12px;
  gap: 3px;
  transition: color 0.2s;
}
.nav-item.active { color: #667eea; }
.nav-item .icon { font-size: 22px; }
</style>
