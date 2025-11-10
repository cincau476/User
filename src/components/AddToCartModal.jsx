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

export default function AddToCartModal({ menuItem, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  
  // State untuk melacak varian yang dipilih
  // Format: { groupId: optionId }
  // Contoh: { 1: "3", 2: "4" }
  const [selectedVariants, setSelectedVariants] = useState({});

  // Hitung total harga secara dinamis
  const totalPrice = useMemo(() => {
    // 1. Mulai dengan harga dasar item
    let basePrice = Number(menuItem.price) || 0;
    
    // 2. Tambahkan harga dari varian yang dipilih
    let variantPrice = 0;
    const allVariantGroups = menuItem.variant_groups || [];
    
    for (const groupId in selectedVariants) {
      const optionId = selectedVariants[groupId];
      const group = allVariantGroups.find(g => g.id.toString() === groupId);
      const option = group?.options.find(o => o.id.toString() === optionId.toString());
      
      if (option && option.price) {
        variantPrice += Number(option.price);
      }
    }

    // 3. Kalikan dengan kuantitas
    return (basePrice + variantPrice) * quantity;
    
  }, [menuItem, quantity, selectedVariants]);

  // Fungsi untuk memperbarui pilihan varian
  const handleVariantChange = (groupId, optionId) => {
    setSelectedVariants(prev => ({
      ...prev,
      [groupId.toString()]: optionId.toString(),
    }));
  };

  // Fungsi saat tombol "Add to cart" utama ditekan
  const handleSubmit = () => {
    // TODO: Tambahkan validasi di sini untuk memastikan semua grup 'Required' telah dipilih

    // Ubah objek selectedVariants menjadi array ID
    const selectedVariantIds = Object.values(selectedVariants).map(id => parseInt(id));

    // Siapkan data item untuk dikirim kembali ke StandDetailPage
    const itemData = {
      menuItemId: menuItem.id,
      name: menuItem.name,
      quantity: quantity,
      price: menuItem.price, // Harga dasar
      totalPrice: totalPrice, // Harga final
      selectedVariantIds: selectedVariantIds,
      notes: notes,
      // (Anda bisa tambahkan 'selectedVariants' penuh jika perlu)
    };
    
    // Panggil fungsi dari props
    onAddToCart(itemData);
  };

  if (!menuItem) return null;

  return (
    // Latar belakang gelap (overlay)
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      
      {/* Konten Modal */}
      <div className="bg-gray-900 text-white w-full max-w-lg rounded-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold">Customize the dish</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700">
            <CloseIcon />
          </button>
        </div>

        {/* --- Konten Utama (Bisa scroll) --- */}
        <div className="p-4 overflow-y-auto">
          
          {/* Info Item */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold">{menuItem.name}</h3>
            <span className="text-xl font-bold">{formatRupiah(menuItem.price)}</span>
          </div>

          {/* --- Render Varian Dinamis --- */}
          <div className="space-y-6">
            {(menuItem.variant_groups || []).map(group => (
              <div key={group.id}>
                <h4 className="text-lg font-semibold">{group.name}</h4>
                {/* TODO: Ganti ini dengan data 'required' asli dari API */}
                <p className="text-sm text-gray-400">Wajib • Pilih 1</p> 
                <div className="mt-2 space-y-2">
                  
                  {group.options.map(option => (
                    <label key={option.id} className="flex justify-between items-center p-3 bg-gray-800 rounded-lg">
                      <span>{option.name}</span>
                      <span className="text-green-400">
                        {option.price > 0 ? `+${formatRupiah(option.price)}` : 'Free'}
                      </span>
                      <input 
                        type="radio" 
                        name={`group-${group.id}`} // Unik per grup
                        value={option.id}
                        // Cek apakah opsi ini ada di state
                        checked={selectedVariants[group.id.toString()] === option.id.toString()}
                        // Perbarui state saat diubah
                        onChange={() => handleVariantChange(group.id, option.id)}
                        className="form-radio h-5 w-5 text-orange-500 bg-gray-700 border-gray-600 focus:ring-orange-500" 
                      />
                    </label>
                  ))}
                  
                </div>
              </div>
            ))}
          </div>
          
          <hr className="border-gray-700 my-6" />

          {/* --- Notes --- */}
          <div>
            <h4 className="text-lg font-semibold mb-2">Notes</h4>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              rows="3"
              placeholder="Contoh: Jangan pakai sayur..."
            ></textarea>
          </div>
        </div>

        {/* --- Footer (Quantity & Add Button) --- */}
        <div className="p-4 border-t border-gray-700 space-y-4 bg-gray-900">
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