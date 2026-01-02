import React from 'react';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../api/apiService'; 

export default function MenuCard({ menu }) {
  // 1. LOGIKA GAMBAR
  const rawImageUrl = menu.imageUrl || '/default-image.png';
  const getImageUrl = (url) => {
    if (!url) return null; // atau gambar default
    if (url.startsWith('http')) return url;
    if (url.startsWith('/media')) return url; // <-- Cek folder media
    return `${BASE_URL}${url}`;
  };
  // 2. LOGIKA STAND ID (PENTING!)
  // Ambil tenant_id (dari backend baru) ATAU tenant (jika backend lama mengirim ID angka)
  // Kita handle juga jika tenant ternyata object (jaga-jaga)
  const standId = menu.tenant_id 
    || (typeof menu.tenant === 'object' ? menu.tenant.id : menu.tenant);

  // 3. LOGIKA NAMA STAND
  // Ambil tenant_name (dari backend baru)
  const standName = menu.tenant_name 
    || (typeof menu.tenant === 'object' ? menu.tenant.name : 'Kantin');

  return (
    // Gunakan standId yang sudah divalidasi
    <Link to={`/stand/${standId}`}> 
      <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg hover:bg-slate-700 transition-colors">
        <img 
          src={imageUrl} 
          alt={menu.name} 
          className="w-full h-32 object-cover" 
        />
        <div className="p-4">
          <h3 className="font-semibold text-white text-md">{menu.name}</h3>
          {/* Tampilkan Nama Stand yang benar */}
          <p className="text-sm text-slate-300">{standName}</p>
        </div>
      </div>
    </Link>
  );
}
