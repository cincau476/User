/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.jsx"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary-blue': '#0F1A3E',   // <-- Warna
        'accent-blue': '#4A90E2',    // <-- Warna
        'accent-orange': '#F5A623',  // <-- Warna
      }
    },
  },
  plugins: [],
}

