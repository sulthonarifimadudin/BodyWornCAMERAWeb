import { motion } from "framer-motion";
import { User, MapPin, Battery, Heart, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Personnel } from "@/hooks/useRealtimePersonnel";

interface PersonnelListProps {
  personnel: Personnel[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const PersonnelList = ({ personnel, selectedId, onSelect }: PersonnelListProps) => {
  const onlineCount = personnel.filter((p) => p.status !== "offline").length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card rounded-xl h-[500px] flex flex-col"
    >
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <h2 className="font-display font-semibold">Daftar Personil</h2>
        <span className="text-xs text-muted-foreground">{onlineCount} aktif</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {personnel.length === 0 && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Tidak ada data personil
          </div>
        )}
        {personnel.map((person, i) => (
          <motion.div
            key={person.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => onSelect(selectedId === person.id ? null : person.id)}
            className={cn(
              "p-3 rounded-lg cursor-pointer transition-all duration-200 border",
              selectedId === person.id
                ? "bg-primary/10 border-primary/50"
                : "bg-secondary/50 border-transparent hover:bg-secondary hover:border-border"
            )}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <span className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card",
                  person.status === "online" && "bg-success",
                  person.status === "alert" && "bg-destructive animate-pulse",
                  person.status === "idle" && "bg-warning",
                  person.status === "offline" && "bg-gray-500"
                )} />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{person.name}</span>
                  <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">
                    ID: {person.id}
                  </span>
                  {person.status === "alert" && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-destructive/20 text-destructive">
                      ALERT
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                  <MapPin className="w-3 h-3" />
                  <span>{person.location || 'Tidak diketahui'}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-xs">
                    <Battery className={cn(
                      "w-3 h-3",
                      person.battery > 50 ? "text-success" : person.battery > 20 ? "text-warning" : "text-destructive"
                    )} />
                    <span className="text-muted-foreground">{person.battery}%</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Heart className={cn(
                      "w-3 h-3",
                      person.heart_rate > 90 ? "text-destructive animate-pulse" : "text-success"
                    )} />
                    <span className="text-muted-foreground">{person.heart_rate} bpm</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Radio className={cn(
                      "w-3 h-3",
                      person.status === "offline" ? "text-gray-500" : "text-primary"
                    )} />
                    <span className="text-muted-foreground capitalize">{person.status === "offline" ? "Offline" : "Online"}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default PersonnelList;
