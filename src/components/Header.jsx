// src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';

// Ikon User/Login
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

export default function Header() {
  return (
    <header className="relative flex flex-col items-center justify-center py-6">
      
      {/* Tombol Login di Pojok Kanan Atas */}
      <Link 
        to="/login" 
        className="absolute top-6 right-0 p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
        title="Login Staff"
      >
        <UserIcon />
      </Link>

      <h1 className="text-3xl font-bold text-orange-400">Orderin</h1>
      <p className="text-sm text-gray-400">Pesan Makanan Mudah & Cepat</p>
    </header>
  );
}