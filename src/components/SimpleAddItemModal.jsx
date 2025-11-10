import React, { useState, useMemo } from 'react';
import QuantityStepper from './QuantityStepper';

// --- Helper Components ---

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

export default function SimpleAddItemModal({ menuItem, onClose, onCustomize, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);

  // Hitung total harga
  const totalPrice = useMemo(() => {
    return (Number(menuItem.price) || 0) * quantity;
  }, [menuItem, quantity]);

  // Handle saat tombol "Add to cart" ditekan
  const handleSubmit = () => {
    const hasVariants = menuItem.variant_groups && menuItem.variant_groups.length > 0;

    if (hasVariants) {
      // 1. Jika item ini punya varian (seharusnya tidak terjadi, tapi aman)
      //    Panggil 'onCustomize' untuk membuka modal kustomisasi
      onCustomize(menuItem);
    } else {
      // 2. Jika item ini tidak punya varian (sesuai harapan)
      //    Siapkan data item untuk dikirim ke keranjang
      const itemData = {
        menuItemId: menuItem.id,
        name: menuItem.name,
        quantity: quantity,
        price: menuItem.price, // Harga satuan
        totalPrice: totalPrice, // Harga total (harga * kuantitas)
        selectedVariantIds: [], // Tidak ada varian
        notes: '', // Tidak ada catatan di modal ini
      };
      
      // Kirim data item ke StandDetailPage
      onAddToCart(itemData);
    }
  };

  if (!menuItem) return null;

  return (
    // Latar belakang gelap (overlay)
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-end justify-center z-50 p-4">
      
      {/* Konten Modal (muncul dari bawah) */}
      <div 
        className="bg-gray-800 text-white w-full max-w-lg rounded-t-2xl shadow-xl overflow-hidden"
      >
        {/* Tombol Close di pojok */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-white bg-gray-900 bg-opacity-50 p-1 rounded-full z-10 hover:bg-gray-700"
        >
          <CloseIcon />
        </button>

        {/* Gambar Item */}
        <img 
          src={menuItem.imageUrl} 
          alt={menuItem.name} 
          className="w-full h-64 object-cover" 
        />
        
        {/* --- Konten --- */}
        <div className="p-6 space-y-4">
          
          {/* Info Item */}
          <h2 className="text-2xl font-bold">{menuItem.name}</h2>
          <p className="text-2xl font-bold text-orange-400">{formatRupiah(menuItem.price)}</p>
          <p className="text-gray-400">{menuItem.description}</p>
          
          <hr className="border-gray-700" />

          {/* --- Quantity & Add Button --- */}
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold">Item quantity</h4>
            <QuantityStepper quantity={quantity} setQuantity={setQuantity} />
          </div>
          <button
            onClick={handleSubmit}
            className="w-full bg-orange-600 text-white font-bold py-4 rounded-lg text-lg hover:bg-orange-700"
          >
            Add to cart - {formatRupiah(totalPrice)}
          </button>
        </div>
      </div>
    </div>
  );
}