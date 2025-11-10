import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import StandDetailPage from './pages/StandDetailPage';
import OrderStatusPage from './pages/OrderStatusPage'; // <-- Halaman baru

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/stand/:standId" element={<StandDetailPage />} />
      
      {/* Rute baru untuk halaman status pesanan */}
      <Route path="/order-status/:orderUuid" element={<OrderStatusPage />} />
      
    </Routes>
  );
}

export default App;