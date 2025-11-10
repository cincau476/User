import React from 'react';

const SearchIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={2} 
    stroke="currentColor" 
    className="w-5 h-5"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" 
    />
  </svg>
);

export default function SearchBar() {
  return (
    <div className="relative w-full mb-6">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <SearchIcon className="text-gray-500" />
      </div>
      <input
        type="text"
        placeholder="Mau makan apa?"
        className="w-full py-3 pl-12 pr-4 bg-gray-800 border border-gray-700 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400"
      />
    </div>
  );
}