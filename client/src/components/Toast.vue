<template>
  <div class="toast" :class="type">
    {{ message }}
  </div>
</template>

<script setup>
defineProps({
  message: String,
  type: { type: String, default: 'success' }
})
</script>

<style scoped>
.toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 14px 28px;
  border-radius: 10px;
  color: white;
  font-size: 15px;
  font-weight: 500;
  z-index: 9999;
  animation: slideDown 0.3s ease;
}
.toast.success { background: #27ae60; }
.toast.error { background: #e74c3c; }

@keyframes slideDown {
  from { opacity: 0; transform: translateX(-50%) translateY(-16px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}
</style>
