// src/App.jsx
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import StandDetailPage from './pages/StandDetailPage';
import OrderStatusPage from './pages/OrderStatusPage';
import LoginPage from './pages/LoginPage'; // <--- Import ini

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/stand/:standId" element={<StandDetailPage />} />
      <Route path="/order-status/:orderUuid" element={<OrderStatusPage />} />
      <Route path="/login" element={<LoginPage />} /> {/* <--- Tambahkan Route ini */}
    </Routes>
  );
}

export default App;