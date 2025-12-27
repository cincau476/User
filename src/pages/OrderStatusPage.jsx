import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getOrderDetails } from '../api/apiService';

const CheckIcon = () => (
  <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const WaitingIcon = () => (
  <svg className="w-16 h-16 text-orange-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function OrderStatusPage() {
  const { orderUuid } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // Mengambil guest token jika ada untuk bypass permission IsGuestOrderOwner
        const guestToken = localStorage.getItem(`token_${orderUuid}`);
        const response = await getOrderDetails(orderUuid, guestToken);
        setOrder(response.data);
      } catch (err) {
        console.error(err);
        setError('Gagal memuat detail pesanan.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
    
    // Auto-refresh setiap 30 detik untuk memantau perubahan status (PAID/READY)
    const interval = setInterval(fetchOrder, 30000);
    return () => clearInterval(interval);
  }, [orderUuid]);

  if (loading) return (
    <Layout>
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    </Layout>
  );

  if (error || !order) return (
    <Layout>
      <div className="text-center mt-20 p-4">
        <p className="text-red-500 text-xl font-semibold">{error || "Pesanan tidak ditemukan"}</p>
        <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg">Kembali ke Menu</button>
      </div>
    </Layout>
  );

  // Mapping data sesuai serializer backend
  const customerName = order.customer?.name || "Pelanggan";
  const customerEmail = order.customer?.email || "Email Anda";
  const isCash = order.payment_method === 'CASH';
  const isPaid = ['PAID', 'PROCESSING', 'READY', 'COMPLETED'].includes(order.status);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-10 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          
          <div className="bg-white p-8 text-center border-b border-gray-100">
            {isPaid ? <CheckIcon /> : <WaitingIcon />}
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {isPaid ? "Pembayaran Berhasil!" : "Menunggu Pembayaran"}
            </h1>
            <p className="text-gray-600">
              Halo, <span className="font-bold text-gray-900">{customerName}</span>
            </p>
            <div className="mt-4 p-4 bg-blue-50 text-blue-800 text-sm rounded-lg">
              Invoice dan instruksi telah dikirim ke: <br/>
              <span className="font-bold underline">{customerEmail}</span>
            </div>
          </div>

          <div className="p-6 bg-gray-50">
            <div className={`p-4 rounded-xl border-l-4 shadow-sm ${isPaid ? 'bg-green-50 border-green-500 text-green-800' : 'bg-yellow-50 border-yellow-400 text-yellow-800'}`}>
              <h3 className="font-bold text-lg mb-1">Status Pesanan: {order.status}</h3>
              {isPaid ? (
                 <p>Pesanan Anda sedang diproses. Silakan tunggu notifikasi selanjutnya.</p>
              ) : (
                <>
                  {isCash ? (
                    <div>
                      <p className="font-medium">Metode: Tunai (CASH)</p>
                      <p className="mt-2 text-sm">Silakan lakukan pembayaran di Kasir dengan menunjukkan PIN berikut:</p>
                      {order.cashier_pin && (
                        <div className="mt-3 text-center bg-white p-3 rounded-lg border-2 border-yellow-300">
                          <span className="text-xs text-gray-500 uppercase font-bold">PIN PEMBAYARAN</span>
                          <div className="text-3xl font-mono font-bold tracking-[0.5em] text-gray-800">{order.cashier_pin}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium">Metode: Transfer / QRIS</p>
                      {order.meta?.payment?.va_number ? (
                        <div className="mt-3 bg-white p-3 rounded border border-indigo-200">
                          <p className="text-xs text-gray-500">Virtual Account ({order.meta.payment.bank}):</p>
                          <p className="text-xl font-mono font-bold">{order.meta.payment.va_number}</p>
                        </div>
                      ) : (
                        <p className="mt-2 text-sm italic">Menunggu instruksi pembayaran...</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-gray-500 text-sm font-bold uppercase tracking-wide mb-4">Ringkasan Pesanan</h3>
            <div className="space-y-4">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-sm">
                  <div className="flex-1">
                    <span className="font-bold text-gray-800">{item.qty}x</span>{' '}
                    <span className="font-medium text-gray-800">{item.menu_item?.name || "Menu"}</span>
                    
                    {/* Render varian dari selected_variants backend */}
                    {item.selected_variants?.length > 0 && (
                      <div className="text-xs text-gray-500 italic pl-6">
                        + {item.selected_variants.map(v => v.name).join(', ')}
                      </div>
                    )}
                    
                    {item.note && <div className="text-xs text-gray-400 pl-6 mt-1">Catatan: {item.note}</div>}
                  </div>
                  <div className="font-semibold text-gray-700">
                    Rp {(parseFloat(item.price) * item.qty).toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-dashed border-gray-300 flex justify-between items-center">
              <span className="font-bold text-gray-800 text-lg">Total Pembayaran</span>
              <span className="font-black text-2xl text-orange-600">
                Rp {parseFloat(order.total).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <div className="p-6 pt-0">
            <button 
              onClick={() => navigate('/')} 
              className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95"
            >
              Kembali ke Beranda
            </button>
          </div>

        </div>
      </div>
    </Layout>
  );
}