import { useEffect, useState, useCallback, useRef } from 'react';

// Data mentah dari API MySQL backend
interface GpsRow {
    id: number;
    device_id: string;
    latitude: number;
    longitude: number;
    speed: number | null;
    battery: number | null;
    heart_rate: number | null;
    created_at: string;
}

// Data yang sudah diproses per device (untuk komponen UI)
export interface Personnel {
    id: string;
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
}

// Mapping device_id ke info personil
const DEVICE_INFO: Record<string, { name: string; role: string }> = {
    bodycam01: { name: 'Bodycam 01', role: 'Security Officer' },
    bodycam02: { name: 'Bodycam 02', role: 'Security Officer' },
    bodycam03: { name: 'Bodycam 03', role: 'Security Officer' },
    bodycam04: { name: 'Bodycam 04', role: 'Security Officer' },
    bodycam05: { name: 'Bodycam 05', role: 'Security Officer' },
    bodycam06: { name: 'Bodycam 06', role: 'Security Officer' },
};

function getDeviceInfo(deviceId: string) {
    return DEVICE_INFO[deviceId] || { name: deviceId, role: 'Unknown' };
}

function rowToPersonnel(row: GpsRow): Personnel {
    const info = getDeviceInfo(row.device_id);

    // Konversi waktu ke WIB (Asia/Jakarta)
    const waktu = new Date(row.created_at);
    const now = new Date();
    const diff = (now.getTime() - waktu.getTime()) / 1000;
    
    // Status online jika update dalam 30 detik terakhir
    const status: 'online' | 'offline' = diff < 30 ? 'online' : 'offline';

    // Format waktu WIB untuk display
    const waktuWIB = waktu.toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    return {
        id: row.device_id,
        name: info.name,
        role: info.role,
        location: `${row.latitude.toFixed(5)}, ${row.longitude.toFixed(5)}`,
        status,
        lat: row.latitude,
        lng: row.longitude,
        speed: row.speed,
        battery: row.battery || 100,
        heart_rate: row.heart_rate || 75,
        updated_at: waktuWIB,
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
