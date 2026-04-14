import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import bcrypt from 'bcrypt';
import pool, { initDB } from './db.js';

// Load env vars
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Inisialisasi Database (menambahkan kolom jika diperlukan)
initDB();

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

        // Kirim OTP via Fonnte
        const message = `*GUARDWATCH COMMAND CENTER*\n\nTerima kasih telah mendaftar. Kode verifikasi keamanan (OTP) pendaftaran Anda adalah: *${otpCode}*\n\nKode ini berlaku selama 5 menit.`;
        try {
            await axios.post(
                'https://api.fonnte.com/send',
                { target: formattedPhone, message: message, delay: '2' },
                { headers: { 'Authorization': process.env.FONNTE_TOKEN } }
            );
        } catch (fonnteErr) {
            console.error('[WA Fonnte Error - Signup]', fonnteErr.message);
        }

        return res.status(200).json({ 
            success: true, 
            message: 'Registrasi berhasil. OTP telah dikirimkan ke nomor WhatsApp Anda untuk verifikasi.',
            test_otp: otpCode // untuk debug
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
app.post('/api/login', async (req, res) => {
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

        // Pesan yang akan dikirim ke WhatsApp
        const message = `*GUARDWATCH COMMAND CENTER*\n\nKode verifikasi keamanan (OTP) Anda adalah: *${otpCode}*\n\nKode ini berlaku selama 5 menit. Jangan berikan kode ini kepada siapapun demi keamanan sistem.\n\n_Login terdeteksi di akun ${email}_`;

        // Panggil Fonnte API 
        try {
            const response = await axios.post(
                'https://api.fonnte.com/send',
                {
                    target: userPhone,
                    message: message,
                    delay: '2', // Jeda antrean
                },
                {
                    headers: { 'Authorization': process.env.FONNTE_TOKEN }
                }
            );
            console.log(`[WA Fonnte Success] Balasan Fonnte:`, response.data);
        } catch (fonnteErr) {
            console.error('[WA Fonnte Error] Gagal mengirim pesan via Fonnte:', fonnteErr.response?.data || fonnteErr.message);
            // Meskipun WA gagal, kita tetap tidak membocorkan kesalahan ini sebagai sistem down ke user jika tidak diinginkan. 
            // Namun agar developer tahu, kita pass messagenya ke frontend (karena masih fase development).
            return res.status(500).json({ 
                success: false, 
                message: 'Login benar, tapi gagal mengirim kode OTP ke server WhatsApp (Fonnte Error)',
                error: fonnteErr.response?.data?.reason || fonnteErr.message
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: 'Otentikasi berhasil. OTP telah dikirimkan ke nomor terdaftar Anda.',
            userEmail: user.email,
            userPhone: userPhone, // Dibalikkan ke frontend sekedar sebagai info UI agar terlihat nomor WA tujuannya
            test_otp: otpCode // [WARNING] Hapus di tahap Production! 
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
            return res.status(400).json({ success: false, message: 'Kode OTP tidak dikenali.' });
        }

        const otpData = otpRecords[0];

        // Validasi kedaluwarsa 
        if (new Date() > new Date(otpData.expired_at)) {
            return res.status(400).json({ success: false, message: 'Kode OTP telah kedaluwarsa. Silakan request ulang.' });
        }

        // Jika berhasil, kita bisa menghapus otp tersebut agar tidak dipakai mengulang
        await pool.query('DELETE FROM otp_codes WHERE id = ?', [otpData.id]);
        
        // Hapus password dari object user yg dikirim ke frontend untuk security check
        delete user.password;

        return res.status(200).json({ 
            success: true, 
            message: 'Otentikasi 2FA Berhasil.',
            user: user
        });

    } catch (error) {
        console.error('Error di /api/verify-otp:', error);
        return res.status(500).json({ success: false, message: 'Gagal memverifikasi OTP melalui database.' });
    }
});

app.listen(port, () => {
    console.log(`GuardWatch Backend server berjalan di http://localhost:${port}`);
});
