// src/pages/OrderStatusPage.jsx
// +++ MODIFIKASI: Tambahkan 'useRef' +++
import React, { useState, useEffect, useCallback, useRef } from 'react';
// +++ AKHIR MODIFIKASI +++
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getOrderDetails, cancelOrder } from '../api/apiService';

// (formatRupiah helper tidak berubah)
// ...

export default function OrderStatusPage() {
  const { orderUuid } = useParams(); 
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true); // <-- Set default ke true
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(''); 

  // +++ TAMBAHAN: Ref untuk menyimpan ID interval +++
  const intervalRef = useRef(null);
  // +++ AKHIR TAMBAHAN +++

  // +++ MODIFIKASI: Hapus 'setLoading(true)' dari sini +++
  const fetchOrder = useCallback(async () => {
    try {
      // setLoading(true); // <-- Dihapus dari sini
      setMessage('');
      const response = await getOrderDetails(orderUuid);
      setOrder(response.data);
      setError(null);
    } catch (err) {
      console.error("Gagal mengambil detail pesanan:", err);
      setError("Gagal menemukan detail pesanan Anda.");
    } finally {
      // Selalu set loading false setelah fetch, 
      // baik itu fetch awal atau polling
      setLoading(false); 
    }
  }, [orderUuid]);
  // +++ AKHIR MODIFIKASI +++

  // +++ MODIFIKASI: Logika useEffect utama untuk polling +++
  useEffect(() => {
    // 1. Set loading true HANYA saat komponen pertama kali mount
    setLoading(true);
    
    // 2. Panggil sekali untuk memuat data awal
    fetchOrder();

    // 3. Hapus interval lama jika ada (untuk keamanan)
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // 4. Set interval baru untuk polling
    intervalRef.current = setInterval(() => {
      fetchOrder(); // Panggil fetchOrder setiap 10 detik
    }, 10000); // 10000 ms = 10 detik

    // 5. Fungsi cleanup saat komponen unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchOrder]); // Hanya dijalankan sekali saat mount
  // +++ AKHIR MODIFIKASI +++

  // +++ TAMBAHAN: useEffect untuk memantau 'order' dan menghentikan polling +++
  useEffect(() => {
    // Cek jika order sudah ada dan statusnya final
    if (order && (order.status === 'COMPLETED' || order.status === 'CANCELLED' || order.status === 'EXPIRED')) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current); // Hentikan polling
        intervalRef.current = null; // Bersihkan ref
      }
    }
  }, [order]); // Dijalankan setiap kali state 'order' berubah
  // +++ AKHIR TAMBAHAN +++


  // (handleCancelOrder tidak berubah)
  // ...

  if (loading) {
    return <Layout><p className="text-center">Memuat detail pesanan...</p></Layout>;
  }

  if (error) {
    return <Layout><p className="text-center text-red-400">{error}</p></Layout>;
  }
  
  if (!order) {
    return <Layout><p className="text-center">Pesanan tidak ditemukan.</p></Layout>;
  }

  // Cek apakah tombol batal boleh muncul
  const canBeCancelled = order.status === 'AWAITING_PAYMENT' || order.status === 'EXPIRED';

  // (Return JSX tidak berubah)
  return (
    <Layout>
      <div className="max-w-xl mx-auto bg-gray-800 rounded-lg shadow-xl p-6">
        {/* ... (seluruh JSX Anda yang sudah ada) ... */}
      </div>
    </Layout>
  );
}