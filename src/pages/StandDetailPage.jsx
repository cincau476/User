import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import Layout from '../components/Layout';
import StandHeader from '../components/StandHeader';
import SearchBar from '../components/SearchBar';
import MenuItemCard from '../components/MenuItemCard';
import AddToCartModal from '../components/AddToCartModal';
import SimpleAddItemModal from '../components/SimpleAddItemModal';
import StickyCartFooter from '../components/StickyCartFooter';
import ConfirmationModal from '../components/ConfirmationModal';
import { getStandDetails, getMenuForStand, createOrder } from '../api/apiService';

export default function StandDetailPage() {
  const { standId } = useParams(); 
  const navigate = useNavigate(); // Inisialisasi useNavigate
  const [stand, setStand] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk Keranjang
  const [cart, setCart] = useState([]);
  
  // State untuk Modal
  const [currentItem, setCurrentItem] = useState(null);
  const [isSimpleModalOpen, setSimpleModalOpen] = useState(false);
  const [isCustomizeModalOpen, setCustomizeModalOpen] = useState(false);
  const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);

  // Muat data menu & stand
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [standResponse, menuResponse] = await Promise.all([
          getStandDetails(standId),
          getMenuForStand(standId)
        ]);
        setStand(standResponse.data);
        setMenuItems(menuResponse.data);
      } catch (err) {
        console.error("Gagal memuat data:", err);
        setError("Gagal memuat data stand. Coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [standId]);

  // --- Handler Modal Item ---
  const handleCardClick = (menuItem) => {
    setCurrentItem(menuItem);
    setSimpleModalOpen(true); // Selalu buka modal sederhana dulu
  };

  const handleCloseSimpleModal = () => {
    setSimpleModalOpen(false);
    setCurrentItem(null);
  };

  const handleCloseCustomizeModal = () => {
    setCustomizeModalOpen(false);
    setCurrentItem(null);
  };

  // Dipanggil dari modal sederhana jika item punya varian
  const handleCustomize = (menuItem) => {
    setSimpleModalOpen(false); // Tutup modal simple
    setCustomizeModalOpen(true); // Buka modal kustomisasi
  };

  // Dipanggil dari kedua modal (Simple/Customize)
  const handleAddToCart = (itemData) => {
    // TODO: Logika untuk menggabungkan item jika sudah ada di keranjang
    setCart(prevCart => [...prevCart, itemData]);
    
    // Tutup semua modal item
    setSimpleModalOpen(false);
    setCustomizeModalOpen(false);
    setCurrentItem(null);
  };

  // --- Handler Modal Konfirmasi ---
  
  // Dipanggil dari StickyCartFooter
  const handleOpenConfirmation = () => {
    setConfirmationModalOpen(true);
  };

  // Dipanggil dari ConfirmationModal
  const handleConfirmOrder = async (formData) => {
    if (!stand) return;

    // Siapkan payload sesuai OrderCreateSerializer
    const payload = {
      tenant: stand.id,
      phone: formData.phone || null,
      payment_method: formData.paymentMethod, // 'CASH' atau 'TRANSFER'
      items: cart.map(item => ({
          menu_item: item.menuItemId,
          qty: item.quantity,
          variants: item.selectedVariantIds || [],
          price: item.price // Diperlukan untuk MOCK createOrder
      }))
    };
    
    try {
      setLoading(true); // Tampilkan loading
      const response = await createOrder(payload); // Panggil MOCK API
      
      // Ambil UUID dari respon
      const newOrderUuid = response.data.order.uuid;
      
      // **REDIRECT KE HALAMAN STATUS**
      navigate(`/order-status/${newOrderUuid}`);
      
      // Kosongkan keranjang
      setCart([]);
      setConfirmationModalOpen(false);
      
    } catch (err) {
      console.error("Gagal membuat pesanan:", err);
      alert("Maaf, terjadi kesalahan saat membuat pesanan.");
    } finally {
      setLoading(false);
    }
  };


  // --- Render ---
  if (loading && !isConfirmationModalOpen) { // Jangan tunjukkan loading halaman saat loading pesanan
    return <Layout><p className="text-center">Memuat...</p></Layout>;
  }
  if (error) {
    return <Layout><p className="text-center text-red-400">{error}</p></Layout>;
  }

  return (
    <Layout>
      {/* Tambahkan padding-bottom agar tidak tertutup sticky footer */}
      <div className="pb-32">
        <StandHeader stand={stand} />
        
        <div className="mt-4">
          <SearchBar />
        </div>

        <section className="mt-6">
          <h2 className="text-2xl font-bold mb-4">List Makanan</h2>
          <div className="flex flex-col gap-4">
            {menuItems.map(item => (
              <MenuItemCard 
                key={item.id} 
                menuItem={item} 
                onCardClick={() => handleCardClick(item)} 
              />
            ))}
          </div>
        </section>
      </div>

      {/* --- Render Modal & Footer --- */}

      {isSimpleModalOpen && currentItem && (
        <SimpleAddItemModal 
          menuItem={currentItem} 
          onClose={handleCloseSimpleModal}
          onCustomize={handleCustomize}
          onAddToCart={handleAddToCart}
        />
      )}

      {isCustomizeModalOpen && currentItem && (
        <AddToCartModal 
          menuItem={currentItem} 
          onClose={handleCloseCustomizeModal}
          onAddToCart={handleAddToCart}
        />
      )}
      
      {/* Footer Keranjang (Hanya muncul jika ada isi & modal lain tertutup) */}
      {cart.length > 0 && !isSimpleModalOpen && !isCustomizeModalOpen && !isConfirmationModalOpen && (
        <StickyCartFooter 
          cart={cart}
          onClick={handleOpenConfirmation}
        />
      )}
      
      {isConfirmationModalOpen && (
        <ConfirmationModal
          cart={cart}
          stand={stand}
          onClose={() => setConfirmationModalOpen(false)}
          onSubmit={handleConfirmOrder}
        />
      )}
    </Layout>
  );
}