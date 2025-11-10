import React from 'react';

const IconMinus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
  </svg>
);

const IconPlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

export default function QuantityStepper({ quantity, setQuantity }) {
  const decrement = () => setQuantity(q => Math.max(1, q - 1));
  const increment = () => setQuantity(q => q + 1);

  return (
    <div className="flex items-center gap-4">
      <button 
        onClick={decrement} 
        disabled={quantity <= 1}
        className="bg-gray-700 p-2 rounded-full text-white disabled:opacity-50"
      >
        <IconMinus />
      </button>
      <span className="text-xl font-bold w-8 text-center">{quantity}</span>
      <button 
        onClick={increment} 
        className="bg-orange-600 p-2 rounded-full text-white"
      >
        <IconPlus />
      </button>
    </div>
  );
}