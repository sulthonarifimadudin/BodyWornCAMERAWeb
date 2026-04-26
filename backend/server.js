import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import nodemailer from 'nodemailer';
import pool, { initDB } from './db.js';

dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Setup Multer untuk file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, '-');
    cb(null, uniqueName);
  }
});
const upload = multer({ 
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Max 2MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("File harus gambar"), false);
        }
    }
});

// Load env vars
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // Expose folder uploads

// Inisialisasi Database (menambahkan kolom jika diperlukan)
initDB();

/**
 * MIDDLEWARE: Rate Limiter OTP
 * Mencegah eksploitasi API Fonnte via Spam Request (Maks 3x / 10 menit)
 */
const otpLimiter = rateLimit({
    windowMs: 3 * 60 * 1000, // 3 menit
    max: 3, 
    handler: (req, res, next, options) => {
        const resetTime = req.rateLimit.resetTime;
        const retryAfterSeconds = Math.max(0, Math.ceil((resetTime.getTime() - Date.now()) / 1000));
        res.status(429).json({
            success: false,
            error: 'Terlalu banyak permintaan OTP',
            message: `Terlalu banyak percobaan. Silakan coba lagi dalam ${Math.floor(retryAfterSeconds / 60).toString().padStart(2, '0')}:${(retryAfterSeconds % 60).toString().padStart(2, '0')}`,
            retry_after: retryAfterSeconds
        });
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * MIDDLEWARE: Rate Limiter OTP (KHUSUS EMAIL)
 * Fokus perlindungan reset password
 */
const emailForgotPasswordLimiter = rateLimit({
    windowMs: 3 * 60 * 1000, // 3 menit
    max: 3, 
    handler: (req, res, next, options) => {
        const resetTime = req.rateLimit.resetTime;
        const retryAfterSeconds = Math.max(0, Math.ceil((resetTime.getTime() - Date.now()) / 1000));
        res.status(429).json({
            success: false,
            error: 'Terlalu banyak permintaan OTP',
            message: `Terlalu banyak percobaan. Silakan coba lagi dalam ${Math.floor(retryAfterSeconds / 60).toString().padStart(2, '0')}:${(retryAfterSeconds % 60).toString().padStart(2, '0')}`,
            retry_after: retryAfterSeconds
        });
    },
    keyGenerator: (req, res) => {
        return (req.body && req.body.email) ? req.body.email : 'unknown_email';
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Utility: Format nomor ke format internasional (628...)
 */
const formatWhatsAppNumber = (phone) => {
    let cleaned = phone.replace(/\D/g, ''); // Hapus semua karakter non-angka
    if (cleaned.startsWith('08')) {
        return '628' + cleaned.substring(2);
    }
    return cleaned;
};

/**
 * Helper: Generate 6 digit OTP random
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * 1. Endpoint POST /api/register
 * Body: { email, password, phone, fullName, position, location }
 */
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, phone, fullName, position, location } = req.body;

        if (!email || !password || !phone) {
            return res.status(400).json({ success: false, message: 'Email, password, dan nomor telepon wajib diisi' });
        }

        // Cek apakah email sudah terdaftar
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'Email sudah terdaftar. Silakan gunakan email lain.' });
        }

        // Hash password dengan bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Format nomor HP
        const formattedPhone = formatWhatsAppNumber(phone);

        // Insert ke MySQL tabel users
        const [result] = await pool.query(
            `INSERT INTO users (email, password, phone, full_name, position, location, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [email, hashedPassword, formattedPhone, fullName || '', position || '', location || '']
        );

        const newUserId = result.insertId;
        console.log(`[Register Success] New user ID: ${newUserId}, Email: ${email}`);

        // Generate OTP untuk pendaftaran
        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // Insert OTP ke DB
        await pool.query(
            `INSERT INTO otp_codes (user_id, otp, expired_at, created_at) VALUES (?, ?, ?, NOW())`,
            [newUserId, otpCode, expiresAt]
        );

        console.log(`[OTP Generate - Signup] Dibuat OTP: ${otpCode} untuk user ID: ${newUserId} ke HP: ${formattedPhone}`);

        // Kirim OTP via Email
        const mailOptions = {
            from: `"GuardWatch Center" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Kode Verifikasi Pendaftaran - GuardWatch',
            text: `Terima kasih telah mendaftar di GuardWatch.\n\nKode verifikasi keamanan (OTP) Anda adalah: ${otpCode}\n\nKode ini berlaku selama 5 menit.`,
            html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                     <h2>GuardWatch Command Center</h2>
                     <p>Terima kasih telah mendaftar.</p>
                     <p>Kode verifikasi keamanan (OTP) pendaftaran Anda adalah:</p>
                     <h1 style="color: #4F46E5; letter-spacing: 2px;">${otpCode}</h1>
                     <p>Kode ini berlaku selama 5 menit.</p>
                   </div>`
        };
        try {
            await transporter.sendMail(mailOptions);
        } catch (mailErr) {
            console.error('[Nodemailer Error - Signup]', mailErr.message);
        }

        return res.status(200).json({
            success: true,
            message: 'Registrasi berhasil. OTP telah dikirimkan ke Email Anda untuk verifikasi.'
        });
    } catch (error) {
        console.error('Error di /api/register:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan sistem internal.' });
    }
});

/**
 * 2. Endpoint POST /api/login
 * Body: { email, password }
 */
app.post('/api/login', otpLimiter, async (req, res) => {
    try {
        console.log(`[Login Attempt] Menerima request login untuk ${req.body.email}`);
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email dan password wajib diisi' });
        }

        // Ambil user dari database
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ success: false, message: 'Email atau password salah.' });
        }

        const user = users[0];

        // Validasi password menggunakan bcrypt
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ success: false, message: 'Email atau password salah.' });
        }

        // Generate OTP dan Simpan ke DB
        const otpCode = generateOTP();
        const userPhone = user.phone; // Nomor tujuan dari DB (seharusnya sudah format 628...)

        // Expired 5 Menit
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await pool.query(
            `INSERT INTO otp_codes (user_id, otp, expired_at, created_at) VALUES (?, ?, ?, NOW())`,
            [user.id, otpCode, expiresAt]
        );

        console.log(`[OTP Generate] Dibuat OTP: ${otpCode} untuk user ID: ${user.id} ke HP: ${userPhone}`);

        // Kirim OTP via Email
        const mailOptions = {
            from: `"GuardWatch Center" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Kode Login Verifikasi - GuardWatch',
            text: `Terima kasih telah login di GuardWatch.\n\nKode verifikasi keamanan (OTP) Anda adalah: ${otpCode}\n\nKode ini berlaku selama 5 menit. Jangan berikan kode ini kepada siapapun demi keamanan sistem.\n\nLogin terdeteksi di akun ${email}`,
            html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                     <h2>GuardWatch Command Center</h2>
                     <p>Permintaan otentikasi (login) terdeteksi.</p>
                     <p>Kode verifikasi keamanan (OTP) Anda adalah:</p>
                     <h1 style="color: #4F46E5; letter-spacing: 2px;">${otpCode}</h1>
                     <p>Kode ini berlaku selama 5 menit. Jangan berikan kode ini kepada siapapun demi keamanan sistem.</p>
                     <p><small>Login terdeteksi di akun ${email}</small></p>
                   </div>`
        };

        try {
            await transporter.sendMail(mailOptions);
        } catch (mailErr) {
            console.error('[Nodemailer Error - Login] Gagal mengirim pesan:', mailErr.message);
            // Tetap izinkan pass jika gagal
            return res.status(500).json({
                success: false,
                message: 'Login benar, tapi gagal mengirim email OTP.',
                error: mailErr.message
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Otentikasi berhasil. OTP telah dikirimkan ke Email Anda.',
            userEmail: user.email,
            userPhone: user.email // Override as email for frontend logging
        });

    } catch (error) {
        console.error('Error di /api/login:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan internal server saat login.' });
    }
});

/**
 * 3. Endpoint POST /api/verify-otp
 * Body: { email, otp }
 */
app.post('/api/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Data Email & OTP tidak lengkap.' });
        }

        // Cari user.id dulu lewat email
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ success: false, message: 'User tidak ditemukan.' });
        }
        const user = users[0];

        // Cari OTP terkait yang paling baru dan cocok
        // Kita juga pastikan mencocokan OTP dengan ID User yang benar
        const [otpRecords] = await pool.query(
            `SELECT * FROM otp_codes 
             WHERE user_id = ? AND otp = ? 
             ORDER BY created_at DESC LIMIT 1`,
            [user.id, otp]
        );

        if (otpRecords.length === 0) {
            console.log(`[OTP VERIFY] OTP tidak valid / sudah digunakan`);
            return res.status(400).json({ success: false, message: 'Kode OTP tidak dikenali.' });
        }

        const otpData = otpRecords[0];

        // Validasi kedaluwarsa 
        if (new Date() > new Date(otpData.expired_at)) {
            return res.status(400).json({ success: false, message: 'Kode OTP telah kedaluwarsa. Silakan request ulang.' });
        }

        // Invalidkan OTP setelah digunakan (Mencegah Replay Attack)
        await pool.query('DELETE FROM otp_codes WHERE user_id = ?', [user.id]);
        console.log(`[OTP VERIFY] OTP valid untuk user ID: ${user.id}`);
        console.log(`[OTP VERIFY] OTP sudah dihapus setelah digunakan`);

        // Hapus password dari object user yg dikirim ke frontend untuk security check
        delete user.password;

        // Set state online saat OTP diverifikasi (login sukses mutlak)
        await pool.query('UPDATE users SET is_online = TRUE, last_seen = NOW() WHERE id = ?', [user.id]);

        // Generate JWT Token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role || 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.status(200).json({
            success: true,
            message: 'Otentikasi 2FA Berhasil.',
            user: user,
            token: token
        });

    } catch (error) {
        console.error('Error di /api/verify-otp:', error);
        return res.status(500).json({ success: false, message: 'Gagal memverifikasi OTP melalui database.' });
    }
});

/**
 * 4. Endpoint POST /api/forgot-password
 * Body: { email }
 */
app.post('/api/forgot-password', otpLimiter, emailForgotPasswordLimiter, async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Email wajib diisi' });

        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ success: false, message: 'Email tidak ditemukan.' });

        const user = users[0];
        const otpCode = generateOTP();
        const userPhone = user.phone;
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await pool.query(
            `INSERT INTO otp_codes (user_id, otp, expired_at, created_at) VALUES (?, ?, ?, NOW())`,
            [user.id, otpCode, expiresAt]
        );

        const mailOptions = {
            from: `"GuardWatch Center" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Kode Reset Password - GuardWatch',
            text: `Permintaan Reset Password GuardWatch.\n\nKode OTP Anda adalah: ${otpCode}\n\nKode ini berlaku selama 5 menit. JANGAN BERIKAN KODE INI KEPADA SIAPAPUN.`,
            html: `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                     <h2>GuardWatch Command Center</h2>
                     <p>Permintaan Reset Password.</p>
                     <p>Kode verifikasi (OTP) Anda adalah:</p>
                     <h1 style="color: #4F46E5; letter-spacing: 2px;">${otpCode}</h1>
                     <p>Kode ini berlaku selama 5 menit. <strong>JANGAN BERIKAN KODE INI KEPADA SIAPAPUN.</strong></p>
                   </div>`
        };
        
        try {
            await transporter.sendMail(mailOptions);
        } catch (mailErr) {
            console.error(`[FORGOT PASSWORD] ERROR Nodemailer.`, mailErr.message);
            return res.status(500).json({ success: false, message: 'Gagal mengirim OTP ke Email.' });
        }

        return res.status(200).json({ success: true, message: 'OTP Reset Password telah dikirimkan ke Email Anda.' });
    } catch (error) {
        console.error('Error di /api/forgot-password:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan sistem internal.' });
    }
});

