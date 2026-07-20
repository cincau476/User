import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import MenuCard from '../components/MenuCard';
import StandCard from '../components/StandCard';
import { getStands, getPopularMenus } from '../api/apiService';

export default function HomePage() {
  const [popularMenus, setPopularMenus] = useState([]);
  const [stands, setStands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [menusResponse, standsResponse] = await Promise.all([
          getPopularMenus(),
          getStands()
        ]);
        
        // --- PERBAIKAN START ---
        
        // 1. Handle Pagination untuk Menu Populer
        // Cek apakah data ada di dalam properti 'results' (Pagination DRF) atau langsung di 'data'
        const menusData = menusResponse.data.results || menusResponse.data;
        setPopularMenus(Array.isArray(menusData) ? menusData : []);

        // 2. Handle Pagination untuk List Stand
        // Sama seperti di atas, cek 'results' dulu untuk antisipasi pagination
        const standsData = standsResponse.data.results || standsResponse.data;
        setStands(Array.isArray(standsData) ? standsData : []);

        const token = searchParams.get('token');

        if (token) {
            // 3. Simpan ke sessionStorage
            sessionStorage.setItem('table_token', token);
            sessionStorage.setItem('order_type', 'DINE_IN');

            // 4. Bersihkan URL (hapus token dari bar navigasi agar rapi)
            searchParams.delete('token');
            setSearchParams(searchParams, { replace: true });
        } else {
            // Jika BUKAN dari Scan QR Meja (URL biasa)
            // Cek apakah sebelumnya sudah ada token di session.
            const existingToken = sessionStorage.getItem('table_token');
            
            // Jika tidak ada riwayat token sama sekali, paksa mode ke TAKEAWAY
            if (!existingToken) {
                sessionStorage.setItem('order_type', 'TAKEAWAY');
            }
        }
        // --- PERBAIKAN END ---

        setError(null);
      } catch (err) {
        console.error("Gagal mengambil data:", err);
        setError("Gagal memuat data. Coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [searchParams, setSearchParams]);
  
  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-red-400">{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Header />
      <SearchBar />

      {/* Bagian Makanan Viral */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Makanan Viral</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading ? (
            <p>Memuat menu...</p>
          ) : (
            popularMenus.map((menu) => (
              <MenuCard key={menu.id} menu={menu} />
            ))
          )}
        </div>
      </section>

      {/* Bagian List Stand */}
      <section>
        <h2 className="text-2xl font-bold mb-4">List Stand</h2>
        <div className="flex flex-col gap-4">
          {loading ? (
            <p>Memuat stand...</p>
          ) : (
            stands.map((stand) => (
              <StandCard key={stand.id} stand={stand} />
            ))
          )}
        </div>
      </section>
    </Layout>
  );
}
