import React from 'react';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../api/apiService'; // <-- 1. IMPORT

export default function MenuCard({ menu }) {
  // 2. Buat URL lengkap
  const imageUrl = menu.imageUrl.startsWith('http') 
    ? menu.imageUrl 
    : `${BASE_URL}${menu.imageUrl}`;

  return (
    <Link to={`/stand/${menu.tenant.id}`}> 
      <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg hover:bg-slate-700 transition-colors">
        <img 
          src={imageUrl} // <-- 3. Gunakan URL lengkap
          alt={menu.name} 
          className="w-full h-32 object-cover" 
        />
        <div className="p-4">
          <h3 className="font-semibold text-white text-md">{menu.name}</h3>
          <p className="text-sm text-slate-300">{menu.tenant.name}</p>
        </div>
      </div>
    </Link>
  );
}