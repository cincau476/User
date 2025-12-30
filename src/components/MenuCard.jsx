import React from 'react';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../api/apiService'; 

export default function MenuCard({ menu }) {
  // Tambahkan pengecekan jika menu.imageUrl tidak ada
  const rawImageUrl = menu.imageUrl || '/default-image.png';

  const imageUrl = rawImageUrl.startsWith('http') 
    ? rawImageUrl 
    : `${BASE_URL}${rawImageUrl}`;

  return (
    <Link to={`/stand/${menu.tenant.id}`}> 
      <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg hover:bg-slate-700 transition-colors">
        <img 
          src={imageUrl} 
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
