import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, User, Check, X, Loader2, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface PendingUser {
  id: number;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  created_at: string;
}

const VerifyAccountsPage = () => {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user } = useAuth();
  const token = localStorage.getItem("jwtToken");
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== 'admin') {
      navigate("/dashboard");
      return;
    }

    fetchPendingUsers();
  }, [user, navigate]);

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pending-users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.users);
      } else {
        setError(data.message || "Gagal mengambil data user pending.");
      }
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
        // Remove from list
        setUsers(users.filter(u => u.id !== userId));
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
    <div className="space-y-6">
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

        {/* Content */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.1)]">
          <div className="p-5 border-b border-border">
            <h2 className="font-semibold text-foreground">Daftar Tunggu Persetujuan</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{users.length} akun menunggu di-ACC</p>
          </div>

          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
              <p className="text-sm">Memuat data user...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-muted-foreground">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <User className="w-8 h-8 opacity-50" />
              </div>
              <p className="text-sm">Tidak ada pendaftaran baru yang perlu diverifikasi.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {users.map((u) => (
                <div key={u.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{u.full_name || "Tanpa Nama"}</h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-xs text-muted-foreground">
                        <span className="font-mono">{u.email}</span>
                        <span>•</span>
                        <span>{u.phone}</span>
                        <span>•</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          u.role === 'supervisor' ? 'bg-primary/20 text-primary' : 'bg-slate-500/20 text-slate-400'
                        }`}>
                          {u.role === 'supervisor' ? 'Kepala Keamanan' : 'Operator'}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Daftar pada: {new Date(u.created_at).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center">
                    <button
                      onClick={() => handleAction(u.id, 'approve')}
                      disabled={actionLoading !== null}
                      className="px-3 py-1.5 bg-success text-success-foreground rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-success/90 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === u.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      ACC
                    </button>
                    <button
                      onClick={() => handleAction(u.id, 'reject')}
                      disabled={actionLoading !== null}
                      className="px-3 py-1.5 bg-destructive text-destructive-foreground rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-destructive/90 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === u.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <X className="w-3.5 h-3.5" />
                      )}
                      Tolak
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
};

export default VerifyAccountsPage;
