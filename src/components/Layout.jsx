import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* max-w-4xl membuat lebar maksimum di desktop.
        mx-auto membuatnya di tengah.
        p-4 memberikan padding di mobile.
      */}
      <main className="max-w-4xl mx-auto p-4">
        {children}
      </main>
    </div>
  );
}