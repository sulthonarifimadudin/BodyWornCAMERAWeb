import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'guardwatch_db';

// Pool koneksi utama — tanpa specify database agar tidak crash jika DB belum ada
const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    connectionLimit: 10,
    waitForConnections: true,
    connectTimeout: 20000
});

// Auto-bootstrap: pastikan database & semua tabel selalu ada
export const initDB = async () => {
    // Coba koneksi tanpa database dulu untuk CREATE DATABASE IF NOT EXISTS
    let bootstrapConn;
    try {
        bootstrapConn = await mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASSWORD
        });
        await bootstrapConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
        await bootstrapConn.query(`USE \`${DB_NAME}\``);
        console.log(`[DB] Database '${DB_NAME}' dipastikan ada.`);
    } catch (err) {
        console.error('[DB] Gagal bootstrap database:', err.message);
        return;
    }

    try {
        // Buat tabel users kalau belum ada
        await bootstrapConn.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                full_name VARCHAR(255),
                position VARCHAR(100),
                location VARCHAR(255),
                profile_image VARCHAR(255),
                is_online BOOLEAN DEFAULT FALSE,
                last_seen DATETIME NULL
            )
        `);
        console.log('[DB] Tabel users siap.');

        // Buat tabel otp_codes kalau belum ada
        await bootstrapConn.query(`
            CREATE TABLE IF NOT EXISTS otp_codes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT DEFAULT NULL,
                otp VARCHAR(6) DEFAULT NULL,
                expired_at DATETIME DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                KEY user_id_idx (user_id),
                CONSTRAINT otp_codes_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id)
            )
        `);
        console.log('[DB] Tabel otp_codes siap.');

        // Buat tabel videos kalau belum ada
        await bootstrapConn.query(`
            CREATE TABLE IF NOT EXISTS videos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                video_path VARCHAR(255) NOT NULL,
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                approved_by INT NULL,
                approved_at TIMESTAMP NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
            )
        `);
        console.log('[DB] Tabel videos siap.');

        // Migrasi kolom lama (abaikan jika sudah ada)
        const migrations = [
            "ALTER TABLE users ADD COLUMN full_name VARCHAR(255)",
            "ALTER TABLE users ADD COLUMN position VARCHAR(100)",
            "ALTER TABLE users ADD COLUMN location VARCHAR(255)",
            "ALTER TABLE users ADD COLUMN profile_image VARCHAR(255)",
            "ALTER TABLE users ADD COLUMN is_online BOOLEAN DEFAULT FALSE",
            "ALTER TABLE users ADD COLUMN last_seen DATETIME NULL"
        ];
        for (const q of migrations) {
            try { await bootstrapConn.query(q); } catch (e) { /* sudah ada, abaikan */ }
        }

        console.log('[DB] Semua struktur database diverifikasi normal.');
    } catch (err) {
        console.error('[DB] Error saat migrasi tabel:', err.message);
    } finally {
        await bootstrapConn.end();
    }

    // Verifikasi koneksi pool utama
    try {
        const conn = await pool.getConnection();
        console.log('[DB] Pool koneksi utama berhasil terkoneksi ke MySQL.');
        conn.release();
    } catch (err) {
        console.error('[DB] Gagal terkoneksi ke pool database:', err.message);
    }
};

export default pool;
