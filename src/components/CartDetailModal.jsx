// src/components/CartDetailModal.jsx
import React, { useMemo } from 'react';
import QuantityStepper from './QuantityStepper';

// --- Helper Components (Salin dari AddToCartModal.jsx) ---

// Ikon X untuk menutup
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

// Format harga ke Rupiah
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
  
  // Hitung total harga
  const totalPrice = useMemo(() => {
    return cart.reduce((total, item) => total + item.totalPrice, 0);
  }, [cart]);

  // Fungsi untuk menangani perubahan kuantitas
  const handleQuantityChange = (cartItemUniqueId, newQuantity) => {
    // Panggil fungsi update dari StandDetailPage
    onUpdateCart(cartItemUniqueId, newQuantity);
  };
  
  // Fungsi untuk mendapatkan nama item (termasuk varian jika ada)
  const getItemName = (item) => {
    // TODO: Anda bisa buat ini lebih canggih jika Anda menyimpan
    // data 'selectedVariants' di keranjang
    if (item.notes) {
      return `${item.name} (${item.notes})`;
    }
    return item.name; 
  };

  return (
    // Latar belakang gelap (overlay)
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      
      {/* Konten Modal */}
      <div className="bg-gray-800 text-white w-full max-w-lg rounded-lg shadow-xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Keranjang Anda</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700">
            <CloseIcon />
          </button>
        </div>

        {/* Daftar Item (Scrollable) */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {cart.length === 0 ? (
            <p className="text-gray-400 text-center">Keranjang Anda kosong.</p>
          ) : (
            cart.map((item) => (
              <div key={item.cartItemUniqueId} className="flex justify-between items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{getItemName(item)}</p>
                  <p className="text-sm text-gray-400">{formatRupiah(item.totalPrice)}</p>
                </div>
                <div className="ml-auto">
                  <QuantityStepper 
                    quantity={item.quantity}
                    minQuantity={0} // <-- Izinkan kuantitas 0 (untuk menghapus)
                    setQuantity={(newQtyCallback) => {
                       // Hitung kuantitas baru berdasarkan callback
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
            onClick={onCheckout}
            disabled={cart.length === 0}
            className="w-full bg-orange-600 text-white font-bold py-4 rounded-lg text-lg hover:bg-orange-700 disabled:opacity-50"
          >
            Lanjut ke Konfirmasi - {formatRupiah(totalPrice)}
          </button>
        </div>
      </div>
    </div>
  );
}