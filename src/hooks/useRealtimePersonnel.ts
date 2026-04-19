import { useEffect, useState, useCallback } from 'react';

// Data mentah dari API MySQL backend (Hasil Join dengan Users)
interface GpsRow {
    id: number;
    user_id: number;
    name: string;
    role: string;
    profile_image: string | null;
    latitude: number;
    longitude: number;
    speed: number | null;
    battery: number | null;
    heart_rate: number | null;
    created_at: string;
}

// Data yang sudah diproses untuk komponen UI
export interface Personnel {
    id: string; // kita pakai user_id sebagai string ID
    name: string;
    role: string;
    location: string;
    status: 'online' | 'offline';
    lat: number;
    lng: number;
    speed: number | null;
    battery: number;
    heart_rate: number;
    updated_at: string;
    profile_image?: string;
}

function rowToPersonnel(row: GpsRow): Personnel {
    // Konversi waktu ke WIB (Asia/Jakarta)
    const waktu = new Date(row.created_at);
    const now = new Date();
    const diff = (now.getTime() - waktu.getTime()) / 1000;
    
    // Status online jika update dalam 60 detik terakhir (lebih longgar untuk Raspi)
    const status: 'online' | 'offline' = diff < 60 ? 'online' : 'offline';

    // Format waktu WIB untuk display
    const waktuWIB = waktu.toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    return {
        id: row.user_id.toString(),
        name: row.name || `User ${row.user_id}`,
        role: row.role || 'Personnel',
        location: `${row.latitude.toFixed(5)}, ${row.longitude.toFixed(5)}`,
        status,
        lat: row.latitude,
        lng: row.longitude,
        speed: row.speed,
        battery: row.battery || 100,
        heart_rate: row.heart_rate || 75,
        updated_at: waktuWIB,
        profile_image: row.profile_image || undefined
    };
}

export function useRealtimePersonnel() {
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Ambil data terbaru dari Backend API VPS
    const loadGPS = useCallback(async () => {
        try {
            const response = await fetch('/api/gps/latest');
            if (!response.ok) throw new Error('Gagal mengambil data GPS dari server');
            
            const result = await response.json();
            
            if (result.success && result.data) {
                const processed = result.data.map(rowToPersonnel);
                setPersonnel(processed);
                setError(null);
            }
        } catch (err: any) {
            console.error('Error fetching GPS data:', err);
            setError(err.message || 'Gagal memuat data GPS');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Fetch pertama kali
        loadGPS();

        // Polling tiap 5 detik untuk simulasi realtime
        const interval = setInterval(loadGPS, 5000);

        return () => {
            clearInterval(interval);
        };
    }, [loadGPS]);

    return { personnel, loading, error, refetch: loadGPS };
}