/**
 * 5. Endpoint POST /api/verify-reset-otp
 */
app.post('/api/verify-reset-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ success: false, message: 'Data tidak lengkap.' });

        const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(400).json({ success: false, message: 'User tidak ditemukan.' });
        const user = users[0];

        const [otpRecords] = await pool.query(
            `SELECT * FROM otp_codes WHERE user_id = ? AND otp = ? ORDER BY created_at DESC LIMIT 1`,
            [user.id, otp]
        );

        if (otpRecords.length === 0) {
            console.log(`[OTP VERIFY] OTP tidak valid / sudah digunakan`);
            return res.status(400).json({ success: false, message: 'Kode OTP tidak dikenali.' });
        }
        
        if (new Date() > new Date(otpRecords[0].expired_at)) {
            return res.status(400).json({ success: false, message: 'Kode OTP telah kedaluwarsa.' });
        }

        // Invalidkan OTP setelah digunakan (Mencegah Replay Attack)
        await pool.query('DELETE FROM otp_codes WHERE user_id = ?', [user.id]);
        console.log(`[OTP VERIFY] OTP valid untuk user ID: ${user.id}`);
        console.log(`[OTP VERIFY] OTP sudah dihapus setelah digunakan`);

        return res.status(200).json({ success: true, message: 'OTP divalidasi. Lanjutkan ke reset password.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan verifikasi.' });
    }
});

