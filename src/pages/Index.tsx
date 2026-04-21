import { Shield, MapPin, Video, Users, Activity, Radio, ChevronRight, Eye, Lock, Zap, Globe, Sun, Moon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";

const Index = () => {
  const { isLoggedIn, logout, user } = useAuth();
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  
  const features = [
    {
      icon: MapPin,
      title: t('dashboard.liveUpdate'),
      description: t('home.heroSubtitle')
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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none transition-opacity duration-1000 dark:opacity-100 opacity-30">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.2)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.2)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-50 bg-background/80 backdrop-blur-xl border-b border-border shadow-lg"
      >
        <div className="max-width-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-wider text-foreground">
              BODY<span className="text-primary font-orbitron">WORNCAM</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <button
                onClick={() => i18n.changeLanguage(i18n.language === 'id' ? 'en' : 'id')}
                className="p-2 bg-muted/50 border border-border rounded-xl text-muted-foreground hover:text-foreground transition-all flex items-center gap-2"
                title="Switch Language"
            >
                <Globe className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-tight">{i18n.language}</span>
            </button>

            {/* Theme Toggle */}
            <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 bg-muted/50 border border-border rounded-xl text-muted-foreground hover:text-foreground transition-all"
                title="Toggle Theme"
            >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-primary" />}
            </button>

            {isLoggedIn ? (
              <>
                <Link to="/profile">
                  <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-muted shadow-sm border border-border rounded-xl text-foreground text-sm hover:bg-muted/80 transition font-medium">
                    {user?.profile_image && (
                      <img src={`/uploads/${user.profile_image}`} alt="Avatar" className="w-5 h-5 rounded-full object-cover" />
                    )}
                    <span>Halo, {user?.full_name?.split(' ')[0] || 'Personil'}</span>
                  </button>
                </Link>
                <button
                  onClick={() => logout()}
                  className="px-4 py-2 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-sm hover:bg-destructive/20 transition font-bold"
                >
                  {t('dashboard.logout')}
                </button>
              </>
            ) : (
              <Link to="/login">
                <button className="px-4 py-2 bg-muted border border-border text-foreground rounded-xl text-sm hover:bg-muted/80 transition font-semibold">
                  Login
                </button>
              </Link>
            )}
            <Link to="/dashboard">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20 transition-all duration-300">
                {isLoggedIn ? t('home.ctaDashboard') : t('home.heroButton')}
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
              className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-primary font-bold tracking-tight">{t('home.heroBadge')}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight text-foreground tracking-tight"
            >
              {t('home.heroTitle1')}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-500">
                {t('home.heroTitle2')}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed font-medium"
            >
              {t('home.heroSubtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to={isLoggedIn ? "/dashboard" : "/login"}>
                <button className="flex items-center justify-center gap-2 px-8 py-4 bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl font-bold text-lg shadow-xl shadow-primary/25 transition-all duration-300 group">
                  <span>{t('home.heroButton')}</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <button className="flex items-center justify-center gap-2 px-8 py-4 bg-muted border border-border text-foreground rounded-xl font-bold text-lg hover:bg-muted/80 transition-all duration-300 backdrop-blur-xl">
                {t('home.heroDemo')}
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
                className="bg-card backdrop-blur-xl border border-border rounded-2xl p-6 text-center hover:border-primary/30 hover:bg-muted transition-all duration-300 shadow-sm"
              >
                <stat.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="text-3xl md:text-4xl font-bold text-foreground mb-1 font-orbitron tracking-tight">{stat.value}</div>
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</div>
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
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('home.featuresTitle1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-500">{t('home.featuresTitle2')}</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto font-medium">
              {t('home.featuresSubtitle')}
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
            className="bg-gradient-to-br from-primary/10 to-purple-500/10 backdrop-blur-xl border border-border rounded-3xl p-10 md:p-16 text-center shadow-2xl"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-lg shadow-primary/30 mb-6">
              <Lock className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('home.ctaTitle')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-500">{t('home.ctaTitle2')}</span>?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto font-medium">
              {t('home.ctaSubtitle')}
            </p>
            <Link to={isLoggedIn ? "/dashboard" : "/login"}>
              <button className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl font-bold text-lg shadow-xl shadow-primary/25 transition-all duration-300 group">
                {isLoggedIn ? t('home.ctaDashboard') : t('home.ctaButton')}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
          <p>{t('home.footer')}</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
