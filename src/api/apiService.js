// src/api/apiService.js
import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const apiClient = axios.create({
  baseURL: BASE_URL, 
  timeout: 10000, 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json', 
  },
  withCredentials: true, // WAJIB TRUE agar browser otomatis mengirim HttpOnly Cookie
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

// State untuk Mutex Lock (Mencegah Race Condition saat token expired)
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; 
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Cegah loop jika request ke /refresh itu sendiri yang gagal
    if (originalRequest.url.includes('/users/token/refresh/')) {
        return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
        
        // 1. JIKA SEDANG REFRESH: Masukkan request ini ke antrean (Queue)
        if (isRefreshing) {
            return new Promise(function(resolve, reject) {
                failedQueue.push({resolve, reject});
            }).then(token => {
                originalRequest.headers['Authorization'] = 'Bearer ' + token;
                return apiClient(originalRequest); // Jalankan ulang setelah token baru didapat
            }).catch(err => {
                return Promise.reject(err);
            });
        }

        // 2. JIKA BELUM REFRESH: Kunci gembok (Mutex Lock)
        originalRequest._retry = true;
        isRefreshing = true;

        try {
            // Panggil endpoint refresh. TIDAK PERLU mengirim body {refresh: ...}
            // karena browser otomatis menempelkan HttpOnly Cookie berkat withCredentials: true
            const response = await axios.post(`${BASE_URL}/users/token/refresh/`, {}, {
                withCredentials: true 
            });
            
            const newAccessToken = response.data.access;
            localStorage.setItem('access_token', newAccessToken);
            
            // Ubah header request yang gagal tadi dengan token baru
            apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
            originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
            
            // Buka gembok & jalankan semua request yang ngantre
            processQueue(null, newAccessToken);
            return apiClient(originalRequest);

        } catch (refreshError) {
            // Refresh gagal (cookie hilang/expired/blacklist)
            processQueue(refreshError, null);
            localStorage.removeItem('access_token');
            // Jika ada context, panggil fungsi logout. Jika tidak, force redirect:
            window.location.href = '/login'; 
            return Promise.reject(refreshError);
        } finally {
            // Pastikan gembok selalu dibuka di akhir proses
            isRefreshing = false;
        }
    }
    
    return Promise.reject(error);
  }
);

// ... (Export API lainnya tetap sama seperti sebelumnya) ...


// ==========================================================
// DAFTAR ENDPOINT API
// Sinkron dengan prefix path di canteen/urls.py
// ==========================================================

/**
 * Login User (untuk Seller/Kasir/Admin)
 * Pastikan backend di endpoint /users/login/ mengembalikan { access: "...", refresh: "..." }
 */
export const loginUser = (credentials) => {
  return apiClient.post('/users/login/', credentials);
};

// --- TAMBAHKAN FUNGSI INI UNTUK VERIFIKASI MFA ---
/**
 * Verifikasi OTP untuk menyelesaikan login MFA
 */
export const verifyMfaLogin = (temp_token, otp_code) => {
  return apiClient.post('/users/login/mfa/verify/', {
    temp_token,
    otp_code
  });
};
// -------------------------------------------------

/**
 * Verifikasi OTP untuk menyelesaikan login


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
 * Menerima parameter 'token' untuk Guest Access jika tidak login
 */
export const getOrderDetails = (orderUuid, token) => {
  const config = {};
  
  if (token) {
    config.params = { token: token };
  }
  
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