// src/api/geolocation.js

export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolokasi tidak didukung oleh browser ini."));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          // Tangani penolakan izin atau error GPS
          let errorMessage = "Gagal mendapatkan lokasi.";
          if (error.code === 1) errorMessage = "Anda harus mengizinkan akses lokasi untuk menggunakan aplikasi ini.";
          if (error.code === 2) errorMessage = "Sinyal GPS tidak ditemukan.";
          if (error.code === 3) errorMessage = "Waktu permintaan lokasi habis (timeout).";
          
          reject(new Error(errorMessage));
        },
        { 
          enableHighAccuracy: true, // Paksa gunakan GPS yang akurat
          timeout: 10000, 
          maximumAge: 0 
        }
      );
    }
  });
};
