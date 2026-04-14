import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Shield, User, Mail, Phone, MapPin, Briefcase, Calendar,
    Camera, Edit2, Save, X, LogOut, CheckCircle, AlertCircle,
    Lock, Key, Eye, EyeOff, Upload
} from "lucide-react";

const ProfilePage = () => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Data user
    const [userData, setUserData] = useState({
        full_name: "Budi Santoso",
        email: "budi.santoso@bodyworncam.com",
        phone: "081234567890",
        position: "Komandan Regu",
        location: "Gedung A, Kampus Utama",
        join_date: "2024-01-15",
        role: "security",
        avatar: null as string | null
    });

    // Form edit
    const [editForm, setEditForm] = useState({ ...userData });

    // Form ganti password
    const [passwordForm, setPasswordForm] = useState({
        current_password: "",
        new_password: "",
        confirm_password: ""
    });

    useEffect(() => {
        // Load user data dari localStorage (simulasi)
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            const user = JSON.parse(savedUser);
            setUserData(prev => ({ ...prev, ...user }));
            setEditForm(prev => ({ ...prev, ...user }));
        }
    }, []);

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

        // Simulasi save ke database
        setTimeout(() => {
            setUserData({ ...editForm });
            localStorage.setItem("user", JSON.stringify(editForm));
            setSuccess("Profil berhasil diperbarui!");
            setIsEditing(false);
            setLoading(false);

            setTimeout(() => setSuccess(""), 3000);
        }, 1000);
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
        localStorage.removeItem("user");
        navigate("/login");
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const avatarUrl = reader.result as string;
                setUserData(prev => ({ ...prev, avatar: avatarUrl }));
                setEditForm(prev => ({ ...prev, avatar: avatarUrl }));
                localStorage.setItem("user", JSON.stringify({ ...userData, avatar: avatarUrl }));
                setSuccess("Foto profil berhasil diupdate!");
                setTimeout(() => setSuccess(""), 3000);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>

            {/* Navbar */}
            <nav className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <Shield className="w-8 h-8 text-blue-500" />
                            <span className="text-lg font-bold text-white">BODY<span className="text-blue-500">WORNCAM</span></span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="text-gray-300 hover:text-white text-sm transition"
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition text-sm"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
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
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
                    {/* Cover Photo */}
                    <div className="h-32 bg-gradient-to-r from-blue-600/20 to-purple-600/20 relative">
                        <div className="absolute -bottom-12 left-8">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center border-4 border-slate-800 shadow-xl overflow-hidden">
                                    {userData.avatar ? (
                                        <img src={userData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-10 h-10 text-white" />
                                    )}
                                </div>
                                <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-600 transition shadow-lg">
                                    <Camera className="w-4 h-4 text-white" />
                                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Profile Info */}
                    <div className="pt-14 pb-6 px-8">
                        <div className="flex justify-between items-start flex-wrap gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    {userData.full_name}
                                </h1>
                                <div className="flex items-center gap-2 mt-1">
                                    <Briefcase className="w-4 h-4 text-blue-400" />
                                    <span className="text-gray-300 text-sm">{userData.position}</span>
                                    <span className="text-gray-500 text-sm">•</span>
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-500 text-sm">Bergabung: {userData.join_date}</span>
                                </div>
                            </div>

                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Edit Profil
                                </button>
                            ) : (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditForm(userData);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 rounded-lg transition"
                                    >
                                        <X className="w-4 h-4" />
                                        Batal
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition"
                                    >
                                        {loading ? (
                                            <div className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                        Simpan
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Profile Details */}
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                    {/* Informasi Pribadi */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-400" />
                            Informasi Pribadi
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Nama Lengkap</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={editForm.full_name}
                                        onChange={handleEditChange}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                ) : (
                                    <p className="text-white">{userData.full_name}</p>
                                )}
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Email</label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={editForm.email}
                                        onChange={handleEditChange}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                ) : (
                                    <p className="text-white">{userData.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Nomor WhatsApp</label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={editForm.phone}
                                        onChange={handleEditChange}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                ) : (
                                    <p className="text-white">{userData.phone || "-"}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Informasi Profesi */}
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-blue-400" />
                            Informasi Profesi
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Posisi</label>
                                {isEditing ? (
                                    <select
                                        name="position"
                                        value={editForm.position}
                                        onChange={handleEditChange}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="Petugas Security">Petugas Security</option>
                                        <option value="Komandan Regu">Komandan Regu</option>
                                        <option value="Kepala Keamanan">Kepala Keamanan</option>
                                        <option value="Administrator">Administrator</option>
                                    </select>
                                ) : (
                                    <p className="text-white">{userData.position}</p>
                                )}
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Lokasi Tugas</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="location"
                                        value={editForm.location}
                                        onChange={handleEditChange}
                                        className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                ) : (
                                    <p className="text-white">{userData.location || "-"}</p>
                                )}
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Role Sistem</label>
                                <p className="text-white capitalize">{userData.role}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Change Password Section */}
                <div className="mt-6">
                    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                        <button
                            onClick={() => setShowChangePassword(!showChangePassword)}
                            className="flex items-center justify-between w-full"
                        >
                            <div className="flex items-center gap-2">
                                <Key className="w-5 h-5 text-blue-400" />
                                <h2 className="text-lg font-semibold text-white">Ganti Password</h2>
                            </div>
                            <span className="text-gray-400">{showChangePassword ? "▲" : "▼"}</span>
                        </button>

                        {showChangePassword && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-4 space-y-4"
                            >
                                <div>
                                    <label className="text-sm text-gray-300 mb-1 block">Password Saat Ini</label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={passwordForm.current_password}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                                            placeholder="Masukkan password saat ini"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                        >
                                            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm text-gray-300 mb-1 block">Password Baru</label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            value={passwordForm.new_password}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                                            placeholder="Minimal 6 karakter"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                        >
                                            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm text-gray-300 mb-1 block">Konfirmasi Password Baru</label>
                                    <input
                                        type="password"
                                        value={passwordForm.confirm_password}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                                        className="w-full px-4 py-2 bg-white/10 border border-white/10 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Ulangi password baru"
                                    />
                                </div>

                                <button
                                    onClick={handleChangePassword}
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition text-sm flex items-center gap-2"
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                                    ) : (
                                        <Lock className="w-4 h-4" />
                                    )}
                                    Update Password
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