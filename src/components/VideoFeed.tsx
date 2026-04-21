import { useState } from "react";
import { motion } from "framer-motion";
import { Video, VideoOff, Maximize2, Volume2, AlertTriangle, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import HLSPlayer from "./HLSPlayer";

interface VideoFeedProps {
  selectedPersonnelId: string | null;
}

const personnelData: Record<string, { name: string; location: string; status: string }> = {
  "1": { name: "Budi Santoso", location: "Pos Utara", status: "online" },
  "2": { name: "Ahmad Wijaya", location: "Area Timur", status: "online" },
  "3": { name: "Dedi Kurniawan", location: "Area Selatan", status: "alert" },
  "4": { name: "Eko Prasetyo", location: "Pos Barat", status: "online" },
  "5": { name: "Fajar Rahman", location: "Area Parkir", status: "idle" },
  "6": { name: "Gilang Permana", location: "Lobby", status: "online" },
};

const VideoFeed = ({ selectedPersonnelId }: VideoFeedProps) => {
  const { t } = useTranslation();
  const selectedPerson = selectedPersonnelId ? personnelData[selectedPersonnelId] : null;
  const [streamType, setStreamType] = useState<'raw' | 'ai'>('ai');

  const streamUrl = streamType === 'ai' 
    ? 'http://193.183.22.60:8888/live/output/index.m3u8'
    : 'http://193.183.22.60:8888/live/stream/index.m3u8';

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
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-bold uppercase tracking-wider">
              {selectedPerson.name}
            </span>
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

      <div className="grid md:grid-cols-3 gap-4 p-4">
        {/* Main Video Feed */}
        <div className={cn(
          "relative aspect-video rounded-lg overflow-hidden bg-black border border-border shadow-inner",
          "md:col-span-2 group"
        )}>
          {selectedPerson ? (
            <HLSPlayer 
              url={streamUrl} 
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
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Feed Lainnya</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(personnelData).slice(0, 4).map(([id, person]) => (
              <div 
                key={id}
                className={cn(
                  "relative aspect-video rounded-lg overflow-hidden bg-muted cursor-pointer transition-all hover:ring-2 hover:ring-primary/50",
                  selectedPersonnelId === id && "ring-2 ring-primary"
                )}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-background to-transparent">
                  <p className="text-[10px] text-foreground truncate">{person.name.split(' ')[0]}</p>
                </div>
                <div className="absolute top-1 left-1">
                  <span className={cn(
                    "w-2 h-2 rounded-full block",
                    person.status === "online" && "bg-success",
                    person.status === "alert" && "bg-destructive animate-pulse",
                    person.status === "idle" && "bg-warning"
                  )} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoFeed;
