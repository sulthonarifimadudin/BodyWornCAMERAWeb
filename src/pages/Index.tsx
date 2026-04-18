import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, MapPin, Video, Users, Activity, Radio, ChevronRight, Eye, Lock, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const { isLoggedIn, logout, user } = useAuth();
  
  const features = [
    {
      icon: MapPin,
      title: "Pelacakan Real-time",
      description: "Pantau lokasi seluruh personil keamanan secara real-time dengan peta interaktif OpenStreetMap"
    },
    {
      icon: Video,
      title: "Video Live Streaming",
      description: "Terima dan tampilkan video langsung dari bodyworn camera setiap personil di lapangan"
    },
    {
      icon: Users,
      title: "Manajemen Personil",
      description: "Kelola status, shift, dan penugasan seluruh tim keamanan dalam satu dashboard"
    },
    {
      icon: Activity,
      title: "Monitoring Status",
      description: "Pantau kondisi dan aktivitas personil termasuk detak jantung dan level baterai perangkat"
    },
    {
      icon: Radio,
      title: "Komunikasi Terpadu",
      description: "Sistem komunikasi terintegrasi untuk koordinasi cepat antar personil dan command center"
    },
    {
      icon: Eye,
      title: "Surveillance 24/7",
      description: "Pengawasan non-stop dengan alert otomatis untuk situasi darurat"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-50 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-wider text-white">
              BODY<span className="text-blue-400">WORNCAM</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link to="/profile">
                  <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm hover:bg-white/10 transition">
                    {user?.profile_image && (
                      <img src={`/uploads/${user.profile_image}`} alt="Avatar" className="w-5 h-5 rounded-full object-cover" />
                    )}
                    <span>Halo, {user?.full_name?.split(' ')[0] || 'Personil'}</span>
                  </button>
                </Link>
                <button
                  onClick={() => logout()}
                  className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm hover:bg-red-500/20 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login">
                <button className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl text-sm hover:bg-white/10 transition">
                  Login
                </button>
              </Link>
            )}
            <Link to="/dashboard">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/25 transition-all duration-300">
                {isLoggedIn ? "Masuk Dashboard" : "Lihat Dashboard"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 py-24 lg:py-36">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10"
            >
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-sm text-blue-400 font-medium">Sistem Pemantauan Aktif</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-white"
            >
              Pusat Komando
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Personil Keamanan
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Platform pemantauan terintegrasi untuk mengelola dan mengawasi seluruh personil keamanan secara real-time dengan teknologi peta dan video streaming terdepan.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to={isLoggedIn ? "/dashboard" : "/login"}>
                <button className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl font-semibold text-lg shadow-xl shadow-blue-500/25 transition-all duration-300 group">
                  <span>Akses Command Center</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <button className="flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-xl">
                Lihat Demo
              </button>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { value: "50+", label: "Personil Aktif", icon: Users },
              { value: "24/7", label: "Monitoring", icon: Eye },
              { value: "< 1s", label: "Response Time", icon: Zap },
              { value: "99.9%", label: "Uptime", icon: Activity },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:border-blue-500/30 hover:bg-white/10 transition-all duration-300"
              >
                <stat.icon className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="text-3xl md:text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Fitur <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Unggulan</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Dilengkapi dengan teknologi terkini untuk memastikan keamanan maksimal
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 group hover:border-blue-500/30 hover:bg-white/10 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl border border-white/10 rounded-3xl p-10 md:p-16 text-center shadow-2xl"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg shadow-blue-500/30 mb-6">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Siap Meningkatkan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Keamanan</span>?
            </h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Mulai pantau dan kelola tim keamanan Anda dengan platform command center terdepan
            </p>
            <Link to={isLoggedIn ? "/dashboard" : "/login"}>
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl font-semibold text-lg shadow-xl shadow-blue-500/25 transition-all duration-300 group">
                {isLoggedIn ? "Buka Dashboard" : "Mulai Sekarang"}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-gray-500">
          <p>© 2024 BodyWornCam. Sistem Pemantauan Personil Keamanan Kampus.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
