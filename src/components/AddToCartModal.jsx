// src/components/CartDetailModal.jsx
import React, { useMemo, useState } from 'react';
import QuantityStepper from './QuantityStepper';

// --- Helper Components ---

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

// --- Main Component ---

export default function CartDetailModal({ cart, onClose, onUpdateCart, onCheckout }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hitung total harga berdasarkan data dari backend
  const totalPrice = useMemo(() => {
    return cart.reduce((total, item) => total + item.totalPrice, 0);
  }, [cart]);

  const handleQuantityChange = (cartItemUniqueId, newQuantity) => {
    onUpdateCart(cartItemUniqueId, newQuantity);
  };

  /**
   * Fungsi handleCheckoutInternal
   * Menangani proteksi rate limit (Throttling) yang dikonfigurasi di backend (5/min)
   *
   */
  const handleCheckoutInternal = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      // Logic checkout akan memicu CreateOrderView di backend
      await onCheckout(); 
    } catch (error) {
      // Menangani status 429 Too Many Requests dari AnonRateThrottle di backend
      if (error.response?.status === 429) {
        alert("Terlalu banyak mencoba. Harap tunggu 1 menit sebelum membuat pesanan kembali.");
      } else {
        alert("Gagal membuat pesanan. Silakan coba lagi.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getItemName = (item) => {
    // Menampilkan nama varian jika ada, sinkron dengan VariantOptionSerializer
    const variantNames = item.selectedVariants?.map(v => v.name).join(', ');
    if (variantNames) {
      return `${item.name} (${variantNames})`;
    }
    return item.name; 
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 text-white w-full max-w-lg rounded-lg shadow-xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Keranjang Anda</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700">
            <CloseIcon />
          </button>
        </div>

        {/* Daftar Item */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {cart.length === 0 ? (
            <p className="text-gray-400 text-center">Keranjang Anda kosong.</p>
          ) : (
            cart.map((item) => (
              <div key={item.cartItemUniqueId} className="flex justify-between items-center gap-4 border-b border-gray-700 pb-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{getItemName(item)}</p>
                  <p className="text-sm text-gray-400">
                    {formatRupiah(item.price)} x {item.quantity}
                  </p>
                  {item.notes && <p className="text-xs text-orange-400 mt-1 italic">Catatan: {item.notes}</p>}
                </div>
                <div className="ml-auto">
                  <QuantityStepper 
                    quantity={item.quantity}
                    minQuantity={0} 
                    setQuantity={(newQtyCallback) => {
                       const newQty = typeof newQtyCallback === 'function' 
                         ? newQtyCallback(item.quantity) 
                         : newQtyCallback;
                       handleQuantityChange(item.cartItemUniqueId, newQty);
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Tombol Checkout */}
        <div className="p-4 border-t border-gray-700 bg-gray-800">
          <button
            onClick={handleCheckoutInternal}
            disabled={cart.length === 0 || isSubmitting}
            className="w-full bg-orange-600 text-white font-bold py-4 rounded-lg text-lg hover:bg-orange-700 disabled:opacity-50 disabled:bg-gray-600 transition-colors"
          >
            {isSubmitting ? "Memproses..." : `Lanjut ke Konfirmasi - ${formatRupiah(totalPrice)}`}
          </button>
        </div>
      </div>
    </div>
  );
}