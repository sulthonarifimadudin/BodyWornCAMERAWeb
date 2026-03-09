import { motion } from "framer-motion";
import { Video, VideoOff, Maximize2, Volume2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const selectedPerson = selectedPersonnelId ? personnelData[selectedPersonnelId] : null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-display font-semibold">Video Feed - Bodyworn Camera</h2>
          {selectedPerson && (
            <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
              {selectedPerson.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Volume2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 p-4">
        {/* Main Video Feed */}
        <div className={cn(
          "relative aspect-video rounded-lg overflow-hidden bg-background border border-border/50",
          "md:col-span-2"
        )}>
          {selectedPerson ? (
            <>
              {/* Simulated video feed */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-background">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                    <Video className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground text-sm">Live Stream</p>
                  <p className="text-foreground font-medium">{selectedPerson.name}</p>
                </div>
              </div>

              {/* Video overlay */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-background/80 backdrop-blur text-xs">
                  <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                  LIVE
                </span>
                {selectedPerson.status === "alert" && (
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-destructive/80 backdrop-blur text-xs text-destructive-foreground">
                    <AlertTriangle className="w-3 h-3" />
                    ALERT
                  </span>
                )}
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="text-xs text-foreground bg-background/80 backdrop-blur px-2 py-1 rounded">
                  {selectedPerson.location}
                </span>
                <span className="text-xs text-muted-foreground bg-background/80 backdrop-blur px-2 py-1 rounded font-mono">
                  {new Date().toLocaleTimeString('id-ID')}
                </span>
              </div>

              {/* Scanline effect */}
              <div className="absolute inset-0 scanline opacity-30 pointer-events-none" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <VideoOff className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">Pilih personil untuk melihat video feed</p>
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
