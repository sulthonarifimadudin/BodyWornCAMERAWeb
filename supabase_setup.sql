-- =============================================
-- Enable Realtime pada tabel gps_tracking
-- Jalankan ini di Supabase SQL Editor jika 
-- belum enable Realtime untuk tabel gps_tracking
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE gps_tracking;
