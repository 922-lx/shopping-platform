const BASE = '/api'

function request(url, options = {}) {
  const token = localStorage.getItem('token')
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: token } : {})
    },
    ...options
  }

  return fetch(BASE + url, config).then(res => res.json())
}

// 用户相关
export const userApi = {
  register: (data) => request('/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data) => request('/login', { method: 'POST', body: JSON.stringify(data) }),
  getInfo: () => request('/user/info')
}

// 商品
export const productApi = {
  getList: (showAll = false) => request(`/products?all=${showAll}`),
  getOne: (id) => request(`/products/${id}`)
}

// 图片上传
const BASE_URL = ''
export const uploadApi = {
  image: (file) => {
    const formData = new FormData()
    formData.append('image', file)
    const token = localStorage.getItem('token')
    return fetch(BASE_URL + '/api/upload/image', {
      method: 'POST',
      headers: { ...(token ? { Authorization: token } : {}) },
      body: formData
    }).then(res => res.json())
  }
}

// 管理员商品
export const adminProductApi = {
  add: (data) => request('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),
  toggleStatus: (id, status) => request(`/admin/products/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
}

// 获取后端基础URL（用于拼接图片路径）
export function getBaseUrl() {
  return window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : `${window.location.protocol}//${window.location.host}`
}


// 购物车
export const cartApi = {
  get: () => request('/cart'),
  add: (data) => request('/cart', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, quantity) => request(`/cart/${id}`, { method: 'PUT', body: JSON.stringify({ quantity }) }),
  remove: (id) => request(`/cart/${id}`, { method: 'DELETE' }),
  clear: () => request('/cart', { method: 'DELETE' })
}

// 订单
export const orderApi = {
  create: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  pay: (id, paymentMethod) => request(`/orders/${id}/pay`, { method: 'POST', body: JSON.stringify({ paymentMethod }) }),
  getList: () => request('/orders'),
  getOne: (id) => request(`/orders/${id}`),
  rebuy: (id) => request(`/orders/${id}/rebuy`, { method: 'POST' })
}

// 管理员订单
export const adminOrderApi = {
  getList: () => request('/admin/orders')
}
