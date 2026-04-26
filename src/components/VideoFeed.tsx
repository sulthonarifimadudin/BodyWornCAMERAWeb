import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Video, VideoOff, Maximize2, Volume2, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import HLSPlayer from "./HLSPlayer";
import { Personnel } from "@/hooks/useRealtimePersonnel";

interface VideoFeedProps {
  selectedPersonnelId: string | null;
  personnel: Personnel[];
}

const VideoFeed = ({ selectedPersonnelId, personnel }: VideoFeedProps) => {
  const { t } = useTranslation();
  const [streamType, setStreamType] = useState<'raw' | 'ai'>('raw');

  // Find the selected person from the real personnel list
  const selectedPerson = useMemo(() => 
    personnel.find(p => p.id === selectedPersonnelId), 
    [personnel, selectedPersonnelId]
  );

  const mainStreamUrl = streamType === 'ai' 
    ? '/mediamtx/live/output/index.m3u8'
    : '/mediamtx/live/stream/index.m3u8';

  // For previews, we always use RAW
  const getRawStreamUrl = (id: string) => {
    // In a multi-camera setup, this would be dynamic based on user ID
    // For now, we use the same stream as a demo if the person is online
    return '/mediamtx/live/stream/index.m3u8';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card rounded-xl overflow-hidden shadow-2xl border-border/50"
    >
      <div className="p-4 border-b border-border/50 flex items-center justify-between bg-card/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <Video className="w-4 h-4 text-primary" />
          </div>
          <h2 className="font-display font-semibold text-foreground">{t('dashboard.videoFeed')}</h2>
          {selectedPerson && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-bold uppercase tracking-wider">
                {selectedPerson.name}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {selectedPerson.role}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Stream Type Switcher */}
          <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50 mr-2">
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
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Volume2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-4 p-4">
        {/* Main Video Feed */}
        <div className={cn(
          "relative aspect-video rounded-lg overflow-hidden bg-black border border-border shadow-inner",
          "lg:col-span-3 group"
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
        </div>

        {/* Thumbnail Grid */}
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
                    // Logic to select this personnel would be handled by parent
                    // but we can add a visual hint here
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
      </div>
    </motion.div>
  );
};

export default VideoFeed;
