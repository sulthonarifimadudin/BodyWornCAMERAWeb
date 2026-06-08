import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Menu, Search, Bell, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { Layout, Columns, Repeat } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
  
  // Dashboard-specific state (temporary here, better in context later if needed)
  const [layoutMode, setLayoutMode] = useState<'classic' | 'tactical'>('classic');
  const [isSwapped, setIsSwapped] = useState(false);

  // Pass these to children via context or cloneElement?
  // Since children is probably the Dashboard component, we can use a simpler approach.
  // But let's keep it here and check if we can pass it.
  
  const isDashboard = location.pathname === "/" || location.pathname === "/dashboard";

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen lg:pl-[260px] relative z-10 overflow-y-auto min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                Command <span className="text-primary font-orbitron">Center</span>
              </h1>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest hidden sm:block">
                Sistem Pemantauan Personel Keamanan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-muted/30 border border-border/50 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                placeholder={t('dashboard.searchPlaceholder')}
                className="bg-transparent outline-none text-foreground text-sm placeholder:text-muted-foreground w-40"
              />
            </div>

            {isDashboard && (
              <div className="hidden sm:flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border/50 shadow-inner mr-2">
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('changeLayout', { detail: 'classic' }))}
                  className="p-1.5 rounded-lg transition-all text-muted-foreground hover:text-primary hover:bg-card"
                  title="Classic Layout"
                >
                  <Layout className="w-4 h-4" />
                </button>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('changeLayout', { detail: 'tactical' }))}
                  className="p-1.5 rounded-lg transition-all text-muted-foreground hover:text-primary hover:bg-card"
                  title="Tactical Layout"
                >
                  <Columns className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-border/50 mx-0.5" />
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('swapLayout'))}
                  className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                  title="Swap View"
                >
                  <Repeat className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 bg-muted/30 border border-border/50 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-primary" />}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 relative min-w-0 overflow-x-hidden">
          {/* Background Decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          </div>
          
          <div className="relative z-10 h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
