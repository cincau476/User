import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { getOrderDetails, cancelOrder } from '../api/apiService';

// Helper format harga
const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

export default function OrderStatusPage() {
  const { orderUuid } = useParams(); // Ambil UUID dari URL
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(''); // Untuk pesan sukses/gagal

  // Fungsi untuk mengambil data pesanan
  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      setMessage('');
      const response = await getOrderDetails(orderUuid);
      setOrder(response.data);
      setError(null);
    } catch (err) {
      console.error("Gagal mengambil detail pesanan:", err);
      setError("Gagal menemukan detail pesanan Anda.");
    } finally {
      setLoading(false);
    }
  }, [orderUuid]);

  // Panggil fetchOrder saat halaman dimuat
  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Fungsi untuk membatalkan pesanan
  const handleCancelOrder = async () => {
    const confirmation = window.confirm("Apakah Anda yakin ingin membatalkan pesanan ini?");
    if (!confirmation) {
      return;
    }

    try {
      setMessage('Sedang membatalkan...');
      const response = await cancelOrder(orderUuid); // Panggil MOCK API
      setMessage(response.data.detail || 'Pesanan berhasil dibatalkan.');
      fetchOrder(); // Ambil ulang data pesanan untuk menunjukkan status "CANCELLED"
    } catch (err) {
      console.error("Gagal membatalkan pesanan:", err);
      const errorDetail = err.response?.data?.detail || "Gagal membatalkan pesanan.";
      setMessage(`Error: ${errorDetail}`);
    }
  };

  if (loading) {
    return <Layout><p className="text-center">Memuat detail pesanan...</p></Layout>;
  }

  if (error) {
    return <Layout><p className="text-center text-red-400">{error}</p></Layout>;
  }
  
  if (!order) {
    return <Layout><p className="text-center">Pesanan tidak ditemukan.</p></Layout>;
  }

  // Cek apakah tombol batal boleh muncul (sesuai backend)
  const canBeCancelled = order.status === 'AWAITING_PAYMENT' || order.status === 'EXPIRED';

  return (
    <Layout>
      <div className="max-w-xl mx-auto bg-gray-800 rounded-lg shadow-xl p-6">
        <h2 className="text-2xl font-bold text-center mb-4">Detail Pesanan Anda</h2>
        
        {message && (
          <div className={`p-3 rounded-lg mb-4 ${message.startsWith('Error:') ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
            {message}
          </div>
        )}

        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-400">Status:</span>
            <span className="font-semibold text-orange-400">{order.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Kode Referensi:</span>
            <span className="font-semibold">{order.references_code}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Stand:</span>
            <span className="font-semibold">{order.tenant.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Pembayaran:</span>
            <span className="font-semibold">{order.payment_method}</span>
          </div>
        </div>

        <hr className="border-gray-600 my-4" />

        <h3 className="text-lg font-semibold mb-2">Item yang Dipesan:</h3>
        <div className="space-y-2 mb-6">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <div>
                {/* 'menu_item.name' berasal dari MOCK_DB */}
                <p className="font-semibold">{item.menu_item.name} x {item.qty}</p>
              </div>
              <p>{formatRupiah(item.price * item.qty)}</p>
            </div>
          ))}
        </div>
        
        <hr className="border-gray-600 my-4" />

        <div className="flex justify-between text-xl font-bold mb-6">
          <span>Total:</span>
          <span>{formatRupiah(order.total)}</span>
        </div>

        {canBeCancelled && (
          <button
            onClick={handleCancelOrder}
            className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700"
          >
            Batalkan Pesanan
          </button>
        )}

        <Link 
          to={`/stand/${order.tenant.id}`} 
          className="block text-center mt-4 text-orange-400 hover:text-orange-300"
        >
          Kembali ke Stand
        </Link>
      </div>
    </Layout>
  );
}