/**
 * 6. Endpoint POST /api/reset-password
 */
app.post('/api/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) return res.status(400).json({ success: false, message: 'Data tidak lengkap.' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);

        const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (users.length > 0) {
            await pool.query('DELETE FROM otp_codes WHERE user_id = ?', [users[0].id]);
        }

        return res.status(200).json({ success: true, message: 'Password sukses diperbarui.' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Gagal mereset password.' });
    }
});

/**
 * MIDDLEWARE: verifyToken
 */
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ success: false, message: 'Akses ditolak. Token tidak ditemukan.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        // Update last_seen asynchronously tanpa mem-block sisa request
        pool.query('UPDATE users SET last_seen = NOW() WHERE id = ?', [decoded.id]).catch(err => console.error("Update last_seen error:", err.message));

        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: 'Sesi berakhir atau token tidak valid.' });
    }
};

/**
 * MIDDLEWARE: verifyAdmin (Check if user is commander)
 */
const verifyAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Akses ditolak. Hanya Admin/Komandan yang diizinkan.' });
    }
};

/**
 * Endpoint Tambahan: POST /api/logout
 * Untuk menset user jadi offline saat mereka logout
 */
app.post('/api/logout', verifyToken, async (req, res) => {
    try {
        await pool.query('UPDATE users SET is_online = FALSE, last_seen = NOW() WHERE id = ?', [req.user.id]);
        return res.status(200).json({ success: true, message: 'Logout berhasil' });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Gagal proses logout' });
    }
});

