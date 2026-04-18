import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'guardwatch_db',
    connectionLimit: 10
});

// Auto-migrate to ensure columns exist
export const initDB = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('[DB] Connected to MySQL successfully.');
        
        const newColumns = [
            "ALTER TABLE users ADD COLUMN full_name VARCHAR(255)",
            "ALTER TABLE users ADD COLUMN position VARCHAR(100)",
            "ALTER TABLE users ADD COLUMN location VARCHAR(255)",
            "ALTER TABLE users ADD COLUMN profile_image VARCHAR(255)",
            "ALTER TABLE users ADD COLUMN is_online BOOLEAN DEFAULT FALSE",
            "ALTER TABLE users ADD COLUMN last_seen DATETIME NULL"
        ];

        for (const query of newColumns) {
            try {
                await connection.query(query);
                console.log(`[DB Migration] Kolom baru ditambahkan: ${query}`);
            } catch (err) {
                // Ignore error if column already exists
                if (err.code !== 'ER_DUP_FIELDNAME') {
                    console.error('[DB Migration Error]', err.message);
                }
            }
        }
        
        // Memastikan tabel videos untuk sistem Video Approval ada
        const createVideosTableQuery = `
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
        `;
        await connection.query(createVideosTableQuery);
        console.log('[DB Migration] Tabel videos siap digunakan untuk sistem approval.');
        console.log('[DB] Semua struktur database video diverifikasi normal.');
        
        connection.release();
    } catch (err) {
        console.error('[DB] Gagal terkoneksi ke database:', err.message);
    }
};

export default pool;
