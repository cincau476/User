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

// Impor untuk fitur keranjang
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

  // +++ INI ADALAH PERBAIKAN PENTING +++
  // Muat data menu & stand
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true); // Pastikan loading true di awal
        const [standResponse, menuResponse] = await Promise.all([
          getStandDetails(standId),
          getMenuForStand(standId) // Ini memanggil MenuItemViewSet
        ]);
        setStand(standResponse.data);
        setMenuItems(menuResponse.data);
        setError(null); // Hapus error jika sukses
      } catch (err) {
        console.error("Gagal memuat data:", err);
        setError("Gagal memuat data stand. Coba lagi nanti.");
      } finally {
        setLoading(false); // Pastikan loading false di akhir
      }
    };
    
    loadData();
  }, [standId]); // Dependency array
  // +++ AKHIR PERBAIKAN PENTING +++

  // --- Handler Modal Item ---
  const handleCardClick = (menuItem) => {
    setCurrentItem(menuItem);
    // Cek jika item punya varian
    const hasVariants = menuItem.variant_groups && menuItem.variant_groups.length > 0;
    
    if (hasVariants) {
      setCustomizeModalOpen(true); // Langsung buka modal kustomisasi
    } else {
      setSimpleModalOpen(true); // Buka modal simpel
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

  // --- Handler Modal Konfirmasi ---
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
          note: item.notes || ''
      }))
    };
    
    try {
      setLoading(true); 
      const response = await createOrder(payload);
      
      const newOrderUuid = response.data.order.uuid;
      
      navigate(`/order-status/${newOrderUuid}`);
      
      setCart([]);
      setConfirmationModalOpen(false);
      
    } catch (err) {
      console.error("Gagal membuat pesanan:", err);
      const errorDetail = err.response?.data?.detail || err.response?.data[0] || "Maaf, terjadi kesalahan saat membuat pesanan.";
      alert(errorDetail);
    } finally {
      setLoading(false);
    }
  };

  // --- Render ---
  // (Render loading & error)
  if (loading && !isConfirmationModalOpen) { 
    return <Layout><p className="text-center">Memuat...</p></Layout>;
  }
  if (error) {
    return <Layout><p className="text-center text-red-400">{error}</p></Layout>;
  }

  // (Render Halaman)
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

      {/* --- Render Modal & Footer --- */}

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