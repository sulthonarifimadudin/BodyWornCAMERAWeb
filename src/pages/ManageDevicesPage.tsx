import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Plus, Trash2, Loader2, AlertCircle, CheckCircle, ArrowLeft, Camera, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface Device {
  id: number;
  device_name: string;
  personnel_name: string;
  status: string;
  created_at: string;
}

const ManageDevicesPage = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState({
    device_name: "",
    personnel_name: ""
  });

  const { user } = useAuth();
  const token = localStorage.getItem("jwtToken");
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not admin/supervisor
    if (user && user.role !== 'admin' && user.role !== 'supervisor') {
      navigate("/dashboard");
      return;
    }
    fetchDevices();
  }, [user, navigate]);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/devices", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDevices(data.devices);
      } else {
        setError(data.message || "Gagal mengambil data alat.");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(0); // 0 for adding
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/devices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess("Alat baru berhasil ditambahkan.");
        setFormData({ device_name: "", personnel_name: "" });
        setIsAdding(false);
        fetchDevices();
      } else {
        setError(data.message || "Gagal menambahkan alat.");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteDevice = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus alat ini? Semua data history lokasi alat ini juga akan terhapus.")) return;
    
    setActionLoading(id);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/admin/devices/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess("Alat berhasil dihapus.");
        setDevices(devices.filter(d => d.id !== id));
      } else {
        setError(data.message || "Gagal menghapus alat.");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Manajemen Perangkat</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">Konfigurasi & Monitoring Alat Raspi</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          {isAdding ? "Batal" : "Tambah Alat Baru"}
        </button>
      </div>

      {/* Alerts */}

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-success/10 border border-success/20 rounded-xl flex items-center gap-3 text-success"
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{success}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add Device Form */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-card border border-primary/20 rounded-2xl p-6 shadow-xl">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Form Tambah Alat Baru
                </h2>
                <form onSubmit={handleAddDevice} className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Nama Alat (Misal: Raspi Cam 2)</label>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama alat..."
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition"
                      value={formData.device_name}
                      onChange={(e) => setFormData({...formData, device_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Nama Petugas (Yang membawa)</label>
                    <input
                      type="text"
                      required
                      placeholder="Masukkan nama petugas..."
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition"
                      value={formData.personnel_name}
                      onChange={(e) => setFormData({...formData, personnel_name: e.target.value})}
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={actionLoading === 0}
                      className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                      {actionLoading === 0 ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                      Simpan Alat
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Devices List */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 border-b border-border bg-muted/30">
            <h2 className="font-bold text-foreground">Daftar Alat Terdaftar</h2>
            <p className="text-xs text-muted-foreground mt-0.5">ID Alat ini yang harus dimasukkan ke dalam script Raspi</p>
          </div>

          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
              <p className="text-sm tracking-wide">Memuat data alat...</p>
            </div>
          ) : devices.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-muted-foreground">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Camera className="w-8 h-8 opacity-30" />
              </div>
              <p className="text-sm">Belum ada alat yang terdaftar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">ID Alat (PENTING)</th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Nama Perangkat</th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Nama Petugas</th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {devices.map((d) => (
                    <tr key={d.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg font-mono font-bold text-sm border border-primary/20">
                          {d.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <Radio className="w-4 h-4 text-slate-500" />
                          </div>
                          <span className="font-bold text-slate-700 dark:text-slate-200">{d.device_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <User className="w-4 h-4 opacity-50" />
                          <span>{d.personnel_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-success/10 text-success border border-success/20">
                          {d.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteDevice(d.id)}
                          disabled={actionLoading === d.id}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Hapus Alat"
                        >
                          {actionLoading === d.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 p-6 bg-primary/5 border border-primary/10 rounded-2xl flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-primary">Petunjuk Penggunaan ID Alat</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Setiap alat Raspi memiliki **ID unik** (kolom pertama). Pastikan Komandan memasukkan angka ID tersebut ke dalam file konfigurasi Python di Raspberry Pi masing-masing agar data GPS dan video dapat terhubung dengan benar ke nama petugas yang sesuai.
            </p>
          </div>
        </div>
    </div>
  );
};

export default ManageDevicesPage;
