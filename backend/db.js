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
        
        // Cek dan tambahkan kolom baru jika belum ada
        const newColumns = [
            "ALTER TABLE users ADD COLUMN full_name VARCHAR(255)",
            "ALTER TABLE users ADD COLUMN position VARCHAR(100)",
            "ALTER TABLE users ADD COLUMN location VARCHAR(255)"
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
        
        connection.release();
    } catch (err) {
        console.error('[DB] Gagal terkoneksi ke database:', err.message);
    }
};

export default pool;
