import React, { useMemo } from 'react';

// Ikon keranjang (SVG)
const CartIcon = () => (
  <svg xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M3.75 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm0 0h16.5m0 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm0 0H3.75m16.5 0-1.5-6a1.125 1.125 0 0 0-1.125-1.125H5.625M17.25 6H3.75" />
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

export default function StickyCartFooter({ cart, onClick }) {
  
  // Hitung total item dan total harga
  const { totalItems, totalPrice } = useMemo(() => {
    let items = 0;
    let price = 0;
    for (const item of cart) {
      items += item.quantity;
      price += item.totalPrice;
    }
    return { totalItems: items, totalPrice: price };
  }, [cart]);

  return (
    // 'fixed' untuk menempel di bawah, 'z-40' agar di atas konten
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4">
      {/* 'max-w-4xl mx-auto' agar lebarnya sama dengan Layout */}
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={onClick}
          className="w-full flex justify-between items-center bg-green-600 text-white p-4 rounded-lg shadow-lg"
        >
          <div className="flex items-center gap-3">
            <span className="bg-green-700 p-1 rounded-md">
              <CartIcon />
            </span>
            <span className="font-semibold text-lg">{totalItems} item</span>
          </div>
          <span className="font-bold text-lg">{formatRupiah(totalPrice)}</span>
        </button>
      </div>
    </div>
  );
}