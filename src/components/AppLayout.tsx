import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Shown on mobile always, shown on desktop only when sidebar is closed */}
      <div className={`flex items-center justify-between p-4 border-b border-border bg-card transition-all duration-300 ${sidebarOpen ? 'lg:hidden' : 'flex'}`}>
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-foreground p-1 rounded-md hover:bg-muted">
            <Menu className="h-6 w-6" />
          </button>
          <img src="/logo.png" alt="FinTrack AI Logo" className="h-8 w-8 object-contain rounded-lg" />
          <span className="font-display text-lg text-foreground">FinTrack</span>
        </div>
      </div>

      <AppSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className={`min-h-screen transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        <Outlet />
      </main>
    </div>
  );
}
