import bcrypt from 'bcrypt';
import pool from './db.js';

async function migratePasswords() {
    console.log('==================================================');
    console.log('   MEMULAI PROSES MIGRASI PASSWORD KE BCRYPT');
    console.log('==================================================\n');

    try {
        // 1. Ambil seluruh data user dari database
        const [users] = await pool.query('SELECT id, email, password FROM users');
        let updatedCount = 0;
        let skippedCount = 0;

        console.log(`Total User di database: ${users.length} pengguna\n`);

        for (const user of users) {
            // 2. Deteksi password yang sudah di-hash
            // Hash bcrypt secara default akan diawali dengan $2a$, $2b$, atau $2y$
            if (user.password && user.password.startsWith('$2')) {
                skippedCount++;
                continue; // Skip pengguna ini jika password sudah standar bcrypt
            }

            console.log(`[Proses] User ID: ${user.id} | Email: ${user.email} -> Memerlukan hashing`);
            
            // 3. Melakukan hash terhadap password plaintext
            const saltRounds = 10;
            const newHashedPassword = await bcrypt.hash(user.password, saltRounds);
            
            // 4. Update data pengguna dengan password yang sudah di-hash
            await pool.query('UPDATE users SET password = ? WHERE id = ?', [newHashedPassword, user.id]);
            updatedCount++;
            
            console.log(`   └─ [SUKSES] Password telah diamankan.\n`);
        }

        console.log('==================================================');
        console.log('              LAPORAN MIGRASI SELESAI');
        console.log('==================================================');
        console.log(`Total user       : ${users.length}`);
        console.log(`Sudah aman (skip): ${skippedCount}`);
        console.log(`Berhasil migrasi : ${updatedCount}`);
        console.log('==================================================');
        
    } catch (error) {
        console.error('\n[ERROR FATAL] Terjadi kesalahan saat migrasi:', error);
    } finally {
        // Tutup pool koneksi database agar script NodeJS bisa diakhiri ke console
        pool.end();
        process.exit();
    }
}

// Menjalankan fungsi migrasi
migratePasswords();
