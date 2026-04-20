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

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
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
        className={`fixed top-0 left-0 lg:sticky lg:flex-shrink-0 z-50 w-[260px] h-screen bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col shadow-2xl transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-wider text-white">
              BODY<span className="text-blue-400">WORNCAM</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          <Link to="/">
            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 text-sm font-medium">
              <Home className="w-4 h-4" />
              Beranda
            </button>
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-sm font-medium">
            <Shield className="w-4 h-4" />
            Command Center
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 text-sm font-medium">
            <Bell className="w-4 h-4" />
            Notifikasi
            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">3</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 text-sm font-medium">
            <Settings className="w-4 h-4" />
            Pengaturan
          </button>

          <div className="pt-4 mt-4 border-t border-white/10 space-y-1">
            <Link to="/profile">
              <button className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 text-sm font-medium">
                {user?.profile_image ? (
                  <img src={`/uploads/${user.profile_image}`} alt="Avatar" className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                    <User className="w-3 h-3 text-blue-400" />
                  </div>
                )}
                <div className="flex flex-col items-start text-left">
                  <span className="text-white text-sm">{user?.full_name?.split(' ')[0] || 'Profil'}</span>
                  <span className="text-xs text-gray-500">{user?.position || 'Personil'}</span>
                </div>
              </button>
            </Link>
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Keluar
            </button>
          </div>
        </nav>

        {/* Status Card */}
        <div className="p-4 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                systemHealthy ? "bg-green-400" : "bg-red-500"
              )} />
              <span className="text-sm font-medium text-white">
                {systemHealthy ? "Sistem Aktif" : "Server Terputus"}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {systemHealthy ? `${onlineUsersCount} personel terhubung` : "Cek koneksi internet/server"}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0 relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-lg">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-400 hover:text-white transition"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Command <span className="text-blue-400">Center</span>
                </h1>
                <p className="text-xs text-gray-400 hidden sm:block">Sistem Pemantauan Personil Keamanan</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  placeholder="Cari personil..."
                  className="bg-transparent outline-none text-white text-sm placeholder:text-gray-500 w-40"
                />
              </div>
              <button className="relative p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <Link to="/profile">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2 hover:bg-white/10 transition cursor-pointer">
                  {user?.profile_image ? (
                    <img src={`/uploads/${user.profile_image}`} alt="Avatar" className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                  )}
                  <span className="text-sm text-white hidden sm:block">{user?.full_name?.split(' ')[0] || 'Profil'}</span>
                </div>
              </Link>
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
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden h-[500px] shadow-xl"
              >
                <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <h2 className="font-semibold text-white">Peta Lokasi Personil</h2>
                  </div>
                  <span className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded-full">Live Update</span>
                </div>
                <SecurityMap personnel={personnel} onSelectPersonnel={setSelectedPersonnel} />
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
          <VideoFeed selectedPersonnelId={selectedPersonnel} />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
