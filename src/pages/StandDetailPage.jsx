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
  
  // Pisahkan error biasa dengan error ABAC (Geolokasi/Waktu)
  const [error, setError] = useState(null);
  const [abacError, setAbacError] = useState(null); 

  const [cart, setCart] = useState([]);
  
  const [currentItem, setCurrentItem] = useState(null);
  const [isSimpleModalOpen, setSimpleModalOpen] = useState(false);
  const [isCustomizeModalOpen, setCustomizeModalOpen] = useState(false);
  const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [isCartDetailModalOpen, setCartDetailModalOpen] = useState(false); 

  useEffect(() => {
    if (!standId || standId === 'undefined' || standId === 'null') {
        setError("Stand tidak ditemukan (ID Invalid). Silakan kembali ke menu utama dan pilih stand lagi.");
        setLoading(false);
        return; 
    }

    const loadData = async () => {
      try {
        setLoading(true);
        // apiClient otomatis meminta izin lokasi (GPS) di sini sebelum mengirim request
        const [standResponse, menuResponse] = await Promise.all([
          getStandDetails(standId),
          getMenuForStand(standId)
        ]);
        setStand(standResponse.data);
        setMenuItems(Array.isArray(menuResponse.data) ? menuResponse.data : []);
        setAbacError(null);
        setError(null);
      } catch (err) {
        console.error("Gagal memuat data:", err);
        // Tangkap pesan error dari Interceptor (GPS ditolak) ATAU Backend (Luar radius / Tutup)
        const errorMsg = err.response?.data?.detail || err.message || "Gagal memuat data stand.";
        setAbacError(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [standId]);

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

  const handleOpenCartDetail = () => setCartDetailModalOpen(true);
  const handleCloseCartDetail = () => setCartDetailModalOpen(false);

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

  // ==========================================
  // LOGIKA PEMBAYARAN MIDTRANS & CASH
  // ==========================================
  const handleConfirmOrder = async (formData) => {
    if (!stand) return;

    // 1. TARIK TOKEN DARI MEMORI BROWSER
    const savedToken = sessionStorage.getItem('table_token');

    const payload = {
      tenant: stand.id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone || "",
      payment_method: formData.paymentMethod, 
      // 2. MASUKKAN TOKEN KE PAYLOAD (Jika kosong, otomatis jadi Takeaway)
      token: savedToken || "", 
      items: cart.map(item => ({
          menu_item: item.menuItemId,
          qty: item.quantity,
          variants: item.selectedVariantIds || [],
          note: item.notes || ''
      }))
    };
    
    try {
      setLoading(true); 
      // GPS juga akan dicek ulang di sini (melalui interceptor createOrder)
      const response = await createOrder(payload);

      // 3. HANGUSKAN TOKEN MEJA SETELAH PESANAN SUKSES TERCATAT DI DATABASE!
      sessionStorage.removeItem('table_token');
      
      const newOrderUuid = response.data.order.uuid;
      const guestToken = response.data.token;

      if (guestToken) {
        sessionStorage.setItem(`token_${newOrderUuid}`, guestToken);
      }
      
      // Jika Backend mengembalikan token Midtrans (artinya pilih Bayar Online)
      if (response.data.snap_token) {
        window.snap.pay(response.data.snap_token, {
          onSuccess: function(result){
            setCart([]);
            setConfirmationModalOpen(false);
            navigate(`/order-status/${newOrderUuid}`);
          },
          onPending: function(result){
            setCart([]);
            setConfirmationModalOpen(false);
            navigate(`/order-status/${newOrderUuid}`);
          },
          onError: function(result){
            alert("Pembayaran gagal! Silakan bayar kasir secara tunai atau coba pesan ulang.");
            setCart([]);
            setConfirmationModalOpen(false);
            navigate(`/order-status/${newOrderUuid}`);
          },
          onClose: function(){
            alert("Anda menutup pop-up sebelum menyelesaikan pembayaran. Pesanan masuk antrian Menunggu Pembayaran.");
            setCart([]);
            setConfirmationModalOpen(false);
            navigate(`/order-status/${newOrderUuid}`);
          }
        });
      } else {
        // Jika pembayarannya Tunai/Cash (langsung arahkan ke halaman status)
        setCart([]);
        setConfirmationModalOpen(false);
        navigate(`/order-status/${newOrderUuid}`);
      }

    } catch (err) {
      console.error("Gagal membuat pesanan:", err);
      let errorMsg = "Terjadi kesalahan saat memproses pesanan Anda.";
      if (err.response && err.response.data) {
        errorMsg = err.response.data.detail || JSON.stringify(err.response.data);
      } else if (err.message) {
        errorMsg = err.message;
      }
      alert(`Gagal membuat pesanan: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Render ---
  
  // 1. Tampilan Loading dengan Indikator GPS
  if (loading && !isConfirmationModalOpen) { 
    return (
      <Layout>
        <div className="flex flex-col h-[70vh] items-center justify-center">
          <p className="text-lg font-semibold animate-pulse text-blue-600">
            📍 Memeriksa Lokasi & Memuat Menu...
          </p>
        </div>
      </Layout>
    );
  }

  // 2. Tampilan Error ABAC (Geofence / Waktu / Tolak Izin GPS)
  if (abacError) {
    return (
      <Layout>
        <div className="flex flex-col h-[70vh] items-center justify-center p-6 text-center">
          <div className="text-6xl mb-4">🛑</div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Akses Ditolak</h1>
          <p className="text-gray-600 mb-6">{abacError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
          >
            Coba Ulangi
          </button>
        </div>
      </Layout>
    );
  }

  // 3. Tampilan Error Umum (Misal: ID Tidak Valid)
  if (error) {
    return (
      <Layout>
        <div className="flex h-[70vh] items-center justify-center">
          <p className="text-center text-red-500 font-medium">{error}</p>
        </div>
      </Layout>
    );
  }

  // 4. Tampilan Normal (Lolos ABAC)
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
