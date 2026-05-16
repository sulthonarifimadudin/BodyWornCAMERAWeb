import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Trash2, Download, Calendar, HardDrive, Play, X, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

interface Recording {
  name: string;
  size: number;
  createdAt: string;
  url: string;
}

const GalleryPage = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<Recording | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("jwtToken");

  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'supervisor') {
      navigate("/dashboard");
      return;
    }
    fetchRecordings();
  }, [user, navigate]);

  const fetchRecordings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/recordings", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRecordings(data.recordings);
      } else {
        setError(data.message || "Gagal mengambil data rekaman.");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  const deleteRecording = async (fileName: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus rekaman ini?")) return;
    
    try {
      const res = await fetch(`/api/admin/recordings/${fileName}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRecordings(recordings.filter(r => r.name !== fileName));
      }
    } catch (err) {
      alert("Gagal menghapus file.");
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Galeri Rekaman</h2>
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">Arsip Video Body Worn Camera</p>
        </div>
        
        <div className="flex items-center gap-4 bg-card border border-border px-4 py-2 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground">{recordings.length} File</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <button 
            onClick={fetchRecordings}
            className="text-xs font-bold text-primary hover:underline"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-card border border-border rounded-2xl h-64 animate-pulse" />
          ))}
        </div>
      ) : recordings.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-20 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
            <Video className="w-10 h-10 text-muted-foreground opacity-30" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Belum Ada Rekaman</h3>
          <p className="text-sm text-muted-foreground max-w-xs mt-2">
            Video yang direkam saat live stream akan muncul di sini secara otomatis.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recordings.map((rec) => (
            <motion.div
              key={rec.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/50 transition-all"
            >
              <div className="aspect-video bg-slate-900 relative flex items-center justify-center overflow-hidden">
                <Video className="w-12 h-12 text-white/10" />
                
                {/* Play Overlay */}
                <div 
                  onClick={() => setSelectedVideo(rec)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-6 h-6 text-white ml-1" />
                  </div>
                </div>

                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded text-[10px] text-white font-mono">
                  {formatSize(rec.size)}
                </div>
              </div>

              <div className="p-4">
                <h4 className="text-sm font-bold text-foreground truncate mb-1" title={rec.name}>
                  {rec.name.replace('rec_', '').replace('.mp4', '').split('_').join(' ')}
                </h4>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                  <Calendar className="w-3 h-3" />
                  {new Date(rec.createdAt).toLocaleString('id-ID', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                  })}
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <button 
                    onClick={() => setSelectedVideo(rec)}
                    className="flex-1 bg-primary/10 text-primary hover:bg-primary hover:text-white py-2 rounded-lg text-[10px] font-bold transition-all"
                  >
                    LIHAT
                  </button>
                  <a 
                    href={rec.url} 
                    download 
                    className="p-2 bg-muted hover:bg-muted/80 rounded-lg text-muted-foreground transition-all"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button 
                    onClick={() => deleteRecording(rec.name)}
                    className="p-2 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 bg-black/90 backdrop-blur-md"
          >
            <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl">
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black text-white rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>
              
              <video 
                src={selectedVideo.url} 
                controls 
                autoPlay 
                className="w-full h-full"
              />
              
              <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                <h3 className="text-white font-bold text-lg">{selectedVideo.name}</h3>
                <p className="text-white/60 text-sm">{new Date(selectedVideo.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryPage;