/**
 * Endpoint Tambahan: GET /api/online-users
 * Membaca jumlah total user online yang aktif
 */
app.get('/api/online-users', verifyToken, async (req, res) => {
    try {
        // [AUTO OFFLINE] Paksa offline jika last_seen melebihi 5 menit
        await pool.query('UPDATE users SET is_online = FALSE WHERE last_seen < NOW() - INTERVAL 5 MINUTE');
        
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM users WHERE is_online = TRUE');
        return res.status(200).json({ success: true, count: rows[0].count });
    } catch (error) {
        return res.status(500).json({ success: false, count: 0 });
    }
});

/**
 * Endpoint Tambahan: GET /api/users/status
 * Menampilkan rincian status per personil dari aplikasi web
 */
app.get('/api/users/status', verifyToken, async (req, res) => {
    try {
        await pool.query('UPDATE users SET is_online = FALSE WHERE last_seen < NOW() - INTERVAL 5 MINUTE');
        const [users] = await pool.query('SELECT id, full_name, role, is_online, last_seen FROM users ORDER BY is_online DESC, full_name ASC');
        return res.status(200).json({ success: true, users });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Gagal meload status user.' });
    }
});

/**
 * 7. Endpoint GET /api/profile (TERPROTEKSI JWT)
 */
app.get('/api/profile', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
        
        if (users.length === 0) return res.status(404).json({ success: false, message: 'User tidak ditemukan.' });
        
        const user = users[0];
        delete user.password;
        
        return res.status(200).json({ success: true, user });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Gagal memuat data profil.' });
    }
});

