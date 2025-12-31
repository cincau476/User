// src/pages/StandDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StandHeader from '../components/StandHeader';
import SearchBar from '../components/SearchBar';
import MenuItemCard from '../components/MenuItemCard';
import AddToCartModal from '../components/AddToCartModal';
import SimpleAddItemModal from '../components/SimpleAddItemModal';
import StickyCartFooter from '../components/StickyCartFooter';
import ConfirmationModal from '../components/ConfirmationModal';
import { getStandDetails, getMenuForStand, createOrder } from '../api/apiService';
import CartDetailModal from '../components/CartDetailModal'; 
import { v4 as uuidv4 } from 'uuid';

export default function StandDetailPage() {
  const { standId } = useParams(); 
  const navigate = useNavigate();
  const [stand, setStand] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cart, setCart] = useState([]);
  
  const [currentItem, setCurrentItem] = useState(null);
  const [isSimpleModalOpen, setSimpleModalOpen] = useState(false);
  const [isCustomizeModalOpen, setCustomizeModalOpen] = useState(false);
  const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [isCartDetailModalOpen, setCartDetailModalOpen] = useState(false); 

  // Muat data menu & stand
  useEffect(() => {
    // --- PENGECEKAN BARU ---
    // Jika standId kosong atau teks "undefined", jangan panggil API
    if (!standId || standId === 'undefined' || standId === 'null') {
        setError("Stand tidak ditemukan (ID Invalid). Silakan kembali ke menu utama dan pilih stand lagi.");
        setLoading(false);
        return; // BERHENTI DI SINI
    }
    // -----------------------

    const loadData = async () => {
      try {
        setLoading(true);
        const [standResponse, menuResponse] = await Promise.all([
          getStandDetails(standId),
          getMenuForStand(standId)
        ]);
        setStand(standResponse.data);
        // Validasi array di sini
        setMenuItems(Array.isArray(menuResponse.data) ? menuResponse.data : []);
        setError(null);
      } catch (err) {
        setError("Gagal memuat data stand.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [standId]);

  // --- Handler Modal Item ---
  const handleCardClick = (menuItem) => {
    setCurrentItem(menuItem);
    const hasVariants = menuItem.variant_groups && menuItem.variant_groups.length > 0;
    
    if (hasVariants) {
      setCustomizeModalOpen(true); 
    } else {
      setSimpleModalOpen(true); 
    }
  };

  const handleCloseSimpleModal = () => {
    setSimpleModalOpen(false);
    setCurrentItem(null);
  };

  const handleCloseCustomizeModal = () => {
    setCustomizeModalOpen(false);
    setCurrentItem(null);
  };

  const handleAddToCart = (itemData) => {
    const itemWithId = {
      ...itemData,
      cartItemUniqueId: uuidv4() 
    };
    setCart(prevCart => [...prevCart, itemWithId]);
    setSimpleModalOpen(false);
    setCustomizeModalOpen(false);
    setCurrentItem(null);
  };

  // --- Handler untuk CartDetailModal ---
  const handleOpenCartDetail = () => {
    setCartDetailModalOpen(true);
  };

  const handleCloseCartDetail = () => {
    setCartDetailModalOpen(false);
  };

  const handleUpdateCart = (cartItemUniqueId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.cartItemUniqueId !== cartItemUniqueId));
    } else {
      setCart(prevCart => prevCart.map(item => {
        if (item.cartItemUniqueId === cartItemUniqueId) {
          const pricePerUnit = item.totalPrice / item.quantity;
          return {
            ...item,
            quantity: newQuantity,
            totalPrice: pricePerUnit * newQuantity
          };
        }
        return item;
      }));
    }
  };
  
  const handleCheckoutFromCart = () => {
    handleCloseCartDetail();
    setConfirmationModalOpen(true);
  };

  // --- Handler Modal Konfirmasi (UPDATE DI SINI) ---
  const handleConfirmOrder = async (formData) => {
    if (!stand) return;

    // Siapkan data sesuai permintaan Backend (OrderCreateSerializer)
    const payload = {
      tenant: stand.id,
      name: formData.name,       // Wajib
      email: formData.email,     // Wajib
      phone: formData.phone || "", // Opsional (kirim string kosong jika tidak ada)
      payment_method: formData.paymentMethod, 
      items: cart.map(item => ({
          menu_item: item.menuItemId,
          qty: item.quantity,
          variants: item.selectedVariantIds || [],
          note: item.notes || ''
      }))
    };
    
    try {
      setLoading(true); 
      const response = await createOrder(payload);
      
      const newOrderUuid = response.data.order.uuid;
      
      // Arahkan ke halaman status pesanan
      navigate(`/order-status/${newOrderUuid}`);
      
      // Kosongkan keranjang dan tutup modal
      setCart([]);
      setConfirmationModalOpen(false);
      
    } catch (err) {
      console.error("Gagal membuat pesanan:", err);
      // Tampilkan pesan error yang lebih jelas
      let errorMsg = "Maaf, terjadi kesalahan saat membuat pesanan.";
      
      if (err.response?.data) {
        // Cek format error dari Django Rest Framework
        if (typeof err.response.data === 'string') {
           // Error berupa string langsung
           errorMsg = err.response.data;
        } else if (err.response.data.detail) {
           // Error umum (misal: "Tenant tidak ditemukan")
           errorMsg = err.response.data.detail;
        } else {
           // Error validasi per field (misal: "email": ["Enter a valid email address."])
           const fieldErrors = Object.keys(err.response.data).map(key => {
             const message = Array.isArray(err.response.data[key]) 
               ? err.response.data[key][0] 
               : err.response.data[key];
             return `${key}: ${message}`;
           });
           
           if (fieldErrors.length > 0) {
             errorMsg = "Periksa input Anda:\n" + fieldErrors.join("\n");
           }
        }
      }
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // --- Render ---
  if (loading && !isConfirmationModalOpen) { 
    return <Layout><p className="text-center">Memuat...</p></Layout>;
  }
  if (error) {
    return <Layout><p className="text-center text-red-400">{error}</p></Layout>;
  }

  return (
    <Layout>
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

      {isSimpleModalOpen && currentItem && (
        <SimpleAddItemModal 
          menuItem={currentItem} 
          onClose={handleCloseSimpleModal}
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
      
      {cart.length > 0 && !isSimpleModalOpen && !isCustomizeModalOpen && !isConfirmationModalOpen && !isCartDetailModalOpen && (
        <StickyCartFooter 
          cart={cart}
          onClick={handleOpenCartDetail} 
        />
      )}
      
      {isCartDetailModalOpen && (
        <CartDetailModal
          cart={cart}
          onClose={handleCloseCartDetail}
          onUpdateCart={handleUpdateCart}
          onCheckout={handleCheckoutFromCart}
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
