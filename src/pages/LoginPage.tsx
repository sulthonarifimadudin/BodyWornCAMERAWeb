import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Shield, Mail, Lock, ArrowRight, Eye, EyeOff,
    LogIn, AlertCircle, CheckCircle, Fingerprint, RefreshCcw
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useOTPTimer } from "@/hooks/useOTPTimer";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

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
    const { t, i18n } = useTranslation();

    const handleLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            
            if (response.status === 429) {
                setError(data.message || t('login.tooManyAttempts'));
                if (data.retry_after) {
                    startTimer(data.retry_after); 
                }
            } else if (response.ok && data.success) {
                setSuccess(t('login.otpSent'));
                setUserPhone(data.userPhone || "nomor terdaftar");
                setStep('otp');
                // DUAL LAYER: Frontend Cooldown standar (60s) setiap berhasil kirim
                startTimer(60);
            } else {
                setError(data.message || t('login.loginError'));
            }
        } catch (err) {
            setError(t('login.backendError'));
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
                body: JSON.stringify({ email, otp: otpCode })
            });
            const data = await response.json();

            if (response.ok && data.success) {
                // Gunakan context global login
                login(data.token, data.user);

                setSuccess(t('login.otpSuccess'));
                setTimeout(() => {
                    navigate("/profile");
                }, 1500);
            } else {
                setError(data.message || t('login.otpError'));
            }
        } catch (err) {
            setError(t('login.backendError'));
        } finally {
            setLoading(false);
        }
    };

    const demoLogin = () => {
        setEmail("security@bodyworncam.com");
        setPassword("security123");
    };

    return (
    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300 flex items-center justify-center px-4 overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-1000 dark:opacity-100 opacity-20">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full relative z-10"
            >
                {/* Logo */}
                <div className="absolute top-4 right-4 z-20">
                    <button
                        onClick={() => i18n.changeLanguage(i18n.language === 'id' ? 'en' : 'id')}
                        className="p-2 bg-muted/30 border border-border/50 rounded-xl text-muted-foreground hover:text-foreground transition-all flex items-center gap-2"
                        title="Switch Language"
                    >
                        <Globe className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase tracking-tight">{i18n.language}</span>
                    </button>
                </div>

                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.6 }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-2xl shadow-xl shadow-primary/20 mb-4"
                    >
                        <Shield className="w-10 h-10 text-primary-foreground" />
                    </motion.div>
                    <h1 className="text-3xl font-orbitron font-bold text-foreground">
                        {step === 'login' ? t('login.title') : t('login.otpTitle')}
                    </h1>
                    <p className="text-muted-foreground mt-1 font-medium tracking-tight">
                        {step === 'login' ? t('login.subtitle') : t('login.otpSubtitle')}
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-card/80 backdrop-blur-xl rounded-3xl p-8 border border-border shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <LogIn className="w-6 h-6 text-primary" />
                        <h2 className="text-xl font-bold text-foreground tracking-tight">{t('login.loginButton')}</h2>
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
                            <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">{t('login.emailLabel')}</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-foreground placeholder:text-muted-foreground transition-all font-medium"
                                    placeholder="masukkan@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-muted-foreground mb-1 uppercase tracking-wider">{t('login.passwordLabel')}</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-foreground placeholder:text-muted-foreground transition-all font-medium"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <div className="mt-2 text-right">
                                <Link to="/forgot-password" className="text-xs font-bold text-primary hover:text-primary/80 uppercase tracking-tighter transition-all">
                                    {t('login.forgotPassword')}
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3.5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            ) : (
                                <>
                                    {t('login.loginButton')}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Demo Account */}
                    <div className="mt-6 pt-6 border-t border-border">
                        <button
                            type="button"
                            onClick={demoLogin}
                            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-muted/30 hover:bg-muted border border-border rounded-xl transition-all group"
                        >
                            <Fingerprint className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold text-muted-foreground">{t('login.demoAccount')}: security@bodyworncam.com</span>
                        </button>
                    </div>
                        </>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-4">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4 border border-primary/20">
                                    <Shield className="w-7 h-7 text-primary" />
                                </div>
                                <p className="text-muted-foreground text-sm font-medium mb-4">
                                    {t('login.otpSubtitle')} <strong>{userPhone}</strong>.
                                </p>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                    className="w-full text-center text-4xl tracking-[0.8em] font-orbitron font-bold py-5 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none text-foreground transition-all placeholder:text-muted/30 shadow-inner"
                                    placeholder="000000"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || otpCode.length !== 6}
                                className="w-full bg-primary hover:bg-primary/95 text-primary-foreground py-3.5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-primary/20 mt-4 disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {t('login.verifyButton')}
                                        <CheckCircle className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                disabled={isTimerActive || loading}
                                onClick={() => handleLogin()}
                                className="w-full text-xs font-bold transition-all mt-4 py-3 border border-border rounded-xl flex justify-center items-center gap-2
                                         disabled:text-muted-foreground disabled:bg-transparent text-primary hover:bg-muted font-orbitron"
                            >
                                <RefreshCcw className={`w-4 h-4 ${!isTimerActive && !loading ? 'group-hover:animate-spin' : ''}`} />
                                {isTimerActive 
                                    ? (timeLeft > 60 ? `TRY AGAIN IN ${formatTime()}` : `RESEND IN ${formatTime()}`) 
                                    : t('login.resendButton')}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setStep('login'); setError(""); setSuccess(""); }}
                                className="w-full text-xs font-bold text-muted-foreground hover:text-foreground transition-colors mt-2 py-2"
                            >
                                {t('profile.cancel')}
                            </button>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <p className="text-muted-foreground text-sm font-medium">
                            {t('login.noAccount')}{" "}
                            <Link to="/signup" className="text-primary hover:text-primary/80 font-bold transition-all">
                                {t('login.signupLink')}
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;