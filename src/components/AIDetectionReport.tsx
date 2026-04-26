import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Car, Bike, Info, ShieldAlert, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIDetectionData {
  person_count: number;
  car_count: number;
  motorcycle_count: number;
  status: string;
  timestamp: string;
}

const AIDetectionReport = () => {
  const [data, setData] = useState<AIDetectionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch("/api/ai/latest");
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Gagal mengambil data deteksi AI:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();
    const interval = setInterval(fetchLatest, 3000); // Polling every 3 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) return null;

  const isAlert = data.status.includes("⚠️");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-xl overflow-hidden border-border/50 shadow-xl"
    >
      <div className={cn(
        "px-4 py-2 flex items-center justify-between border-b border-border/30",
        isAlert ? "bg-destructive/10" : "bg-primary/5"
      )}>
        <div className="flex items-center gap-2">
          {isAlert ? <ShieldAlert className="w-4 h-4 text-destructive" /> : <CheckCircle2 className="w-4 h-4 text-success" />}
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-widest",
            isAlert ? "text-destructive" : "text-primary"
          )}>
            AI Intelligence Report
          </span>
        </div>
        <span className="text-[9px] font-mono text-muted-foreground">
          LIVE {new Date(data.timestamp).toLocaleTimeString()}
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Status Message */}
        <div className={cn(
          "p-3 rounded-lg border flex items-center gap-3",
          isAlert ? "bg-destructive/5 border-destructive/20 text-destructive" : "bg-success/5 border-success/20 text-success"
        )}>
          <Info className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-bold tracking-tight">{data.status}</p>
        </div>

        {/* Counters */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/30 p-3 rounded-xl border border-border/50 text-center">
            <Users className="w-4 h-4 mx-auto mb-1 text-primary" />
            <div className="text-xl font-bold text-foreground">{data.person_count}</div>
            <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-tight">Orang</div>
          </div>
          <div className="bg-muted/30 p-3 rounded-xl border border-border/50 text-center">
            <Car className="w-4 h-4 mx-auto mb-1 text-primary" />
            <div className="text-xl font-bold text-foreground">{data.car_count}</div>
            <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-tight">Mobil</div>
          </div>
          <div className="bg-muted/30 p-3 rounded-xl border border-border/50 text-center">
            <Bike className="w-4 h-4 mx-auto mb-1 text-primary" />
            <div className="text-xl font-bold text-foreground">{data.motorcycle_count}</div>
            <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-tight">Motor</div>
          </div>
        </div>

        {/* Analysis Detail */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-[9px] text-muted-foreground font-bold uppercase mb-2 px-1">
            <span>Confidence Analysis</span>
            <span>YOLOv8 Nano</span>
          </div>
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: "85%" }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AIDetectionReport;
