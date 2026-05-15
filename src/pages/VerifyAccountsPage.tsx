import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Check, X, Loader2, AlertCircle, CheckCircle, Trash2, ShieldCheck, UserCog } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface UserData {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  status_acc: string;
  position: string;
  created_at: string;
}

const VerifyAccountsPage = () => {
  const [pendingUsers, setPendingUsers] = useState<UserData[]>([]);
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const { user } = useAuth();
  const token = localStorage.getItem("jwtToken");
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not admin or supervisor
    if (user && user.role !== 'admin' && user.role !== 'supervisor') {
      navigate("/dashboard");
      return;
    }

    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pendingRes, allRes] = await Promise.all([
        fetch("/api/admin/pending-users", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const pendingData = await pendingRes.json();
      const allData = await allRes.json();

      if (pendingRes.ok && pendingData.success) setPendingUsers(pendingData.users);
      if (allRes.ok && allData.success) setAllUsers(allData.users);

    } catch (err) {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId: number, action: 'approve' | 'reject') => {
    setActionLoading(userId);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/approve-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(`User berhasil di-${action === 'approve' ? 'setujui' : 'tolak'}.`);
        setPendingUsers(pendingUsers.filter(u => u.id !== userId));
        fetchData(); // Refresh all users list too
      } else {
        setError(data.message || "Gagal memproses permintaan.");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-foreground">Verifikasi & Manajemen Pengguna</h2>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">Kelola hak akses dan persetujuan akun</p>
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive"
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
            className="p-4 bg-success/10 border border-success/20 rounded-xl flex items-center gap-3 text-success"
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{success}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Pending Users (1/3) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <UserCog className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">Tunggu Persetujuan</h3>
            <span className="ml-auto bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20">
              {pendingUsers.length}
            </span>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm min-h-[200px]">
            {loading ? (
              <div className="p-8 flex flex-col items-center justify-center text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mb-2" />
                <p className="text-xs">Memuat...</p>
              </div>
            ) : pendingUsers.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-muted-foreground text-center">
                <ShieldCheck className="w-10 h-10 opacity-20 mb-3" />
                <p className="text-xs">Semua pendaftaran telah diproses.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {pendingUsers.map((u) => (
                  <div key={u.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex flex-col gap-3">
                      <div>
                        <p className="font-bold text-sm text-foreground">{u.full_name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{u.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAction(u.id, 'approve')}
                          disabled={actionLoading !== null}
                          className="flex-1 py-1.5 bg-success text-success-foreground rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 hover:bg-success/90 transition-all"
                        >
                          {actionLoading === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                          SETUJUI
                        </button>
                        <button
                          onClick={() => handleAction(u.id, 'reject')}
                          disabled={actionLoading !== null}
                          className="flex-1 py-1.5 bg-destructive/10 text-destructive rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 hover:bg-destructive/20 transition-all"
                        >
                          {actionLoading === u.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                          TOLAK
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: All Users (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-bold text-foreground">Daftar Semua Pengguna</h3>
            <span className="ml-auto bg-muted text-muted-foreground text-[10px] font-bold px-2 py-0.5 rounded-full border border-border">
              {allUsers.length} TOTAL
            </span>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/30 border-b border-border text-left">
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Pengguna</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Jabatan & Role</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Terdaftar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 opacity-20" />
                        <p className="text-xs">Memuat daftar user...</p>
                      </td>
                    </tr>
                  ) : allUsers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                        <p className="text-xs">Belum ada user terdaftar.</p>
                      </td>
                    </tr>
                  ) : (
                    allUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold text-xs border border-border">
                              {u.full_name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">{u.full_name}</p>
                              <p className="text-[10px] text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-medium text-foreground">{u.position || "-"}</p>
                          <span className={`text-[9px] font-bold uppercase tracking-tight ${
                            u.role === 'admin' ? 'text-red-500' : u.role === 'supervisor' ? 'text-primary' : 'text-slate-400'
                          }`}>
                            {u.role === 'admin' ? 'Administrator' : u.role === 'supervisor' ? 'Supervisor' : 'Operator'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
                            u.status_acc === 'approved' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'
                          }`}>
                            {u.status_acc === 'approved' ? "AKTIF" : u.status_acc === 'pending' ? "PENDING" : "DITOLAK"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-[10px] text-muted-foreground">
                            {new Date(u.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyAccountsPage;