/**
 * 8. Endpoint PUT /api/update-profile (TERPROTEKSI JWT)
 */
app.put('/api/update-profile', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { full_name, phone, position, location } = req.body;

        if (!full_name || !phone) {
            return res.status(400).json({ success: false, message: 'Nama lengkap dan nomor WhatsApp wajib diisi.' });
        }

        // Format nomor HP
        const formattedPhone = formatWhatsAppNumber(phone);

        await pool.query(
            `UPDATE users SET full_name = ?, phone = ?, position = ?, location = ? WHERE id = ?`,
            [full_name, formattedPhone, position || '', location || '', userId]
        );

        return res.status(200).json({ success: true, message: 'Profil berhasil diperbarui.' });
    } catch (error) {
        console.error('Error di /api/update-profile:', error);
        return res.status(500).json({ success: false, message: 'Gagal memperbarui profil.' });
    }
});

/**
 * 9. Endpoint PUT /api/update-profile-image (TERPROTEKSI JWT)
 */
app.put('/api/update-profile-image', verifyToken, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Mohon sertakan file gambar.' });
        }

        const userId = req.user.id;
        const imagePath = req.file.filename;

        await pool.query(
            "UPDATE users SET profile_image = ? WHERE id = ?",
            [imagePath, userId]
        );

        res.status(200).json({
            success: true,
            message: "Foto berhasil diupload",
            image: imagePath
        });
    } catch (error) {
        console.error("[UPLOAD ERROR]", error);
        res.status(500).json({ success: false, message: error.message || "Upload gagal" });
    }
});

// Error handling backend untuk multer limit (jika file terlalu besar)
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, message: 'Ukuran file terlalu besar (Max 2MB)' });
        }
    } else if (err) {
        return res.status(400).json({ success: false, message: err.message });
    }
    next();
});

/**
 * GPS TRACKING ENDPOINTS & SYSTEM MONITORING
 */

// Health Check Endpoint (For monitoring and keeping the server warm)
app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.status(200).json({ success: true, status: 'Healthy', timestamp: new Date() });
    } catch (error) {
        res.status(500).json({ success: false, status: 'Unhealthy', error: error.message });
    }
});

// Global state for latest AI detection (Keep in memory for real-time)
let latestAIDetection = {
    person_count: 0,
    car_count: 0,
    motorcycle_count: 0,
    status: "SITUASI KONDUSIF",
    timestamp: new Date()
};

// 1. Endpoint untuk AI Processor mengirim data deteksi
app.post('/api/ai/detections', async (req, res) => {
    try {
        const { person_count, car_count, motorcycle_count } = req.body;
        
        let status = "SITUASI KONDUSIF";
        if (person_count > 10) status = "KERUMUNAN TERDETEKSI 👥⚠️";
        else if (car_count > 5) status = "KEMACETAN TERDETEKSI 🚗⚠️";
        else if (person_count > 0 || car_count > 0 || motorcycle_count > 0) status = "AKTIVITAS TERDETEKSI ✅";

        latestAIDetection = {
            person_count: person_count || 0,
            car_count: car_count || 0,
            motorcycle_count: motorcycle_count || 0,
            status,
            timestamp: new Date()
        };

        res.status(200).json({ success: true, message: 'Data deteksi AI berhasil diperbarui.' });
    } catch (error) {
        console.error('[AI UPDATE ERROR]', error);
        res.status(500).json({ success: false, message: 'Gagal menyimpan data deteksi AI.' });
    }
});

