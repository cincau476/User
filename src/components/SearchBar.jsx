// src/components/SearchBar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { searchMenus } from '../api/apiService';

const SearchIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={2} 
    stroke="currentColor" 
    className="w-5 h-5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  // Fungsi untuk menutup dropdown saat klik di luar area SearchBar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fungsi pencarian otomatis (menggunakan teknik Debounce)
  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length === 0) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      try {
        const response = await searchMenus(query);
        // Tangani struktur pagination dari DRF (jika ada)
        const data = response.data.results || response.data;
        setResults(Array.isArray(data) ? data : []);
        setIsOpen(true);
      } catch (error) {
        console.error('Error searching menus:', error);
      } finally {
        setLoading(false);
      }
    };

    // Jeda 300ms setelah user berhenti mengetik sebelum memanggil API
    const timeoutId = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div ref={wrapperRef} className="relative w-full mb-6 z-50">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <SearchIcon className="text-gray-500" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => { if (query.length > 0) setIsOpen(true) }}
        placeholder="Mau makan apa hari ini? (misal: babi, ayam, es...)"
        className="w-full py-3 pl-12 pr-4 bg-gray-800 border border-gray-700 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
      />

      {/* DROPDOWN HASIL PENCARIAN */}
      {isOpen && (
        <div className="absolute w-full mt-2 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-400 animate-pulse">
              Mencari menu...
            </div>
          ) : results.length > 0 ? (
            <ul className="py-2">
              {results.map((item) => (
                <li 
                  key={item.id} 
                  className="px-4 py-3 border-b border-gray-800 hover:bg-gray-800 cursor-pointer flex items-center gap-4 transition-colors last:border-0"
                  onClick={() => {
                    // Tindakan saat user mengklik hasil pencarian
                    // Anda bisa arahkan ke halaman detail stand dengan id = item.tenant
                    window.location.href = `/stands/${item.tenant}`;
                  }}
                >
                  <img 
                    src={item.image || '/vite.svg'} // Fallback image
                    alt={item.name} 
                    className="w-14 h-14 rounded-lg object-cover bg-gray-700"
                  />
                  <div className="flex-1 text-left">
                    <h4 className="text-white font-semibold text-sm">{item.name}</h4>
                    <p className="text-gray-400 text-xs line-clamp-1 mt-0.5">{item.description}</p>
                  </div>
                  <div className="text-orange-400 font-bold text-sm">
                    Rp {parseInt(item.price).toLocaleString('id-ID')}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-400">
              Yah, tidak menemukan menu untuk "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
