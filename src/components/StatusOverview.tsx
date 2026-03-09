import { motion } from "framer-motion";
import { Users, AlertTriangle, Shield, Radio } from "lucide-react";
import type { Personnel } from "@/hooks/useRealtimePersonnel";

interface StatusOverviewProps {
  personnel: Personnel[];
}

const StatusOverview = ({ personnel }: StatusOverviewProps) => {
  const totalPersonnel = personnel.length;
  const onlineCount = personnel.filter((p) => p.status === "online").length;
  const offlineCount = personnel.filter((p) => p.status === "offline").length;
  const connectionPercent = totalPersonnel > 0 ? Math.round((onlineCount / totalPersonnel) * 100) : 0;

  const stats = [
    {
      icon: Users,
      label: "Total Personil",
      value: String(totalPersonnel),
      subtext: `${onlineCount} online sekarang`,
      color: "primary",
    },
    {
      icon: Shield,
      label: "Online",
      value: String(onlineCount),
      subtext: totalPersonnel > 0 ? `${Math.round((onlineCount / totalPersonnel) * 100)}% dari total` : "0%",
      color: "success",
    },
    {
      icon: AlertTriangle,
      label: "Offline",
      value: String(offlineCount),
      subtext: offlineCount > 0 ? "Perlu perhatian" : "Semua online",
      color: "destructive",
    },
    {
      icon: Radio,
      label: "Koneksi",
      value: `${connectionPercent}%`,
      subtext: connectionPercent === 100 ? "Semua terhubung" : `${offlineCount} offline`,
      color: "primary",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card rounded-xl p-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className={`font-display text-2xl font-bold ${stat.color === "primary" ? "text-primary" :
                stat.color === "success" ? "text-success" :
                  "text-destructive"
                }`}>
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{stat.subtext}</p>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color === "primary" ? "bg-primary/10" :
              stat.color === "success" ? "bg-success/10" :
                "bg-destructive/10"
              }`}>
              <stat.icon className={`w-5 h-5 ${stat.color === "primary" ? "text-primary" :
                stat.color === "success" ? "text-success" :
                  "text-destructive"
                }`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatusOverview;
