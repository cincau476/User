import React from 'react';
import { useNavigate } from 'react-router-dom';

// Ikon panah "Back" (SVG)
const BackIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={2} 
    stroke="currentColor" 
    className="w-6 h-6"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);

export default function StandHeader({ stand }) {
  const navigate = useNavigate();

  return (
    <header className="flex items-center gap-4 py-4">
      <button 
        onClick={() => navigate(-1)} // Fungsi untuk kembali
        className="text-white p-2 rounded-full hover:bg-gray-800"
        aria-label="Kembali"
      >
        <BackIcon />
      </button>
      <div>
        <h1 className="text-xl font-bold text-white">{stand?.name || 'Memuat...'}</h1>
        <p className="text-sm text-gray-400">Mau order di ORDERIN aja</p>
      </div>
    </header>
  );
}