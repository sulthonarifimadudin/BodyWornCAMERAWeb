import { useState } from "react";
import { useRealtimePersonnel } from "@/hooks/useRealtimePersonnel";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, Home, Bell, Settings, Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SecurityMap from "@/components/SecurityMap";
import PersonnelList from "@/components/PersonnelList";
import VideoFeed from "@/components/VideoFeed";
import StatusOverview from "@/components/StatusOverview";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState<string | null>(null);
  const { personnel, loading, error } = useRealtimePersonnel();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Background Effects */}
      <div className="fixed inset-0 grid-pattern opacity-20 pointer-events-none" />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        className="fixed lg:static z-50 w-[280px] h-screen border-r border-border/50 glass-card flex flex-col lg:translate-x-0"
      >
        {/* Logo */}
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <span className="font-display text-lg font-bold tracking-wider">
              GUARD<span className="text-primary">WATCH</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start gap-3">
              <Home className="w-5 h-5" />
              Beranda
            </Button>
          </Link>
          <Button variant="secondary" className="w-full justify-start gap-3">
            <Shield className="w-5 h-5 text-primary" />
            Command Center
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3">
            <Bell className="w-5 h-5" />
            Notifikasi
            <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
              3
            </span>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3">
            <Settings className="w-5 h-5" />
            Pengaturan
          </Button>
        </nav>

        {/* Status Card */}
        <div className="p-4 border-t border-border/50">
          <div className="glass-card rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm font-medium">Sistem Aktif</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Semua layanan berjalan normal
            </p>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border/50 glass-card">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-muted-foreground hover:text-foreground"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="font-display text-xl font-bold">
                Command <span className="text-primary">Center</span>
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cari personil..."
                  className="border-0 bg-transparent h-auto py-0 px-0 focus-visible:ring-0"
                />
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-4 lg:p-6 space-y-6">
          {/* Status Overview */}
          <StatusOverview personnel={personnel} />

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Map Section */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-xl overflow-hidden h-[500px]"
              >
                <div className="p-4 border-b border-border/50 flex items-center justify-between">
                  <h2 className="font-display font-semibold">Peta Lokasi Personil</h2>
                  <span className="text-xs text-muted-foreground">Live Update</span>
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
