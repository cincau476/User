import axios from 'axios';

// 1. Tentukan URL dasar backend
// Ini adalah alamat server Django Anda
export const BASE_URL = 'http://localhost:8000';

// 2. Tentukan URL API (dengan '/api' jika Anda menambahkannya di urls.py utama)
// Berdasarkan file urls.py Anda, sepertinya Anda TIDAK menggunakan /api/
// Jadi kita akan gunakan BASE_URL saja.
// Mari kita cek...
// urls.py Anda mendaftarkan 'stands', 'create/', dll. di root.
// Jadi, API_URL adalah BASE_URL itu sendiri.
const API_URL = 'http://localhost:8000/api';


const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Penting untuk mengirim 'session cookie' (untuk IsGuestOrderOwner)
  withCredentials: true, 
});

/**
 * Mengambil daftar semua stand (tenant)
 * LIVE - Terhubung ke StandViewSet
 */
export const loginUser = (credentials) => {
  // credentials: { username: "...", password: "..." }
  return apiClient.post('/users/login/', credentials);
};

export const getStands = () => {
  return apiClient.get('/tenants/stands/'); 
};

/**
 * Mengambil detail satu stand (MOCK)
 * LIVE - Terhubung ke StandViewSet (retrieve)
 */
export const getStandDetails = (standId) => {
  return apiClient.get(`/tenants/stands/${standId}/`);
};

/**
 * Mengambil list menu untuk satu stand (MOCK)
 * LIVE - Terhubung ke MenuItemViewSet
 */
export const getMenuForStand = (standId) => {
  // Backend Anda menggunakan: /api/tenants/stands/<id>/menus/
  return apiClient.get(`/tenants/stands/${standId}/menus/`);
};

/**
 * Membuat pesanan baru
 * LIVE - Terhubung ke CreateOrderView
 */
export const createOrder = (orderData) => {
  // BENAR: Hasilnya http://localhost:8000/api/orders/create/
  return apiClient.post('/orders/create/', orderData); 
};

/**
 * Mengambil detail pesanan (MOCK)
 * LIVE - Terhubung ke OrderDetailView
 */
export const getOrderDetails = (orderUuid) => {
  return apiClient.get(`/orders/${orderUuid}/`);
};

/**
 * Membatalkan pesanan (MOCK)
 * LIVE - Terhubung ke CancelOrderView
 */
export const cancelOrder = (orderUuid) => {
  // BENAR: Hasilnya http://localhost:8000/api/orders/<uuid>/cancel/
  return apiClient.post(`/orders/${orderUuid}/cancel/`);
};


// --- FUNGSI MOCK (BELUM ADA DI BACKEND) ---

/**
 * Mengambil menu-menu populer
 * !!! MASIH MOCK !!!
 * Backend Anda tidak memiliki endpoint untuk ini.
 */
export const getPopularMenus = () => {
  // SEBELUMNYA (Salah):
  // return apiClient.get('/popular-menus/');
  
  // PERBAIKAN (Benar):
  // Tambahkan '/orders' di depannya agar sesuai dengan backend
  return apiClient.get('/orders/popular-menus/'); 
};

export default apiClient;