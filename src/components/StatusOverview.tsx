import { motion } from "framer-motion";
import { Users, AlertTriangle, Shield, Radio } from "lucide-react";
import { useTranslation } from "react-i18next";

interface StatusOverviewProps {
  personnel: Personnel[];
  onlineUsersCount?: number;
}

const StatusOverview = ({ personnel, onlineUsersCount = 0 }: StatusOverviewProps) => {
  const { t } = useTranslation();
  const totalPersonnel = personnel.length;
  const bodycamOnlineCount = personnel.filter((p) => p.status === "online").length;
  const bodycamOfflineCount = personnel.filter((p) => p.status === "offline").length;
  const connectionPercent = totalPersonnel > 0 ? Math.round((bodycamOnlineCount / totalPersonnel) * 100) : 0;

  const stats = [
    {
      icon: Users,
      label: t('dashboard.totalPersonnel'),
      value: String(totalPersonnel),
      subtext: `${bodycamOnlineCount} ${t('dashboard.activeBodycams')}`,
      color: "primary",
    },
    {
      icon: Shield,
      label: t('dashboard.webAdminOnline'),
      value: String(onlineUsersCount),
      subtext: t('dashboard.activeUsers'),
      color: "success",
    },
    {
      icon: AlertTriangle,
      label: t('dashboard.bodycamOffline'),
      value: String(bodycamOfflineCount),
      subtext: bodycamOfflineCount > 0 ? t('dashboard.needAttention') : t('dashboard.allOnline'),
      color: bodycamOfflineCount > 0 ? "destructive" : "success",
    },
    {
      icon: Radio,
      label: t('dashboard.bodycamConnection'),
      value: `${connectionPercent}%`,
      subtext: connectionPercent === 100 ? t('dashboard.allConnected') : `${bodycamOfflineCount} ${t('dashboard.offline')}`,
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
