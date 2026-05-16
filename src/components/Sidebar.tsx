import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, Home, Bell, Settings, User, LogOut, Wifi, UserCheck, Camera, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const Sidebar = ({ open, setOpen }: SidebarProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();
  
  const [onlineUsersCount, setOnlineUsersCount] = useState<number>(0);
  const [systemHealthy, setSystemHealthy] = useState<boolean>(true);

  // Poll System Health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch("/api/health");
        const data = await res.json();
        setSystemHealthy(data.success);
      } catch (err) {
        setSystemHealthy(false);
      }
    };
    
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Poll Online Users
  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        if (!token) return;
        const res = await fetch("/api/online-users", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setOnlineUsersCount(data.count);
        }
      } catch (err) {
        console.error("Gagal menarik data user online:", err);
      }
    };

    fetchOnlineUsers();
    const interval = setInterval(fetchOnlineUsers, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 w-[260px] h-screen bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))] border-r border-[hsl(var(--sidebar-border))] flex flex-col shadow-2xl transition-all duration-300",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 flex items-center justify-between border-b border-[hsl(var(--sidebar-border))]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center border border-white/10 overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-7 h-7 object-contain" />
            </div>
            <h1 className="text-lg font-bold tracking-tighter text-white">BODY<span className="text-white/80 font-orbitron">WORNCAM</span></h1>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden text-[hsl(var(--sidebar-foreground))/0.7] hover:text-[hsl(var(--sidebar-foreground))] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 pt-8 space-y-2 overflow-y-auto custom-scrollbar pb-32">
          {[
            { title: t('dashboard.home'), href: "/", icon: Home },
            { title: t('dashboard.title'), href: "/dashboard", icon: Shield },
            { title: t('dashboard.notifications'), href: "/notifications", icon: Bell },
            { title: t('dashboard.settings'), href: "/settings", icon: Settings },
            ...(user?.role === 'admin' ? [{ title: "Verifikasi Akun", href: "/verify-accounts", icon: UserCheck }] : []),
            ...(user?.role === 'admin' || user?.role === 'supervisor' ? [{ title: "Manajemen Alat", href: "/manage-devices", icon: Camera }] : [])
          ].map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                location.pathname === item.href
                  ? "bg-white text-slate-900 shadow-lg"
                  : "text-[hsl(var(--sidebar-foreground))/0.7] hover:bg-white/10 hover:text-[hsl(var(--sidebar-foreground))]"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                location.pathname === item.href ? "text-slate-900" : "text-[hsl(var(--sidebar-foreground))/0.7] group-hover:text-[hsl(var(--sidebar-foreground))]"
              )} />
              {item.title}
            </Link>
          ))}

          <div className="pt-4 mt-4 border-t border-[hsl(var(--sidebar-border))] space-y-1">
            <Link to="/profile" className="block">
              <button className="w-full flex items-center gap-3 px-3 py-2 text-[hsl(var(--sidebar-foreground))/0.7] hover:text-[hsl(var(--sidebar-foreground))] hover:bg-white/10 rounded-xl transition-all duration-200 text-left">
                {user?.profile_image ? (
                  <img src={`/api/uploads/${user.profile_image}`} alt="Avatar" className="w-8 h-8 rounded-full border border-white/20 object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="flex flex-col items-start text-left ml-2 overflow-hidden">
                  <span className="text-[hsl(var(--sidebar-foreground))] text-sm font-semibold truncate w-full">{user?.full_name?.split(' ')[0] || t('dashboard.profile')}</span>
                  <span className="text-[hsl(var(--sidebar-foreground))/0.5] uppercase font-bold text-[10px] tracking-tight truncate w-full">{user?.role || 'User'}</span>
                </div>
              </button>
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-red-100 hover:text-white hover:bg-red-600/20 rounded-xl transition-all duration-200 text-sm font-medium text-left"
            >
              <LogOut className="w-4 h-4" />
              {t('dashboard.logout')}
            </button>
          </div>
        </nav>

        {/* Status Card */}
        <div className="absolute bottom-0 left-0 w-full p-4 bg-black/20 border-t border-[hsl(var(--sidebar-border))] z-20">
          <div className="flex items-center gap-3 mb-1">
            <span className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              systemHealthy ? "bg-green-400 glow-success" : "bg-red-400 glow-destructive"
            )} />
            <span className="text-xs font-bold text-[hsl(var(--sidebar-foreground))] uppercase tracking-tighter">
              {systemHealthy ? "Sistem Aktif" : "Server Off"}
            </span>
          </div>
          <p className="text-[10px] text-[hsl(var(--sidebar-foreground))/0.5] font-bold uppercase tracking-widest">
            {onlineUsersCount} Personel Terhubung
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
