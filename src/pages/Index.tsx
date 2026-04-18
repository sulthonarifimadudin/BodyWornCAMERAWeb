import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, MapPin, Video, Users, Activity, Radio, ChevronRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 grid-pattern opacity-30" />
      <div className="fixed inset-0 scanline opacity-50" />
      
      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="relative z-50 border-b border-border/50 glass-card"
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/50 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <span className="font-display text-xl font-bold tracking-wider">
              GUARD<span className="text-primary">WATCH</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
                <>
                  <Link to="/profile">
                    <Button variant="outline" size="sm" className="border-primary/50 text-white hover:bg-primary/20 hidden md:flex gap-2">
                        {user?.profile_image && (
                            <img src={`/uploads/${user.profile_image}`} alt="Avatar" className="w-5 h-5 rounded-full object-cover" />
                        )}
                        <span>Halo, {user?.full_name?.split(' ')[0] || 'Personil'}</span>
                    </Button>
                  </Link>
                  <Button onClick={() => logout()} variant="outline" size="sm" className="border-red-500/50 text-red-400 hover:bg-red-500/20">
                      <span>Logout</span>
                  </Button>
                </>
            ) : (
                <Link to="/login">
                  <Button variant="outline" size="lg" className="border-primary/50 text-white hover:bg-primary/20">
                    <span>Login</span>
                  </Button>
                </Link>
            )}
            <Link to="/dashboard">
              <Button variant="hero" size="lg">
                <span>{isLoggedIn ? "Masuk Dashboard" : "Lihat Dashboard"}</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-10 py-24 lg:py-32">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-primary font-medium">Sistem Pemantauan Aktif</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            >
              <span className="text-foreground">Pusat Komando</span>
              <br />
              <span className="text-primary text-glow">Personil Keamanan</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
            >
              Platform pemantauan terintegrasi untuk mengelola dan mengawasi seluruh personil keamanan secara real-time dengan teknologi peta dan video streaming terdepan.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/login">
                <Button variant="hero" size="xl" className="group">
                  <span>Akses Command Center</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button variant="outline" size="xl">
                Lihat Demo
              </Button>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { value: "50+", label: "Personil Aktif" },
              { value: "24/7", label: "Monitoring" },
              { value: "< 1s", label: "Response Time" },
              { value: "99.9%", label: "Uptime" },
            ].map((stat, i) => (
              <div key={i} className="glass-card rounded-xl p-6 text-center">
                <div className="font-display text-3xl md:text-4xl font-bold text-primary text-glow mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 border-t border-border/30">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Fitur <span className="text-primary">Unggulan</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
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
                className="glass-card rounded-xl p-6 group hover:border-primary/50 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 border-t border-border/30">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-10 md:p-16 text-center glow-border"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Siap Meningkatkan <span className="text-primary text-glow">Keamanan</span>?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Mulai pantau dan kelola tim keamanan Anda dengan platform command center terdepan
            </p>
            <Link to="/login">
              <Button variant="hero" size="xl">
                Mulai Sekarang
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 py-8">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          <p>© 2024 GuardWatch. Sistem Pemantauan Personil Keamanan.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
