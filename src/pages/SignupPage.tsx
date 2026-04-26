import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield, Mail, Lock, User, Eye, EyeOff, ArrowRight,
    UserPlus, CheckCircle, AlertCircle, Phone, MapPin, Briefcase, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    const [showPositionDropdown, setShowPositionDropdown] = useState(false);
    const navigate = useNavigate();

    const positions = [
        "Petugas Security",
        "Komandan Regu",
        "Kepala Keamanan",
        "Administrator"
    ];

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSelectPosition = (pos: string) => {
        setFormData({ ...formData, position: pos });
        setShowPositionDropdown(false);
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
                setSuccess("Akun berhasil dibuat. OTP telah dikirim ke Email Anda untuk verifikasi.");
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
        <div className="min-h-screen bg-[#020617] text-slate-200 flex items-center justify-center px-4 py-12 relative overflow-hidden font-inter">
            {/* Animated Background - Identical to Dashboard */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.15)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.15)_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full relative z-10"
            >
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl shadow-2xl shadow-primary/30 mb-4 group hover:scale-105 transition-transform"
                    >
                        <Shield className="w-10 h-10 text-primary-foreground" />
                    </motion.div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                        BODY<span className="text-primary font-orbitron">WORNCAM</span>
                    </h1>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.2em]">Sistem Keamanan Kampus</p>
                </div>

                {/* Card */}
                <div className="bg-card/40 backdrop-blur-2xl rounded-3xl p-8 border border-border/50 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                    
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <UserPlus className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Daftar Akun Baru</h2>
                            <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Security Personnel Enrollment</p>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm flex items-center gap-3"
                            >
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span className="font-medium">{error}</span>
                            </motion.div>
                        )}

                        {success && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mb-6 p-3.5 bg-success/10 border border-success/20 rounded-xl text-success text-sm flex items-center gap-3"
                            >
                                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                                <span className="font-medium">{success}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {step === 'form' ? (
                        <form onSubmit={handleSignup} className="space-y-5">
                            <div className="grid grid-cols-1 gap-5">
                                {/* Nama Lengkap */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap *</label>
                                    <div className="relative group">
                                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-white placeholder:text-slate-600 transition text-sm shadow-inner"
                                            placeholder="Masukkan nama lengkap"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Email */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email *</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-white placeholder:text-slate-600 transition text-sm shadow-inner"
                                            placeholder="masukkan@email.com"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* No HP */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nomor HP</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-white placeholder:text-slate-600 transition text-sm shadow-inner"
                                            placeholder="0812xxxxxx"
                                        />
                                    </div>
                                </div>

                                {/* Posisi - CUSTOM DROPDOWN TO FIX VISIBILITY */}
                                <div className="space-y-1.5 relative">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Posisi</label>
                                    <div 
                                        className={cn(
                                            "relative group cursor-pointer w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-border/50 rounded-xl transition text-sm shadow-inner flex items-center justify-between",
                                            showPositionDropdown && "ring-2 ring-primary/20 border-primary"
                                        )}
                                        onClick={() => setShowPositionDropdown(!showPositionDropdown)}
                                    >
                                        <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                                        <span className="text-white">{formData.position}</span>
                                        <ChevronDown className={cn("w-4 h-4 text-slate-500 transition-transform", showPositionDropdown && "rotate-180")} />
                                    </div>
                                    
                                    {/* Dropdown Menu */}
                                    <AnimatePresence>
                                        {showPositionDropdown && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 5 }}
                                                className="absolute left-0 right-0 top-full mt-2 bg-[#0f172a] border border-border rounded-xl shadow-2xl z-[100] overflow-hidden"
                                            >
                                                {positions.map((pos) => (
                                                    <div
                                                        key={pos}
                                                        className={cn(
                                                            "px-11 py-3 text-sm hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer",
                                                            formData.position === pos ? "bg-primary/5 text-primary font-bold" : "text-slate-300"
                                                        )}
                                                        onClick={() => handleSelectPosition(pos)}
                                                    >
                                                        {pos}
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Lokasi */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Lokasi Tugas</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-white placeholder:text-slate-600 transition text-sm shadow-inner"
                                            placeholder="Contoh: Gedung A, Kampus Utama"
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password *</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-12 py-3 bg-slate-900/50 border border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-white placeholder:text-slate-600 transition text-sm shadow-inner"
                                            placeholder="Minimal 6 karakter"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    
                                    {formData.password && (
                                        <div className="mt-2 space-y-1">
                                            <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider">
                                                <span className="text-slate-500 text-left">Strength</span>
                                                <span className={cn(
                                                    "text-right",
                                                    passwordStrength < 40 ? 'text-destructive' :
                                                    passwordStrength < 80 ? 'text-warning' : 'text-success'
                                                )}>
                                                    {passwordStrength < 40 ? 'Weak' : passwordStrength < 80 ? 'Medium' : 'Secure'}
                                                </span>
                                            </div>
                                            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${passwordStrength}%` }}
                                                    className={cn(
                                                        "h-full transition-all duration-300 shadow-[0_0_8px_rgba(var(--primary),0.4)]",
                                                        passwordStrength < 40 ? 'bg-destructive' :
                                                        passwordStrength < 80 ? 'bg-warning' : 'bg-success'
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Konfirmasi Password */}
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Konfirmasi Password *</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full pl-11 pr-12 py-3 bg-slate-900/50 border border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-white placeholder:text-slate-600 transition text-sm shadow-inner"
                                            placeholder="Ulangi password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3.5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 mt-6 disabled:opacity-50 group active:scale-95"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Daftar Sekarang
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                                    <Mail className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Verifikasi Email Anda</h3>
                                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                    Masukkan 6-digit kode OTP yang baru saja kami kirimkan ke email:<br/>
                                    <strong className="text-primary font-bold">{formData.email}</strong>
                                </p>
                                
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                    className="w-full text-center text-4xl tracking-[0.8em] font-mono py-5 bg-slate-900 border border-border rounded-2xl focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none text-white transition placeholder:text-slate-800 shadow-inner"
                                    placeholder="000000"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otpCode.length !== 6}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-primary/25 disabled:opacity-50 active:scale-95"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Verifikasi Akun
                                        <CheckCircle className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                            
                            <button
                                type="button"
                                onClick={() => { setStep('form'); setError(""); setSuccess(""); }}
                                className="w-full text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                            >
                                <ArrowRight className="w-3 h-3 rotate-180" />
                                Kembali Edit Data
                            </button>
                        </form>
                    )}

                    <div className="mt-8 text-center pt-6 border-t border-border/30">
                        <p className="text-slate-500 text-sm">
                            Sudah punya akun?{" "}
                            <Link to="/login" className="text-primary hover:text-primary/80 font-bold transition-colors">
                                Login Sekarang
                            </Link>
                        </p>
                    </div>
                </div>
                
                {/* Footer Info */}
                <p className="mt-8 text-center text-slate-600 text-[10px] uppercase tracking-[0.3em] font-bold">
                    &copy; 2026 BodyWornCam Security Protocol
                </p>
            </motion.div>
        </div>
    );
};

export default SignupPage;