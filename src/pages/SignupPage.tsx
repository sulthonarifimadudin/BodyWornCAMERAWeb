import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Shield, Mail, Lock, User, Eye, EyeOff, ArrowRight,
    UserPlus, CheckCircle, AlertCircle, Phone, MapPin, Briefcase
} from "lucide-react";

const SignupPage = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        position: "Petugas Security",
        location: "",
        password: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [step, setStep] = useState<'form' | 'otp'>('form');
    const [otpCode, setOtpCode] = useState("");
    const navigate = useNavigate();

    const calculatePasswordStrength = (pass: string) => {
        let strength = 0;
        if (pass.length === 0) return 0;
        if (pass.length >= 6) strength += 20;
        if (pass.length >= 8) strength += 20;
        if (/[A-Z]/.test(pass)) strength += 20;
        if (/[0-9]/.test(pass)) strength += 20;
        if (/[^A-Za-z0-9]/.test(pass)) strength += 20;
        return Math.min(100, strength);
    };

    const passwordStrength = calculatePasswordStrength(formData.password);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        if (formData.password !== formData.confirmPassword) {
            setError("Password dan konfirmasi password tidak sama");
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError("Password minimal 6 karakter");
            setLoading(false);
            return;
        }

        if (!formData.fullName) {
            setError("Nama lengkap harus diisi");
            setLoading(false);
            return;
        }

        if (!formData.email) {
            setError("Email harus diisi");
            setLoading(false);
            return;
        }

        if (!formData.phone) {
            setError("Nomor HP harus diisi untuk verifikasi WhatsApp");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: formData.email, 
                    password: formData.password, 
                    phone: formData.phone,
                    fullName: formData.fullName,
                    position: formData.position,
                    location: formData.location
                })
            });
            const data = await response.json();
            
            if (response.ok && data.success) {
                setSuccess("Akun berhasil dibuat. OTP telah dikirim ke WhatsApp Anda untuk verifikasi.");
                setStep('otp');
            } else {
                setError(data.message || "Gagal melakukan registrasi");
            }
        } catch (err) {
            setError("Gagal terhubung ke server backend. Pastikan server berjalan.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");
        
        try {
            const response = await fetch('/api/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, otp: otpCode })
            });
            const data = await response.json();

            if (response.ok && data.success) {
                setSuccess("Verifikasi OTP Pendaftaran berhasil! Mengalihkan ke halaman login...");
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } else {
                setError(data.message || "Kode OTP Tidak Valid atau Kadaluarsa.");
            }
        } catch (err) {
            setError("Gagal memverifikasi OTP.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full relative z-10"
            >
                {/* Logo */}
                <div className="text-center mb-6">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.6 }}
                        className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-2xl shadow-blue-500/30 mb-3"
                    >
                        <Shield className="w-8 h-8 text-white" />
                    </motion.div>
                    <h1 className="text-xl font-bold text-white">BODYWORNCAM</h1>
                    <p className="text-gray-400 text-sm">Sistem Keamanan Kampus</p>
                </div>

                {/* Signup Card */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
                    <div className="flex items-center gap-2 mb-5">
                        <UserPlus className="w-5 h-5 text-blue-400" />
                        <h2 className="text-xl font-semibold text-white">Daftar Akun Baru</h2>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2"
                        >
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </motion.div>
                    )}

                    {success && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm flex items-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" />
                            {success}
                        </motion.div>
                    )}

                    {step === 'form' ? (
                        <form onSubmit={handleSignup} className="space-y-4">
                        {/* Nama Lengkap */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Nama Lengkap *</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition" />
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder:text-gray-500 transition text-sm"
                                    placeholder="Masukkan nama lengkap"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Email *</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder:text-gray-500 transition text-sm"
                                    placeholder="masukkan@email.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* No HP */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Nomor WhatsApp/HP</label>
                            <div className="relative group">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder:text-gray-500 transition text-sm"
                                    placeholder="0812xxxxxx"
                                />
                            </div>
                        </div>

                        {/* Posisi */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Posisi</label>
                            <div className="relative group">
                                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition" />
                                <select
                                    name="position"
                                    value={formData.position}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white transition text-sm appearance-none cursor-pointer"
                                >
                                    <option value="Petugas Security">Petugas Security</option>
                                    <option value="Komandan Regu">Komandan Regu</option>
                                    <option value="Kepala Keamanan">Kepala Keamanan</option>
                                    <option value="Administrator">Administrator</option>
                                </select>
                            </div>
                        </div>

                        {/* Lokasi */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Lokasi Tugas</label>
                            <div className="relative group">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition" />
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder:text-gray-500 transition text-sm"
                                    placeholder="Contoh: Gedung A, Kampus Utama"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Password *</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-12 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder:text-gray-500 transition text-sm"
                                    placeholder="Minimal 6 karakter"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {formData.password && (
                                <div className="mt-2 text-left">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-400">Kekuatan Password</span>
                                        <span className={`${
                                            passwordStrength < 40 ? 'text-red-400' :
                                            passwordStrength < 80 ? 'text-yellow-400' :
                                            'text-green-400'
                                        } font-medium`}>
                                            {passwordStrength}% 
                                            {passwordStrength < 40 ? ' (Lemah)' : passwordStrength < 80 ? ' (Sedang)' : ' (Kuat)'}
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${passwordStrength}%` }}
                                            className={`h-full ${
                                                passwordStrength < 40 ? 'bg-red-500' :
                                                passwordStrength < 80 ? 'bg-yellow-500' :
                                                'bg-gradient-to-r from-green-500 to-emerald-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                                            } transition-all duration-300 ease-out`}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Konfirmasi Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Konfirmasi Password *</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-12 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder:text-gray-500 transition text-sm"
                                    placeholder="Ulangi password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 mt-4 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Daftar
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-4">
                            <div className="text-center mb-6">
                                <p className="text-gray-300 text-sm mb-4">
                                    Masukkan 6-digit kode OTP yang dikirim ke WA <strong>{formData.phone}</strong>.
                                </p>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                    className="w-full text-center text-3xl tracking-[1em] font-mono py-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white transition placeholder:text-gray-600 shadow-inner"
                                    placeholder="••••••"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || otpCode.length !== 6}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 mt-4 disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Verifikasi OTP
                                        <CheckCircle className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setStep('form'); setError(""); setSuccess(""); }}
                                className="w-full text-sm text-gray-400 hover:text-white transition mt-2"
                            >
                                Kembali
                            </button>
                        </form>
                    )}

                    <div className="mt-5 text-center">
                        <p className="text-gray-400 text-sm">
                            Sudah punya akun?{" "}
                            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition">
                                Login Sekarang
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SignupPage;