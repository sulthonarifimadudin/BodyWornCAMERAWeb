import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Shield, Mail, Lock, ArrowRight, Eye, EyeOff,
    LogIn, AlertCircle, CheckCircle, Fingerprint, RefreshCcw
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useOTPTimer } from "@/hooks/useOTPTimer";

const LoginPage = () => {
    const { login } = useAuth();
    const { timeLeft, startTimer, formatTime, isTimerActive } = useOTPTimer('loginOtpUnlockTime');
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState<'login' | 'otp'>('login');
    const [otpCode, setOtpCode] = useState("");
    const [userPhone, setUserPhone] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            
            if (response.status === 429) {
                setError(data.message || "Terlalu banyak percobaan.");
                if (data.retry_after) {
                    startTimer(data.retry_after); // DUAL LAYER: Override limit via Backend
                }
            } else if (response.ok && data.success) {
                setSuccess(`Otentikasi berhasil. OTP 2FA dikirim ke WA Anda.`);
                setUserPhone(data.userPhone || "nomor terdaftar");
                setStep('otp');
                // DUAL LAYER: Frontend Cooldown standar (60s) setiap berhasil kirim
                startTimer(60);
            } else {
                setError(data.message || "Email atau password salah.");
            }
        } catch (err) {
            setError("Gagal terhubung ke backend 2FA. Pastikan Node.js berjalan.");
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
            const response = await fetch('http://localhost:3000/api/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpCode })
            });
            const data = await response.json();

            if (response.ok && data.success) {
                // Gunakan context global login
                login(data.token, data.user);

                setSuccess("Otentikasi 2FA Berhasil! Memasuki sistem...");
                setTimeout(() => {
                    navigate("/profile");
                }, 1500);
            } else {
                setError(data.message || "OTP Kadaluarsa atau Tidak Valid.");
            }
        } catch (err) {
            setError("Gagal memverifikasi OTP melalui backend.");
        } finally {
            setLoading(false);
        }
    };

    const demoLogin = () => {
        setEmail("security@bodyworncam.com");
        setPassword("security123");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full relative z-10"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.6 }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-2xl shadow-blue-500/30 mb-4"
                    >
                        <Shield className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-2xl font-bold text-white">BODYWORNCAM</h1>
                    <p className="text-gray-400 mt-1">Sistem Keamanan Kampus</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
                    <div className="flex items-center gap-2 mb-6">
                        <LogIn className="w-5 h-5 text-blue-400" />
                        <h2 className="text-xl font-semibold text-white">Login ke Akun</h2>
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

                    {step === 'login' ? (
                        <>
                            <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder:text-gray-500 transition"
                                    placeholder="masukkan@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-white placeholder:text-gray-500 transition"
                                    placeholder="••••••••"
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
                            <div className="mt-2 text-right">
                                <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition">
                                    Lupa Password?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    Login
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Demo Account */}
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <button
                            type="button"
                            onClick={demoLogin}
                            className="w-full flex items-center justify-center gap-3 py-2 px-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition group"
                        >
                            <Fingerprint className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
                            <span className="text-sm text-gray-300">Demo Akun: security@bodyworncam.com</span>
                        </button>
                    </div>
                        </>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-4">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 mb-4 border border-blue-500/30">
                                    <Shield className="w-6 h-6 text-blue-400" />
                                </div>
                                <p className="text-gray-300 text-sm mb-4">
                                    Untuk keamanan sistem, silakan verifikasi sesi login Anda dengan 6-digit kode OTP (2FA) yang kami kirim ke WhatsApp <strong>{userPhone}</strong>.
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
                                        Verifikasi 2FA
                                        <CheckCircle className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                disabled={isTimerActive || loading}
                                onClick={() => handleLogin()}
                                className="w-full text-sm font-medium transition mt-4 py-2.5 border border-white/10 rounded-lg flex justify-center items-center gap-2
                                         disabled:text-gray-500 disabled:bg-transparent text-blue-400 hover:bg-white/5"
                            >
                                <RefreshCcw className={`w-4 h-4 ${!isTimerActive && !loading ? 'group-hover:animate-spin' : ''}`} />
                                {isTimerActive 
                                    ? (timeLeft > 60 ? `Coba lagi dalam ${formatTime()}` : `Kirim ulang dalam ${formatTime()}`) 
                                    : "Kirim Ulang OTP"}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setStep('login'); setError(""); setSuccess(""); }}
                                className="w-full text-sm text-gray-400 hover:text-white transition mt-2 py-2"
                            >
                                Batal
                            </button>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <p className="text-gray-400">
                            Belum punya akun?{" "}
                            <Link to="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition">
                                Daftar Sekarang
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;