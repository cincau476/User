// src/api/apiService.js
import axios from 'axios';

// URL Dasar Backend
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: BASE_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

/**
 * Login User (untuk Seller/Kasir)
 */
export const loginUser = (credentials) => {
  return apiClient.post('/users/login/', credentials);
};

/**
 * Mengambil daftar semua stand (tenant)
 */
export const getStands = () => {
  return apiClient.get('/tenants/stands/'); 
};

/**
 * Mengambil detail satu stand
 */
export const getStandDetails = (standId) => {
  return apiClient.get(`/tenants/stands/${standId}/`);
};

/**
 * Mengambil list menu untuk satu stand
 */
export const getMenuForStand = (standId) => {
  return apiClient.get(`/tenants/stands/${standId}/menus/`);
};

/**
 * Membuat pesanan baru
 */
export const createOrder = (orderData) => {
  return apiClient.post('/orders/create/', orderData); 
};

/**
 * Mengambil detail pesanan
 * PERBAIKAN PENTING: Menerima parameter 'token' untuk Guest Access
 */
export const getOrderDetails = (orderUuid, token) => {
  const config = {};
  
  // Jika ada token (dari localStorage), kirim sebagai query param
  if (token) {
    config.params = { token: token };
  }
  
  // Request akan menjadi: /orders/<uuid>/?token=...
  return apiClient.get(`/orders/${orderUuid}/`, config);
};

/**
 * Membatalkan pesanan
 */
export const cancelOrder = (orderUuid) => {
  return apiClient.post(`/orders/${orderUuid}/cancel/`);
};

/**
 * Mengambil menu-menu populer
 */
export const getPopularMenus = () => {
  return apiClient.get('/orders/popular-menus/'); 
};

export default apiClient;
