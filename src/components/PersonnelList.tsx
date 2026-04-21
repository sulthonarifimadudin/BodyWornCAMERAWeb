import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, MapPin, Battery, Heart, Radio, Pencil, X, Save, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";

interface PersonnelListProps {
  personnel: Personnel[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const PersonnelList = ({ personnel, selectedId, onSelect }: PersonnelListProps) => {
  const { t } = useTranslation();
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
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-display font-semibold text-white">{t('dashboard.personnelList')}</h2>
          <span className="text-xs text-gray-500">{onlineCount} {t('dashboard.online')}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {personnel.length === 0 && (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm font-medium italic">
              {t('dashboard.noPersonnel', { defaultValue: 'No personnel data' })}
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
                  ? "bg-blue-500/10 border-blue-500/50"
                  : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center overflow-hidden border border-white/10">
                    {person.profile_image ? (
                        <img src={`/uploads/${person.profile_image}`} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <span className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900",
                    person.status === "online" && "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]",
                    person.status === "alert" && "bg-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.5)]",
                    person.status === "idle" && "bg-amber-500",
                    person.status === "offline" && "bg-gray-600"
                  )} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="font-medium text-sm truncate text-white">{person.name}</span>
                      <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">
                        ID: {person.id}
                      </span>
                    </div>
                    {isAdmin && (
                        <button 
                            onClick={(e) => handleEdit(e, person)}
                            className="p-1.5 rounded-md hover:bg-white/10 text-gray-400 hover:text-blue-400 transition-all opacity-0 group-hover:opacity-100"
                            title={t('profile.editProfile')}
                        >
                            <Pencil className="w-3.5 h-3.5" />
                        </button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                    <Shield className="w-3" />
                    <span className="truncate">{person.role}</span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{person.location || t('profile.notFilled')}</span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1 text-xs">
                      <Battery className={cn(
                        "w-3 h-3",
                        person.battery > 50 ? "text-green-500" : person.battery > 20 ? "text-amber-500" : "text-red-500"
                      )} />
                      <span className="text-gray-500">{person.battery}%</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <Heart className={cn(
                        "w-3 h-3",
                        person.heart_rate > 90 ? "text-red-500 animate-pulse" : "text-green-500"
                      )} />
                      <span className="text-gray-500">{person.heart_rate} bpm</span>
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
                    className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <Pencil className="w-5 h-5 text-primary" />
                            {t('profile.editProfile')} #{editingPerson.id}
                        </h3>
                        <button onClick={() => setEditingPerson(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">{t('profile.fullName')}</label>
                            <input 
                                value={editForm.name}
                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                placeholder={t('profile.fullName')}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">{t('profile.position')}</label>
                            <input 
                                value={editForm.role}
                                onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                placeholder={t('profile.position')}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground mb-1 uppercase tracking-wider">{t('profile.location')}</label>
                            <input 
                                value={editForm.location}
                                onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                                className="w-full bg-muted/30 border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                placeholder={t('profile.location')}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button 
                            disabled={isSaving}
                            onClick={() => setEditingPerson(null)}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-border text-foreground hover:bg-muted transition-colors font-semibold shadow-sm"
                        >
                            {t('profile.cancel')}
                        </button>
                        <button 
                            disabled={isSaving}
                            onClick={handleSave}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground transition-all font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                        >
                            {isSaving ? t('profile.saving', { defaultValue: 'Saving...' }) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    {t('profile.saveChanges')}
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
