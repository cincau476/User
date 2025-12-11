// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { loginUser } from '../api/apiService';

// Ikon Mata (untuk lihat password)
const EyeIcon = ({ visible }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    {visible ? (
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    )}
  </svg>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await loginUser(formData);
      const { token, user } = response.data;

      // Simpan di User App (biar aman)
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', user.role);

      // --- LOGIKA REDIRECT PENTING ---
      if (user.role === 'cashier') {
        // LEMPAR KE KASIR BAWA TOKEN
        window.location.href = `http://localhost:5175/pos?token=${token}`;
      } 
      else if (user.role === 'admin' || user.role === 'seller') {
        // LEMPAR KE DASHBOARD BAWA TOKEN (jika dashboard juga pisah port)
        window.location.href = `http://localhost:5176/?token=${token}`; 
      } 
      else {
        navigate('/');
      }
      
    } catch (err) {
      // ... (error handling)
    } finally {
      setLoading(false);
    }
};

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-700">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-orange-400 mb-2">Login Staff</h1>
            <p className="text-gray-400">Masuk sebagai Admin, Tenant, atau Kasir</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
              <input
                type="text"
                required
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                placeholder="Masukkan username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all pr-12"
                  placeholder="Masukkan password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? 'Memproses...' : 'Masuk Sekarang'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <button onClick={() => navigate('/')} className="text-gray-500 hover:text-white text-sm">
              &larr; Kembali ke Menu Pelanggan
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}