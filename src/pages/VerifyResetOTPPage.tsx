import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowRight, AlertCircle, CheckCircle, RefreshCcw } from "lucide-react";
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
            navigate("/forgot-password"); // Kembali jika tak ada state email
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
                // Optional: set a subtle success message or just clear error
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-8">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full relative z-10"
            >
                <div className="text-center mb-6">
                    <motion.div
                         initial={{ scale: 0 }}
                         animate={{ scale: 1 }}
                         transition={{ type: "spring", duration: 0.6 }}
                         className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-2xl shadow-green-500/30 mb-3"
                     >
                         <Shield className="w-8 h-8 text-white" />
                     </motion.div>
                    <h1 className="text-xl font-bold text-white">Verifikasi OTP</h1>
                    <p className="text-gray-400 text-sm mt-1">Masukkan kode 6 digit dari Email Anda</p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
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

                    <form onSubmit={handleVerify} className="space-y-4">
                        <div className="text-center mb-4">
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
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-2.5 rounded-lg font-medium shadow-lg shadow-blue-500/25 mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Verifikasi <CheckCircle className="w-4 h-4" /></>
                            )}
                        </button>
                        <button
                            type="button"
                            disabled={isTimerActive || loading}
                            onClick={handleResend}
                            className="w-full text-sm font-medium transition mt-4 py-2.5 border border-white/10 rounded-lg flex justify-center items-center gap-2
                                     disabled:text-gray-500 disabled:bg-transparent text-blue-400 hover:bg-white/5"
                        >
                            <RefreshCcw className={`w-4 h-4 ${!isTimerActive && !loading ? 'group-hover:animate-spin' : ''}`} />
                            {isTimerActive 
                                ? (timeLeft > 60 ? `Coba lagi dalam ${formatTime()}` : `Kirim ulang dalam ${formatTime()}`) 
                                : "Kirim Ulang OTP"}
                        </button>
                    </form>

                    <div className="mt-5 text-center">
                        <Link to="/login" className="text-sm text-gray-400 hover:text-white transition">
                            Batal & Kembali
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyResetOTPPage;
