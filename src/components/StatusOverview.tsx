import { motion } from "framer-motion";
import { Users, AlertTriangle, Shield, Radio } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

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
          className="bg-cyan-500 border-cyan-600 dark:bg-cyan-700 dark:border-cyan-600 rounded-xl p-4 shadow-md border transition-all hover:shadow-lg text-white"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-cyan-50 mb-1">{stat.label}</p>
              <p className="font-display text-2xl font-bold text-white">
                {stat.value}
              </p>
              <p className="text-xs text-cyan-50 mt-1">{stat.subtext}</p>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/20">
              <stat.icon className="w-5 h-5 text-white" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatusOverview;
