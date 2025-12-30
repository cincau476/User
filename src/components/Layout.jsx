export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col overflow-x-hidden">
      {/* Container ini akan otomatis full di HP (390px) dan iPad (768px), 
          tapi tetap memiliki max-width di desktop agar tidak kaku */}
      <main className="flex-grow w-full mx-auto px-4 
        sm:px-6 
        md:max-w-[810px] 
        lg:max-w-screen-xl lg:px-8 
        transition-all duration-300">
        
        <div className="py-4 md:py-6 h-full">
          {children}
        </div>
      </main>

      {/* Tambahkan padding bottom khusus mobile agar tidak tertutup StickyCartFooter */}
      <div className="h-20 md:hidden"></div>
    </div>
  );
}