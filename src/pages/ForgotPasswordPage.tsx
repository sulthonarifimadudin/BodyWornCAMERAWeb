import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Mail, ArrowRight, AlertCircle } from "lucide-react";
import { useOTPTimer } from "@/hooks/useOTPTimer";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { timeLeft, startTimer, formatTime, isTimerActive } = useOTPTimer('forgotPwdUnlockTime');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
                if (data.retry_after) {
                    startTimer(data.retry_after);
                }
            } else if (response.ok && data.success) {
                // Berhasil kirim OTP
                if (!isTimerActive || timeLeft < 60) startTimer(60);
                navigate("/verify-reset-otp", { state: { email } });
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
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
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
                         className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-2xl shadow-orange-500/30 mb-3"
                     >
                         <Shield className="w-8 h-8 text-white" />
                     </motion.div>
                    <h1 className="text-xl font-bold text-white">Lupa Password</h1>
                    <p className="text-gray-400 text-sm mt-1">Kami akan mengirimkan instruksi via Email</p>
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

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">Alamat Email Tedaftar</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white placeholder:text-gray-500 transition text-sm"
                                    placeholder="masukkan@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || isTimerActive}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-2.5 rounded-lg font-medium shadow-lg shadow-blue-500/25 mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isTimerActive 
                                        ? (timeLeft > 60 ? `Coba lagi dalam ${formatTime()}` : `Kirim ulang dalam ${formatTime()}`) 
                                        : "Kirim OTP Reset"}
                                    {!isTimerActive && <ArrowRight className="w-4 h-4" />}
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-5 text-center">
                        <Link to="/login" className="text-sm text-gray-400 hover:text-white transition">
                            Kembali ke Halaman Login
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;
