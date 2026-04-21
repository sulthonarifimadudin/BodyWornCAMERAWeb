import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Shield, User, Mail, Phone, MapPin, Briefcase, Calendar,
    Camera, Edit2, Save, X, LogOut, CheckCircle, AlertCircle,
    Lock, Key, Eye, EyeOff, Upload
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import { Globe, Sun, Moon, Languages } from "lucide-react";

const ProfilePage = () => {
    const navigate = useNavigate();
    const { user, fetchUser, logout } = useAuth();
    const { t, i18n } = useTranslation();
    const { theme, setTheme } = useTheme();
    
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Provide default fallback values for UI safely
    const displayUser = {
        full_name: user?.full_name || "Pengguna Baru",
        email: user?.email || "-",
        phone: user?.phone || "-",
        position: user?.position || "-",
        location: user?.location || "-",
        join_date: (user as any)?.join_date || "-",
        role: user?.role || "user",
        profile_image: user?.profile_image || null,
        avatar: user?.avatar || null
    };

    const avatarSrc = displayUser.profile_image 
        ? `/uploads/${displayUser.profile_image}` 
        : displayUser.avatar;

    // Form edit initial configuration
    const [editForm, setEditForm] = useState({ ...displayUser });

    // Sync form whenever 'user' context updates
    useEffect(() => {
        if (user) {
            setEditForm({
                full_name: user.full_name || "",
                email: user.email || "",
                phone: user.phone || "",
                position: user.position || "",
                location: user.location || "",
                join_date: (user as any)?.join_date || "",
                role: user.role || "",
                profile_image: user.profile_image || null,
                avatar: user.avatar || null
            });
        }
    }, [user]);

    // Form ganti password
    const [passwordForm, setPasswordForm] = useState({
        current_password: "",
        new_password: "",
        confirm_password: ""
    });

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setEditForm({
            ...editForm,
            [e.target.name]: e.target.value
        });
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        setError("");
        setSuccess("");

        if (!editForm.full_name || !editForm.phone) {
            setError("Nama lengkap dan nomor telepon wajib diisi.");
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem("jwtToken");
            const response = await fetch('/api/update-profile', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    full_name: editForm.full_name,
                    phone: editForm.phone,
                    position: editForm.position,
                    location: editForm.location
                })
            });
            const data = await response.json();
            
            if (response.ok && data.success) {
                setSuccess("Profil berhasil diperbarui!");
                setIsEditing(false);
                // Refresh data user di sistem Context agar sinkron
                await fetchUser();
            } else {
                setError(data.message || "Gagal memperbarui profil.");
            }
        } catch (err) {
            setError("Gagal terhubung ke server.");
        } finally {
            setLoading(false);
            setTimeout(() => setSuccess(""), 3000);
        }
    };

    const handleChangePassword = async () => {
        setLoading(true);
        setError("");
        setSuccess("");

        if (passwordForm.new_password !== passwordForm.confirm_password) {
            setError("Password baru tidak sama");
            setLoading(false);
            return;
        }

        if (passwordForm.new_password.length < 6) {
            setError("Password minimal 6 karakter");
            setLoading(false);
            return;
        }

        // Simulasi ganti password
        setTimeout(() => {
            setSuccess("Password berhasil diubah!");
            setPasswordForm({
                current_password: "",
                new_password: "",
                confirm_password: ""
            });
            setShowChangePassword(false);
            setLoading(false);

            setTimeout(() => setSuccess(""), 3000);
        }, 1000);
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            setError("Ukuran gambar terlalu besar (Maks 2MB)");
            return;
        }

        const formData = new FormData();
        formData.append("image", file);

        setLoading(true);
        setError("");
        
        try {
            const token = localStorage.getItem("jwtToken");
            const res = await fetch("/api/update-profile-image", {
                method: "PUT",
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            const data = await res.json();
            
            if (res.ok && data.success) {
                setSuccess("Foto profil berhasil diperbarui!");
                // Refresh Context untuk menarik image string yang baru
                await fetchUser();
            } else {
                setError(data.message || "Upload foto gagal.");
            }
        } catch (err) {
            setError("Gagal terhubung ke server untuk upload foto.");
        } finally {
            setLoading(false);
            setTimeout(() => setSuccess(""), 3000);
        }
    };

    return (
    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300 overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-30 dark:opacity-100 transition-opacity duration-1000">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.2)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.2)_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>

            {/* Navbar */}
            <nav className="relative z-10 border-b border-border bg-background/80 backdrop-blur-md">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <Shield className="w-8 h-8 text-primary" />
                            <span className="text-lg font-bold text-foreground">BODY<span className="text-primary font-orbitron">WORNCAM</span></span>
                        </div>
                        <div className="flex items-center gap-3">
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

                            <button
                                onClick={() => navigate("/dashboard")}
                                className="text-muted-foreground hover:text-foreground text-sm font-semibold transition"
                            >
                                {t('dashboard.home')}
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-3 py-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition text-sm font-bold shadow-sm"
                            >
                                <LogOut className="w-4 h-4" />
                                {t('dashboard.logout')}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Success/Error Messages */}
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm flex items-center gap-2"
                    >
                        <CheckCircle className="w-4 h-4" />
                        {success}
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2"
                    >
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </motion.div>
                )}

                {/* Profile Header */}
                <div className="bg-card backdrop-blur-xl rounded-3xl border border-border overflow-hidden shadow-xl shadow-primary/5">
                    {/* Cover Photo */}
                    <div className="h-32 bg-gradient-to-r from-primary/10 to-purple-500/10 relative">
                        <div className="absolute -bottom-12 left-8">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-2xl bg-primary flex items-center justify-center border-4 border-background shadow-2xl overflow-hidden relative group">
                                    {loading && (
                                        <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center">
                                            <div className="w-6 h-6 border-2 border-primary/60 border-t-primary rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                    {avatarSrc ? (
                                        <img src={avatarSrc} alt="Avatar" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                    ) : (
                                        <User className="w-10 h-10 text-primary-foreground" />
                                    )}
                                </div>
                                <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-all shadow-lg text-primary-foreground border-4 border-background">
                                    <Camera className="w-4 h-4" />
                                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="pt-14 pb-6 px-8">
                        <div className="flex justify-between items-start flex-wrap gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                                    {displayUser.full_name}
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <Briefcase className="w-4 h-4 text-primary" />
                                    <span className="text-muted-foreground text-sm font-medium">{displayUser.position}</span>
                                    {displayUser.join_date && displayUser.join_date !== "-" && (
                                        <>
                                            <span className="text-border text-sm">•</span>
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-muted-foreground text-sm font-medium">{t('profile.joined')}: {displayUser.join_date}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all font-bold shadow-sm"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    {t('profile.editProfile')}
                                </button>
                            ) : (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditForm({ ...displayUser });
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-muted-foreground rounded-xl transition-all font-bold shadow-sm"
                                    >
                                        <X className="w-4 h-4" />
                                        {t('profile.cancel')}
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all font-bold shadow-lg shadow-primary/20"
                                    >
                                        {loading ? (
                                            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                        {t('profile.saveChanges')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile Details */}
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                    {/* Informasi Pribadi */}
                    <div className="bg-card backdrop-blur-xl rounded-3xl border border-border p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <User className="w-5 h-5 text-primary" />
                            </div>
                            {t('profile.personalInfo')}
                        </h2>

                        <div className="space-y-5">
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground block mb-1 uppercase tracking-widest">{t('profile.fullName')}</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={editForm.full_name}
                                        onChange={handleEditChange}
                                        className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-foreground font-medium text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                ) : (
                                    <p className="text-foreground font-semibold px-1">{displayUser.full_name}</p>
                                )}
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground block mb-1 uppercase tracking-widest">{t('profile.email')}</label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={editForm.email}
                                        onChange={handleEditChange}
                                        disabled
                                        className="w-full px-4 py-2.5 bg-muted/10 border border-border rounded-xl text-muted-foreground text-sm outline-none cursor-not-allowed opacity-70"
                                        title="Email tidak dapat diubah"
                                    />
                                ) : (
                                    <p className="text-foreground font-semibold px-1">{displayUser.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground block mb-1 uppercase tracking-widest">{t('profile.phone')}</label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={editForm.phone}
                                        onChange={handleEditChange}
                                        className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-foreground font-medium text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                ) : (
                                    <p className="text-foreground font-semibold px-1">{displayUser.phone || "-"}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Informasi Profesi */}
                    <div className="bg-card backdrop-blur-xl rounded-3xl border border-border p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Briefcase className="w-5 h-5 text-primary" />
                            </div>
                            {t('profile.profInfo')}
                        </h2>

                        <div className="space-y-5">
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground block mb-1 uppercase tracking-widest">{t('profile.position')}</label>
                                {isEditing ? (
                                    <select
                                        name="position"
                                        value={editForm.position}
                                        onChange={handleEditChange}
                                        className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-foreground font-medium text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    >
                                        <option value="Petugas Security">Petugas Security</option>
                                        <option value="Komandan Regu">Komandan Regu</option>
                                        <option value="Kepala Keamanan">Kepala Keamanan</option>
                                        <option value="Administrator">Administrator</option>
                                    </select>
                                ) : (
                                    <p className="text-foreground font-semibold px-1">{displayUser.position}</p>
                                )}
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground block mb-1 uppercase tracking-widest">{t('profile.location')}</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="location"
                                        value={editForm.location}
                                        onChange={handleEditChange}
                                        className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-foreground font-medium text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    />
                                ) : (
                                    <p className="text-foreground font-semibold px-1">{displayUser.location || "-"}</p>
                                )}
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground block mb-1 uppercase tracking-widest">{t('profile.systemRole')}</label>
                                <p className="text-primary font-bold px-1 uppercase tracking-tighter text-sm">{displayUser.role}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Change Password Section */}
                <div className="mt-6">
                    <div className="bg-card backdrop-blur-xl rounded-3xl border border-border p-6 shadow-sm">
                        <button
                            onClick={() => setShowChangePassword(!showChangePassword)}
                            className="flex items-center justify-between w-full group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                                    <Key className="w-5 h-5 text-primary" />
                                </div>
                                <h2 className="text-lg font-bold text-foreground tracking-tight">{t('profile.changePassword')}</h2>
                            </div>
                            <span className="text-muted-foreground transition-transform duration-300" style={{ transform: showChangePassword ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                        </button>

                        {showChangePassword && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-4 space-y-4"
                            >
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-widest">{t('profile.currentPassword')}</label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={passwordForm.current_password}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-foreground font-medium text-sm focus:ring-2 focus:ring-primary/20 outline-none pr-10"
                                            placeholder={t('profile.currentPassword')}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-widest">{t('profile.newPassword')}</label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            value={passwordForm.new_password}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-foreground font-medium text-sm focus:ring-2 focus:ring-primary/20 outline-none pr-10"
                                            placeholder="Minimal 6 karakter"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground mb-1 block uppercase tracking-widest">{t('profile.confirmPassword')}</label>
                                    <input
                                        type="password"
                                        value={passwordForm.confirm_password}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-muted/30 border border-border rounded-xl text-foreground font-medium text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder={t('profile.confirmPassword')}
                                    />
                                </div>

                                <button
                                    onClick={handleChangePassword}
                                    disabled={loading}
                                    className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20"
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                    ) : (
                                        <Lock className="w-4 h-4" />
                                    )}
                                    {t('profile.updatePassword')}
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
