import React, { useState, useEffect } from 'react';
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
  }, []);
  
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
