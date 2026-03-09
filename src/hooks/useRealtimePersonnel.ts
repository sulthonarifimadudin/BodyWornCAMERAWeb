import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Data mentah dari tabel gps_tracking
interface GpsRow {
    id: number;
    device_id: string;
    latitude: number;
    longitude: number;
    speed: number | null;
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
    bodycam01: { name: 'Bodycam 01', role: 'Guard' },
    bodycam02: { name: 'Bodycam 02', role: 'Guard' },
    bodycam03: { name: 'Bodycam 03', role: 'Guard' },
    bodycam04: { name: 'Bodycam 04', role: 'Guard' },
    bodycam05: { name: 'Bodycam 05', role: 'Guard' },
    bodycam06: { name: 'Bodycam 06', role: 'Guard' },
};

function getDeviceInfo(deviceId: string) {
    return DEVICE_INFO[deviceId] || { name: deviceId, role: 'Unknown' };
}

function rowToPersonnel(row: GpsRow): Personnel {
    const info = getDeviceInfo(row.device_id);

    // Hitung status: ONLINE jika data terakhir < 15 detik, OFFLINE jika > 15 detik
    const lastTime = new Date(row.created_at);
    const now = new Date();
    const diff = (now.getTime() - lastTime.getTime()) / 1000;
    const status: 'online' | 'offline' = diff < 15 ? 'online' : 'offline';

    return {
        id: row.device_id,
        name: info.name,
        role: info.role,
        location: `${row.latitude.toFixed(5)}, ${row.longitude.toFixed(5)}`,
        status,
        lat: row.latitude,
        lng: row.longitude,
        speed: row.speed,
        battery: 100,
        heart_rate: 70,
        updated_at: row.created_at,
    };
}

export function useRealtimePersonnel() {
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const latestPerDevice = useRef<Map<string, GpsRow>>(new Map());

    // Ambil data terakhir dari Supabase per device
    const loadGPS = useCallback(async () => {
        try {
            // Ambil data terbaru, order by created_at desc
            const { data, error: fetchError } = await supabase
                .from('gps_tracking')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (fetchError) throw fetchError;
            if (!data || data.length === 0) {
                setPersonnel([]);
                return;
            }

            // Ambil row terbaru per device_id
            const deviceMap = new Map<string, GpsRow>();
            data.forEach((row: GpsRow) => {
                if (!deviceMap.has(row.device_id)) {
                    deviceMap.set(row.device_id, row);
                }
            });

            latestPerDevice.current = deviceMap;
            setPersonnel(Array.from(deviceMap.values()).map(rowToPersonnel));
            setError(null);
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

        // Auto update tiap 5 detik (polling)
        const interval = setInterval(loadGPS, 5000);

        // Subscribe ke realtime INSERT untuk update langsung tanpa tunggu polling
        const channel = supabase
            .channel('gps')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'gps_tracking' },
                (payload) => {
                    const newRow = payload.new as GpsRow;
                    // Update marker langsung
                    latestPerDevice.current.set(newRow.device_id, newRow);
                    setPersonnel(
                        Array.from(latestPerDevice.current.values()).map(rowToPersonnel)
                    );
                }
            )
            .subscribe();

        return () => {
            clearInterval(interval);
            supabase.removeChannel(channel);
        };
    }, [loadGPS]);

    return { personnel, loading, error, refetch: loadGPS };
}
