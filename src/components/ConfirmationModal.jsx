import React, { useState, useMemo } from 'react';

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

export default function ConfirmationModal({ cart, stand, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState(''); // State baru untuk Email
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('TRANSFER'); 

  // Hitung total harga dari keranjang
  const totalPrice = useMemo(() => {
    return cart.reduce((total, item) => total + item.totalPrice, 0);
  }, [cart]);

  // Handle saat tombol konfirmasi ditekan
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validasi: Nama dan Email wajib diisi
    if (!name.trim()) {
      alert("Mohon isi Nama Anda");
      return;
    }
    if (!email.trim()) {
      alert("Mohon isi Email (Gmail) Anda untuk bukti pesanan");
      return;
    }
    if (!paymentMethod) {
      alert("Silakan pilih metode pembayaran");
      return;
    }
    
    // Kirim data ke StandDetailPage
    onSubmit({
      name,
      email,
      phone, // Opsional
      paymentMethod,
    });
  };

  return (
    // Latar belakang gelap (overlay)
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      
      {/* Konten Modal */}
      <div className="bg-gray-800 text-white w-full max-w-lg rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Konfirmasi Pesanan</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700">
            <CloseIcon />
          </button>
        </div>

        {/* Form (Bisa di-scroll) */}
        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="p-6 space-y-6">
            
            {/* Ringkasan Pesanan */}
            <div className="text-center">
              <p className="text-gray-400">Total Pembayaran ({cart.length} item)</p>
              <p className="text-3xl font-bold text-orange-400">{formatRupiah(totalPrice)}</p>
            </div>
            
            <hr className="border-gray-700" />

            {/* Input Form */}
            <div className="space-y-4">
              
              {/* Input Nama (Wajib) */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Nama <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama Anda"
                  required
                  className="w-full py-3 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Input Email (Wajib - Menggantikan WA sebagai syarat utama) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email (Gmail) <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contoh@gmail.com"
                  required
                  className="w-full py-3 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">Bukti pesanan akan dikirim ke email ini.</p>
              </div>

              {/* Input WhatsApp (Opsional) */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
                  Nomor WhatsApp (Opsional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08123456789"
                  className="w-full py-3 px-4 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <hr className="border-gray-700" />
            
            {/* Metode Pembayaran */}
            <div>
              <h4 className="text-lg font-semibold mb-2">Metode Pembayaran</h4>
              <div className="space-y-2">
                <label className="flex items-center p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600">
                  <input
                    type="radio"
                    name="payment"
                    value="TRANSFER"
                    checked={paymentMethod === 'TRANSFER'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="form-radio h-5 w-5 text-orange-500 bg-gray-600 border-gray-500"
                  />
                  <span className="ml-3">QRIS / Transfer Bank</span>
                </label>
                <label className="flex items-center p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600">
                  <input
                    type="radio"
                    name="payment"
                    value="CASH"
                    checked={paymentMethod === 'CASH'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="form-radio h-5 w-5 text-orange-500 bg-gray-600 border-gray-500"
                  />
                  <span className="ml-3">Tunai (Cash)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Tombol Submit */}
          <div className="p-4 border-t border-gray-700 bg-gray-800">
            <button
              type="submit"
              className="w-full bg-orange-600 text-white font-bold py-4 rounded-lg text-lg hover:bg-orange-700 transition-colors"
            >
              Konfirmasi Pesanan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}