// 2. Endpoint untuk Dashboard mengambil data deteksi AI terbaru
app.get('/api/ai/latest', (req, res) => {
    res.status(200).json({ success: true, data: latestAIDetection });
});

// Periodic Heartbeat (Pings DB every 30 minutes to prevent idle timeout)
setInterval(async () => {
    try {
        await pool.query('SELECT 1');
        console.log(`[HEARTBEAT] System pinged at ${new Date().toLocaleString()}`);
    } catch (err) {
        console.error('[HEARTBEAT ERROR] Failed to ping database:', err.message);
    }
}, 30 * 60 * 1000);

// 1. Endpoint untuk Raspberry Pi mengirim data GPS
app.post('/api/gps/update', async (req, res) => {
    try {
        const { user_id, latitude, longitude, speed, battery, heart_rate } = req.body;

        if (!user_id || latitude === undefined || longitude === undefined) {
            return res.status(400).json({ success: false, message: 'Data GPS tidak lengkap (user_id, lat, lng wajib)' });
        }

        await pool.query(
            `INSERT INTO gps_tracking (user_id, latitude, longitude, speed, battery, heart_rate, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [user_id, latitude, longitude, speed || 0, battery || 100, heart_rate || 75]
        );

        res.status(200).json({ success: true, message: 'Data GPS berhasil disimpan.' });
    } catch (error) {
        console.error('[GPS UPDATE ERROR]', error);
        res.status(500).json({ success: false, message: 'Gagal menyimpan data GPS.' });
    }
});

// 2. Endpoint untuk Dashboard mengambil data posisi terbaru semua personil (Joined with Users)
app.get('/api/gps/latest', async (req, res) => {
    try {
        // Ambil koordinat terbaru untuk setiap user_id unik dan join dengan data user
        const query = `
            SELECT t1.*, u.full_name as name, u.position as job, u.role as system_role, u.profile_image
            FROM gps_tracking t1
            INNER JOIN (
                SELECT user_id, MAX(created_at) as max_created_at
                FROM gps_tracking
                GROUP BY user_id
            ) t2 ON t1.user_id = t2.user_id AND t1.created_at = t2.max_created_at
            LEFT JOIN users u ON t1.user_id = u.id
        `;
        const [rows] = await pool.query(query);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error('[GPS FETCH ERROR]', error);
        res.status(500).json({ success: false, message: 'Gagal mengambil data GPS terbaru.' });
    }
});

// 3. Endpoint Admin: Update data Satpam/Perangkat (Hanya oleh Admin)
app.put('/api/admin/users/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const targetId = req.params.id;
        const { full_name, position, location } = req.body;

        if (!full_name) {
            return res.status(400).json({ success: false, message: 'Nama lengkap wajib diisi.' });
        }

        await pool.query(
            `UPDATE users SET full_name = ?, position = ?, location = ? WHERE id = ?`,
            [full_name, position || '', location || '', targetId]
        );

        res.status(200).json({ success: true, message: 'Data personil berhasil diperbarui.' });
    } catch (error) {
        console.error('[ADMIN UPDATE ERROR]', error);
        res.status(500).json({ success: false, message: 'Gagal memperbarui data personil.' });
    }
});

// Inisialisasi Database & Start Server
const startServer = async () => {
    try {
        await initDB();
        app.listen(port, () => {
            console.log(`GuardWatch Backend server berjalan di http://localhost:${port}`);
        });
    } catch (err) {
        console.error("[CRITICAL] Gagal inisialisasi database. Server tidak dijalankan.", err);
        process.exit(1);
    }
};

startServer();
