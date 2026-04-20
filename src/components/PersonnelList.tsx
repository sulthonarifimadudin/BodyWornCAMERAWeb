import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, MapPin, Battery, Heart, Radio, Pencil, X, Save, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Personnel } from "@/hooks/useRealtimePersonnel";
import { useAuth } from "@/context/AuthContext";

interface PersonnelListProps {
  personnel: Personnel[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const PersonnelList = ({ personnel, selectedId, onSelect }: PersonnelListProps) => {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const onlineCount = personnel.filter((p) => p.status !== "offline").length;

  // State for Editing
  const [editingPerson, setEditingPerson] = useState<Personnel | null>(null);
  const [editForm, setEditForm] = useState({ name: "", role: "", location: "" });
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = (e: React.MouseEvent, person: Personnel) => {
    e.stopPropagation();
    setEditingPerson(person);
    setEditForm({ name: person.name, role: person.role, location: person.location });
  };

  const handleSave = async () => {
    if (!editingPerson) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(`/api/admin/users/${editingPerson.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: editForm.name,
          position: editForm.role,
          location: editForm.location,
        }),
      });

      if (res.ok) {
        setEditingPerson(null);
        window.location.reload(); // Refresh to get updated data
      } else {
        alert("Gagal memperbarui data personil");
      }
    } catch (err) {
      console.error("Error updating personnel:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative h-full">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-card rounded-xl h-[500px] flex flex-col"
      >
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <h2 className="font-display font-semibold">Daftar Personil</h2>
          <span className="text-xs text-muted-foreground">{onlineCount} aktif</span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {personnel.length === 0 && (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Tidak ada data personil
            </div>
          )}
          {personnel.map((person, i) => (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelect(selectedId === person.id ? null : person.id)}
              className={cn(
                "p-3 rounded-lg cursor-pointer transition-all duration-200 border group",
                selectedId === person.id
                  ? "bg-primary/10 border-primary/50"
                  : "bg-secondary/50 border-transparent hover:bg-secondary hover:border-border"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {person.profile_image ? (
                        <img src={`/uploads/${person.profile_image}`} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <span className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card",
                    person.status === "online" && "bg-success",
                    person.status === "alert" && "bg-destructive animate-pulse",
                    person.status === "idle" && "bg-warning",
                    person.status === "offline" && "bg-gray-500"
                  )} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="font-medium text-sm truncate">{person.name}</span>
                      <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">
                        ID: {person.id}
                      </span>
                    </div>
                    {isAdmin && (
                        <button 
                            onClick={(e) => handleEdit(e, person)}
                            className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-blue-400 transition-opacity opacity-0 group-hover:opacity-100"
                            title="Edit Personil"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <Shield className="w-3" />
                    <span className="truncate">{person.role}</span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{person.location || 'Tidak diketahui'}</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-xs">
                      <Battery className={cn(
                        "w-3 h-3",
                        person.battery > 50 ? "text-success" : person.battery > 20 ? "text-warning" : "text-destructive"
                      )} />
                      <span className="text-muted-foreground">{person.battery}%</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Heart className={cn(
                        "w-3 h-3",
                        person.heart_rate > 90 ? "text-destructive animate-pulse" : "text-success"
                      )} />
                      <span className="text-muted-foreground">{person.heart_rate} bpm</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingPerson && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            >
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Pencil className="w-5 h-5 text-blue-400" />
                            Manajemen Personil #{editingPerson.id}
                        </h3>
                        <button onClick={() => setEditingPerson(null)} className="text-gray-400 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">NAMA SATPAM / PERANGKAT</label>
                            <input 
                                value={editForm.name}
                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 transition"
                                placeholder="Masukkan nama..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">JABATAN / DIVISI</label>
                            <input 
                                value={editForm.role}
                                onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 transition"
                                placeholder="Contoh: Security Gate 1"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">LOKASI PENUGASAN (OPSIONAL)</label>
                            <input 
                                value={editForm.location}
                                onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 transition"
                                placeholder="Contoh: Gedung A"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button 
                            disabled={isSaving}
                            onClick={() => setEditingPerson(null)}
                            className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition font-medium"
                        >
                            Batal
                        </button>
                        <button 
                            disabled={isSaving}
                            onClick={handleSave}
                            className="flex-1 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition font-bold flex items-center justify-center gap-2"
                        >
                            {isSaving ? "Menyimpan..." : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Simpan Perubahan
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PersonnelList;
