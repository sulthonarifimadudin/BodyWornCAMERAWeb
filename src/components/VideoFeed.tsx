import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Video, VideoOff, Maximize2, Volume2, Activity, Disc, Square, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import HLSPlayer from "./HLSPlayer";
import { Personnel } from "@/hooks/useRealtimePersonnel";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface VideoFeedProps {
  selectedPersonnelId: string | null;
  personnel: Personnel[];
  hideThumbnails?: boolean;
}

const VideoFeed = ({ selectedPersonnelId, personnel, hideThumbnails = false }: VideoFeedProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [streamType, setStreamType] = useState<'raw' | 'ai'>('raw');
  const [isRecording, setIsRecording] = useState(false);
  const [recordLoading, setRecordLoading] = useState(false);
  const token = localStorage.getItem("jwtToken");

  const isAdminOrSupervisor = user?.role === 'admin' || user?.role === 'supervisor';

  // Find the selected person from the real personnel list
  const selectedPerson = useMemo(() => 
    personnel.find(p => p.id === selectedPersonnelId), 
    [personnel, selectedPersonnelId]
  );

  const mainStreamUrl = streamType === 'ai' 
    ? '/mediamtx/live/output/index.m3u8'
    : '/mediamtx/live/stream/index.m3u8';

  const streamId = streamType === 'ai' ? 'live/output' : 'live/stream';

  useEffect(() => {
    checkRecordStatus();
    const interval = setInterval(checkRecordStatus, 5000);
    return () => clearInterval(interval);
  }, [streamId]);

  const checkRecordStatus = async () => {
    try {
      const res = await fetch("/api/admin/record/status", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.activeRecordings) {
        setIsRecording(!!data.activeRecordings[streamId]);
      }
    } catch (err) {
      console.error("Gagal cek status rekaman");
    }
  };

  const handleToggleRecord = async () => {
    if (!isAdminOrSupervisor) return;
    
    setRecordLoading(true);
    const endpoint = isRecording ? "/api/admin/record/stop" : "/api/admin/record/start";
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          streamId,
          personnelName: selectedPerson?.name || "Global Stream"
        })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setIsRecording(!isRecording);
        toast.success(data.message);
      } else {
        toast.error(data.message || "Gagal memproses rekaman");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan koneksi");
    } finally {
      setRecordLoading(false);
    }
  };

  // For previews, we always use RAW
  const getRawStreamUrl = (id: string) => {
    return '/mediamtx/live/stream/index.m3u8';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card rounded-xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.1)] border-border/50 h-full flex flex-col"
    >
      <div className="p-4 border-b border-border/50 flex items-center justify-between bg-card/50 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <Video className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col">
            <h2 className="font-display font-semibold text-foreground">{t('dashboard.videoFeed')}</h2>
            {selectedPerson && (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-bold uppercase tracking-wider">
                  {selectedPerson.name}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {selectedPerson.role}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Recording Button */}
          {isAdminOrSupervisor && (
            <Button
              onClick={handleToggleRecord}
              disabled={recordLoading}
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              className={cn(
                "h-8 px-3 text-[10px] font-bold flex items-center gap-2 rounded-xl border-border/50 transition-all",
                isRecording && "animate-pulse shadow-lg shadow-destructive/20"
              )}
            >
              {recordLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isRecording ? (
                <Square className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Disc className="w-3.5 h-3.5" />
              )}
              {isRecording ? "STOP REC" : "RECORD"}
            </Button>
          )}

          <div className="w-px h-4 bg-border/50 mx-1" />

          {/* Stream Type Switcher */}
          <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50">
            <button 
              onClick={() => setStreamType('raw')}
              className={cn(
                "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
                streamType === 'raw' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              RAW
            </button>
            <button 
              onClick={() => setStreamType('ai')}
              className={cn(
                "px-3 py-1 text-[10px] font-bold rounded-md transition-all flex items-center gap-1",
                streamType === 'ai' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Activity className="w-3 h-3" />
              AI DETECT
            </button>
          </div>
          
          <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8">
            <Volume2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-4 p-4 flex-1">
        {/* Main Video Feed */}
        <div className={cn(
          "relative rounded-lg overflow-hidden bg-black border border-border shadow-inner",
          hideThumbnails ? "lg:col-span-4 h-full" : "lg:col-span-3 aspect-video",
          "group"
        )}>
          {selectedPerson ? (
            <HLSPlayer 
              url={mainStreamUrl} 
              className="w-full h-full"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/10">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 border border-border">
                  <VideoOff className="w-8 h-8 text-muted-foreground opacity-50" />
                </div>
                <p className="text-muted-foreground text-xs uppercase tracking-widest">{t('dashboard.selectPersonnelFeed')}</p>
              </div>
            </div>
          )}

          {/* Recording Overlay */}
          {isRecording && (
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-destructive/50">
              <div className="w-2 h-2 rounded-full bg-destructive animate-ping" />
              <span className="text-[10px] font-bold text-white tracking-widest uppercase">REC</span>
              <div className="w-px h-3 bg-white/20 mx-1" />
              <span className="text-[9px] font-mono text-white/80">
                {selectedPerson?.name || "Global"}
              </span>
            </div>
          )}
        </div>

        {/* Thumbnail Grid */}
        {!hideThumbnails && (
          <div className="space-y-3 lg:col-span-1">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Feed Lainnya</p>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                {personnel.filter(p => p.status !== 'offline').length} LIVE
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-3 overflow-y-auto max-h-[350px] pr-1 custom-scrollbar">
              {personnel.length > 0 ? (
                personnel.map((person) => (
                  <div 
                    key={person.id}
                    className={cn(
                      "relative aspect-video rounded-xl overflow-hidden bg-muted/30 border border-border/50 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group",
                      selectedPersonnelId === person.id ? "ring-2 ring-primary border-primary/50 shadow-lg shadow-primary/10" : "hover:border-primary/30"
                    )}
                    onClick={() => {
                      // Logic handled by parent through selectedPersonnelId prop
                    }}
                  >
                    {/* Live Mini Player */}
                    {person.status !== 'offline' ? (
                      <div className="absolute inset-0 z-0">
                        <HLSPlayer 
                          url={getRawStreamUrl(person.id)} 
                          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                          showControls={false}
                          autoPlay={true}
                          muted={true}
                        />
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted/10">
                        <VideoOff className="w-5 h-5 text-muted-foreground/30" />
                      </div>
                    )}

                    {/* Overlay Info */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 z-10">
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          person.status === "online" && "bg-success glow-success",
                          person.status === "alert" && "bg-destructive animate-pulse glow-destructive",
                          person.status === "idle" && "bg-warning glow-warning",
                          person.status === "offline" && "bg-muted-foreground/50"
                        )} />
                        <span className="text-[9px] font-bold text-white uppercase tracking-tighter drop-shadow-md">
                          {person.status}
                        </span>
                      </div>

                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-[11px] font-bold text-white truncate drop-shadow-md">
                          {person.name}
                        </p>
                        <p className="text-[9px] text-white/70 truncate tracking-tight font-medium">
                          {person.role}
                        </p>
                      </div>
                      
                      {/* Hover Effect */}
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Activity className="w-6 h-6 text-white animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center border border-dashed border-border rounded-xl">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">No Active Feeds</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default VideoFeed;
