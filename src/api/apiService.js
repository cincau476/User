// src/api/apiService.js
import axios from 'axios';

export const BASE_URL = '/api';

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
  (response) => {
    // PERBAIKAN: Ekstrak otomatis array 'results' jika format dari backend adalah pagination
    if (response.data && response.data.results !== undefined) {
      response.data = response.data.results;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Cegah loop jika request ke /refresh itu sendiri yang gagal
    if (originalRequest.url.includes('/users/token/refresh/')) {
        return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
        
        // --- TAMBAHAN: Pintu Terbuka untuk Guest ---
        // Jika sedang mengakses detail pesanan dengan token guest, 
        // JANGAN lakukan redirect ke login meski token expired/invalid.
        if (originalRequest.url.includes('/orders/') && originalRequest.params?.token) {
            return Promise.reject(error);
        }

        // 1. JIKA SEDANG REFRESH: Masukkan request ini ke antrean (Queue)
        if (isRefreshing) {
            return new Promise(function(resolve, reject) {
                failedQueue.push({resolve, reject});
            }).then(token => {
                originalRequest.headers['Authorization'] = 'Bearer ' + token;
                return apiClient(originalRequest); 
            }).catch(err => {
                return Promise.reject(err);
            });
        }

        // 2. JIKA BELUM REFRESH: Kunci gembok (Mutex Lock)
        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const response = await axios.post(`${BASE_URL}/users/token/refresh/`, {}, {
                withCredentials: true 
            });
            
            const newAccessToken = response.data.access;
            localStorage.setItem('access_token', newAccessToken);
            
            apiClient.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
            originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
            
            processQueue(null, newAccessToken);
            return apiClient(originalRequest);

        } catch (refreshError) {
            processQueue(refreshError, null);
            localStorage.removeItem('access_token');
            // Force redirect hanya jika bukan halaman status pesanan
            window.location.href = '/login'; 
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
    
    return Promise.reject(error);
  }
);

// --- DAFTAR ENDPOINT API ---

export const loginUser = (credentials) => {
  return apiClient.post('/users/login/', credentials);
};

export const verifyMfaLogin = (temp_token, otp_code) => {
  return apiClient.post('/users/login/mfa/verify/', {
    temp_token,
    otp_code
  });
};

export const getStands = () => {
  return apiClient.get('/tenants/stands/'); 
};

export const getStandDetails = (standId) => {
  return apiClient.get(`/tenants/stands/${standId}/`);
};

export const getMenuForStand = (standId) => {
  return apiClient.get(`/tenants/stands/${standId}/menus/`);
};

export const createOrder = (orderData) => {
  return apiClient.post('/orders/create/', orderData); 
};

export const getOrderDetails = (orderUuid, token) => {
  const config = {};
  if (token) {
    config.params = { token: token };
  }
  return apiClient.get(`/orders/${orderUuid}/`, config);
};

export const cancelOrder = (orderUuid) => {
  return apiClient.post(`/orders/${orderUuid}/cancel/`);
};

export const getPopularMenus = () => {
  return apiClient.get('/orders/popular-menus/'); 
};

export default apiClient;
