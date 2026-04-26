import { useState, useEffect } from "react";
import { useRealtimePersonnel } from "@/hooks/useRealtimePersonnel";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Home, Bell, Settings, Search, Menu, X, User, LogOut, Activity, Wifi, WifiOff, Camera } from "lucide-react";
import SecurityMap from "@/components/SecurityMap";
import PersonnelList from "@/components/PersonnelList";
import VideoFeed from "@/components/VideoFeed";
import StatusOverview from "@/components/StatusOverview";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { Languages, Moon, Sun, Globe } from "lucide-react";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<string | null>(null);
  const { personnel, loading, error } = useRealtimePersonnel();
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
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none transition-opacity duration-1000 dark:opacity-100 opacity-60">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.15)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.15)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 lg:sticky lg:flex-shrink-0 z-50 w-[260px] h-screen bg-card/80 backdrop-blur-xl border-r border-border/50 flex flex-col shadow-2xl transition-all duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-wider text-foreground">
              BODY<span className="text-primary font-orbitron">WORNCAM</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 pt-12 space-y-2">
          <Link to="/">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200 text-sm font-medium">
              <Home className="w-4 h-4" />
              {t('dashboard.home')}
            </button>
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-sm font-medium">
            <Shield className="w-4 h-4" />
            {t('dashboard.title')}
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200 text-sm font-medium">
            <Bell className="w-4 h-4" />
            {t('dashboard.notifications')}
            <span className="ml-auto bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5 rounded-full font-bold">3</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200 text-sm font-medium">
            <Settings className="w-4 h-4" />
            {t('dashboard.settings')}
          </button>

          <div className="pt-4 mt-4 border-t border-border/50 space-y-1">
            <Link to="/profile" className="block">
              <button className="w-full flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all duration-200">
                {user?.profile_image ? (
                  <img src={`/uploads/${user.profile_image}`} alt="Avatar" className="w-8 h-8 rounded-full border border-border/50 object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div className="flex flex-col items-start text-left ml-2 overflow-hidden">
                  <span className="text-foreground text-sm font-semibold truncate w-full">{user?.full_name?.split(' ')[0] || t('dashboard.profile')}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-tight truncate w-full">{user?.position || 'Personnel'}</span>
                </div>
              </button>
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              {t('dashboard.logout')}
            </button>
          </div>
        </nav>

        {/* Status Card */}
        <div className="p-4 border-t border-border/50">
          <div className="bg-card rounded-xl p-3 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                systemHealthy ? "status-online" : "status-alert"
              )} />
              <span className="text-sm font-bold text-foreground">
                {systemHealthy ? t('dashboard.systemActive') : t('dashboard.serverDisconnected')}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium">
              {systemHealthy ? `${onlineUsersCount} ${t('dashboard.personnelConnected')}` : t('dashboard.checkConnection')}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0 relative z-10 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Command <span className="text-primary font-orbitron">Center</span>
                </h1>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider hidden sm:block">{t('dashboard.subtitle')}</p>
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
              <button className="relative p-2 bg-muted/30 border border-border/50 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full glow-destructive" />
              </button>
              <Link to="/profile">
                <div className="flex items-center gap-2 bg-muted/30 border border-border/50 rounded-xl px-2 py-1.5 hover:bg-muted transition-colors cursor-pointer group">
                  {user?.profile_image ? (
                    <img src={`/uploads/${user.profile_image}`} alt="Avatar" className="w-6 h-6 rounded-full object-cover border border-border/50 group-hover:scale-110 transition-transform" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <User className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}
                  <span className="text-sm font-semibold text-foreground hidden sm:block">{user?.full_name?.split(' ')[0] || t('dashboard.profile')}</span>
                </div>
              </Link>

              {/* Language Toggle */}
              <button
                onClick={() => i18n.changeLanguage(i18n.language === 'id' ? 'en' : 'id')}
                className="p-2 bg-muted/30 border border-border/50 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center gap-2"
                title="Switch Language"
              >
                <Globe className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-tight">{i18n.language}</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 bg-muted/30 border border-border/50 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-primary" />}
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-4 lg:p-6 space-y-6">
          {/* Status Overview */}
          <StatusOverview personnel={personnel} onlineUsersCount={onlineUsersCount} />

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Map Section */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card backdrop-blur-xl border border-border rounded-2xl overflow-hidden h-[500px] shadow-sm"
              >
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 glow-success" />
                    <h2 className="font-bold text-foreground tracking-tight">{t('dashboard.personnelMap')}</h2>
                  </div>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-wider">{t('dashboard.liveUpdate')}</span>
                </div>
                <SecurityMap 
                  personnel={personnel} 
                  selectedId={selectedPersonnel}
                  onSelectPersonnel={setSelectedPersonnel} 
                />
              </motion.div>
            </div>

            {/* Personnel List */}
            <div className="lg:col-span-1">
              <PersonnelList
                personnel={personnel}
                selectedId={selectedPersonnel}
                onSelect={setSelectedPersonnel}
              />
            </div>
          </div>

          {/* Video Feed Section */}
          <VideoFeed 
            selectedPersonnelId={selectedPersonnel} 
            personnel={personnel}
          />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
