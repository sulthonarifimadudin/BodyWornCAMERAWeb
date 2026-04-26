import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowRight, AlertCircle, CheckCircle, RefreshCcw, Mail } from "lucide-react";
import { useOTPTimer } from "@/hooks/useOTPTimer";

const VerifyResetOTPPage = () => {
    const [otpCode, setOtpCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { timeLeft, startTimer, formatTime, isTimerActive } = useOTPTimer('forgotPwdUnlockTime');
    
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    useEffect(() => {
        if (!email) {
            navigate("/forgot-password");
        }
    }, [email, navigate]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch('/api/verify-reset-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpCode })
            });
            const data = await response.json();
            
            if (response.ok && data.success) {
                navigate("/reset-password", { state: { email, otpVerified: true } });
            } else {
                setError(data.message || "OTP Kadaluarsa atau Tidak Valid.");
            }
        } catch (err) {
            setError("Gagal terhubung ke server backend.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setLoading(true);
        setError("");
        try {
            const response = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            
            if (response.status === 429) {
                setError(data.message || "Terlalu banyak percobaan.");
                if (data.retry_after) startTimer(data.retry_after);
            } else if (response.ok && data.success) {
                startTimer(60);
            } else {
                setError(data.message || "Gagal memproses permintaan.");
            }
        } catch (err) {
            setError("Gagal terhubung ke server backend.");
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
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-success/20 border border-success/30 rounded-2xl shadow-2xl shadow-success/20 mb-4"
                    >
                        <Shield className="w-10 h-10 text-success" />
                    </motion.div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                        Verifikasi <span className="text-primary font-orbitron">OTP</span>
                    </h1>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.2em]">Security Access Verification</p>
                </div>

                <div className="bg-card/40 backdrop-blur-2xl rounded-3xl p-8 border border-border/50 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-success/50 to-transparent" />
                    
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-primary/20">
                            <Mail className="w-7 h-7 text-primary" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Cek Email Anda</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Masukkan kode 6 digit yang baru saja dikirimkan ke:<br/>
                            <strong className="text-primary font-bold">{email}</strong>
                        </p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mb-6 p-3.5 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm flex items-center gap-3"
                        >
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium">{error}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleVerify} className="space-y-6">
                        <div className="text-center">
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
                                <>Verifikasi Akun <CheckCircle className="w-5 h-5" /></>
                            )}
                        </button>

                        <button
                            type="button"
                            disabled={isTimerActive || loading}
                            onClick={handleResend}
                            className="w-full text-xs font-bold transition-all py-3 border border-border rounded-xl flex justify-center items-center gap-2
                                     disabled:text-slate-500 disabled:bg-transparent text-primary hover:bg-primary/5 uppercase tracking-widest"
                        >
                            <RefreshCcw className={`w-4 h-4 ${!isTimerActive && !loading ? 'animate-spin' : ''}`} />
                            {isTimerActive 
                                ? (timeLeft > 60 ? `COBA LAGI DALAM ${formatTime()}` : `KIRIM ULANG DALAM ${formatTime()}`) 
                                : "Kirim Ulang OTP"}
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-border/30">
                        <Link to="/login" className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                            <ArrowRight className="w-3 h-3 rotate-180" />
                            Batal & Kembali
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyResetOTPPage;
