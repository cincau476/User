import React from 'react';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../api/apiService'; // Impor BASE_URL

// Helper MOCK untuk "Antrian"
const getAntrianStatus = (standName) => {
  // Buat hash sederhana dari nama untuk status yang konsisten
  const hash = standName.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const index = Math.abs(hash) % 3;
  
  const statuses = [
    { text: 'Antrian Sedikit', color: 'bg-green-600 text-green-100' },
    { text: 'Antrian Sedang', color: 'bg-orange-500 text-orange-100' },
    { text: 'Antrian Ramai', color: 'bg-red-600 text-red-100' },
  ];
  return statuses[index];
};

export default function StandCard({ stand }) {
  // Ambil 'imageUrl' dari backend
  const { id, name, description, imageUrl: relativeImageUrl } = stand;
  const antrian = getAntrianStatus(name);

  // Buat URL gambar yang lengkap
  // Cek apakah 'relativeImageUrl' ada sebelum membuat URL
  let imageUrl;
  if (!relativeImageUrl) {
    imageUrl = '/src/assets/mock/default-stand.jpg';
  } else if (relativeImageUrl.startsWith('http')) {
    // Jika sudah absolute URL (misal dari Google / S3)
    imageUrl = relativeImageUrl;
  } else if (relativeImageUrl.startsWith('/media')) {
    // Jika path diawali /media, JANGAN tempelkan BASE_URL (/api)
    // Biarkan relative ke root domain (Nginx akan handle)
    imageUrl = relativeImageUrl;
  } else {
    imageUrl = `${BASE_URL}${relativeImageUrl}`;
  }
    // Fallback: tempelkan BASE_URL untuk path lain

  return (
    // Bungkus dengan <Link>
    <Link to={`/stand/${id}`} className="w-full"> 
      <div className="flex items-center gap-4 p-4 bg-slate-800 rounded-lg shadow-md hover:bg-slate-700 transition-colors">
        <img
          src={imageUrl} // Gunakan URL lengkap
          alt={name}
          className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-md bg-slate-700"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white">{name}</h3>
          <p className="text-sm text-slate-300 mb-2 line-clamp-2">{description}</p>
          <span 
            className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${antrian.color}`}
          >
            {antrian.text}
          </span>
        </div>
      </div>
    </Link>
  );
}
