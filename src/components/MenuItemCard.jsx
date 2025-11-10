import React from 'react';

// Format harga ke Rupiah
const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

// Ganti nama prop 'onPesanClick' menjadi 'onCardClick' agar lebih jelas
export default function MenuItemCard({ menuItem, onCardClick }) { 
  const { name, description, price, stock, imageUrl } = menuItem;

  return (
    // Gunakan <button> agar seluruh area bisa difokuskan dan diklik
    // 'onCardClick' sekarang ada di sini, di elemen terluar
    <button 
      onClick={onCardClick} 
      className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg shadow-md w-full text-left hover:bg-gray-700 transition-colors"
    >
      {/* Gambar */}
      <img
        src={imageUrl}
        alt={name}
        className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-md bg-gray-700 flex-shrink-0"
      />
      
      {/* Info Menu */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-white truncate">{name}</h3>
        <p className="text-sm text-gray-400 mb-2 truncate">{description}</p>
        <p className="text-md font-bold text-orange-400 mb-1">{formatRupiah(price)}</p>
        <p className="text-xs text-gray-500">Stok: {stock} porsi</p>
      </div>

      {/* Tombol Pesan (Sekarang hanya visual, tidak ada onClick) */}
      <div className="ml-auto pl-2">
        <span className="bg-orange-600 text-white font-semibold px-6 py-2 rounded-full">
          Pesan
        </span>
      </div>
    </button>
  );
}