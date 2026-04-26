import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Mail, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import { useOTPTimer } from "@/hooks/useOTPTimer";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();
    const { timeLeft, startTimer, formatTime, isTimerActive } = useOTPTimer('forgotPwdUnlockTime');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (response.status === 429) {
                setError(data.message || "Terlalu banyak percobaan.");
                if (data.retry_after) {
                    startTimer(data.retry_after);
                }
            } else if (response.ok && data.success) {
                setSuccess("OTP Berhasil dikirim ke email Anda!");
                if (!isTimerActive || timeLeft < 60) startTimer(60);
                setTimeout(() => {
                    navigate("/verify-reset-otp", { state: { email } });
                }, 1500);
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
        <div className="min-h-screen bg-[#020617] text-slate-200 flex items-center justify-center px-4 py-12 relative overflow-hidden">
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
                        className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl shadow-2xl shadow-primary/30 mb-4"
                    >
                        <Shield className="w-10 h-10 text-primary-foreground" />
                    </motion.div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                        Lupa <span className="text-primary font-orbitron">Password</span>
                    </h1>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-[0.2em]">Password Recovery System</p>
                </div>

                <div className="bg-card/40 backdrop-blur-2xl rounded-3xl p-8 border border-border/50 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                    
                    <p className="text-slate-400 text-sm mb-8 leading-relaxed text-center">
                        Masukkan alamat email Anda yang terdaftar. Kami akan mengirimkan kode OTP untuk mengatur ulang password Anda.
                    </p>

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

                    {success && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="mb-6 p-3.5 bg-success/10 border border-success/20 rounded-xl text-success text-sm flex items-center gap-3"
                        >
                            <CheckCircle className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium">{success}</span>
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Alamat Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-white placeholder:text-slate-600 transition text-sm shadow-inner"
                                    placeholder="masukkan@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || isTimerActive}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95 group"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isTimerActive 
                                        ? (timeLeft > 60 ? `COBA LAGI DALAM ${formatTime()}` : `KIRIM ULANG DALAM ${formatTime()}`) 
                                        : "Kirim OTP Reset"}
                                    {!isTimerActive && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-border/30">
                        <Link to="/login" className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                            <ArrowRight className="w-3 h-3 rotate-180" />
                            Kembali ke Login
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;
