import { Settings, Shield, Moon, Sun, Bell, Languages } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h2 className="text-xl font-bold text-foreground">Pengaturan Sistem</h2>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">Konfigurasi preferensi dashboard</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Tampilan */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Sun className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold">Tema Visual</h3>
              <p className="text-xs text-muted-foreground">Pilih mode tampilan dashboard</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTheme("light")}
              className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                theme === "light" ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted"
              }`}
            >
              <Sun className="w-4 h-4" />
              <span className="font-bold text-sm">Terang</span>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all ${
                theme === "dark" ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted"
              }`}
            >
              <Moon className="w-4 h-4" />
              <span className="font-bold text-sm">Gelap</span>
            </button>
          </div>
        </div>

        {/* Bahasa */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Languages className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-bold">Bahasa</h3>
              <p className="text-xs text-muted-foreground">Atur bahasa antarmuka</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => changeLanguage("id")}
              className={`p-4 rounded-xl border-2 transition-all font-bold text-sm ${
                i18n.language === "id" ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted"
              }`}
            >
              Bahasa Indonesia
            </button>
            <button
              onClick={() => changeLanguage("en")}
              className={`p-4 rounded-xl border-2 transition-all font-bold text-sm ${
                i18n.language === "en" ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-muted"
              }`}
            >
              English
            </button>
          </div>
        </div>

        {/* Notifikasi */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
              <Bell className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-bold">Notifikasi Suara</h3>
              <p className="text-xs text-muted-foreground">Alarm peringatan otomatis</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
            <span className="text-sm font-medium">Aktifkan Suara Alert</span>
            <div className="w-12 h-6 bg-primary rounded-full relative">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
            </div>
          </div>
        </div>

        {/* Keamanan */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center border border-success/20">
              <Shield className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="font-bold">Keamanan</h3>
              <p className="text-xs text-muted-foreground">Status enkripsi & autentikasi</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground italic">Sistem sedang menggunakan enkripsi End-to-End untuk semua aliran video dan data GPS.</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
