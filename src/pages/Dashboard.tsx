import { useState } from "react";
import { useRealtimePersonnel } from "@/hooks/useRealtimePersonnel";
import { motion } from "framer-motion";
import { io } from 'socket.io-client';
import SecurityMap from "@/components/SecurityMap";
import PersonnelList from "@/components/PersonnelList";
import VideoFeed from "@/components/VideoFeed";
import StatusOverview from "@/components/StatusOverview";
import AIDetectionReport from "@/components/AIDetectionReport";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Layout, Maximize2, Repeat } from "lucide-react";

const socket = io('https://bodyworncamera.sbs');

const Dashboard = () => {
  const { t } = useTranslation();
  const [selectedPersonnel, setSelectedPersonnel] = useState<string | null>(null);
  const { personnel } = useRealtimePersonnel();
  const [layoutMode, setLayoutMode] = useState<'classic' | 'tactical'>('classic');
  const [isSwapped, setIsSwapped] = useState(false);

  const handleSendAlert = (userId: string, action: 'start' | 'stop') => {
    console.log(`Mengirim perintah buzzer ${action} ke user:`, userId);
    socket.emit('perintah_buzzer', { userId: parseInt(userId), action });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <StatusOverview personnel={personnel} onlineUsersCount={0} />
        
        {/* Layout Controls */}
        <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-xl border border-border/50 shadow-inner self-end sm:self-center">
          <button
            onClick={() => setLayoutMode('classic')}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
              layoutMode === 'classic' 
                ? "bg-card text-primary shadow-sm ring-1 ring-border/50" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
            )}
          >
            <Layout className="w-3.5 h-3.5" />
            {t('dashboard.classic')}
          </button>
          <button
            onClick={() => setLayoutMode('tactical')}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
              layoutMode === 'tactical' 
                ? "bg-card text-primary shadow-sm ring-1 ring-border/50" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
            )}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            {t('dashboard.tactical')}
          </button>
          <div className="w-px h-4 bg-border/50 mx-1" />
          <button
            onClick={() => setIsSwapped(!isSwapped)}
            className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
            title="Swap View"
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>
      </div>

      {layoutMode === 'classic' ? (
        <div className={cn("flex flex-col gap-6", isSwapped ? "flex-col-reverse" : "flex-col")}>
          {/* Row 1: Video & AI */}
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <VideoFeed 
                selectedPersonnelId={selectedPersonnel} 
                personnel={personnel}
                hideThumbnails={false}
              />
            </div>
            <div className="lg:col-span-1">
              <AIDetectionReport />
            </div>
          </div>

          {/* Row 2: Map & List */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card backdrop-blur-xl border border-border rounded-2xl overflow-hidden h-[500px] shadow-[0_2px_10px_rgba(0,0,0,0.1)] flex flex-col"
              >
                <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 glow-success" />
                    <h2 className="font-bold text-foreground tracking-tight">{t('dashboard.personnelMap')}</h2>
                  </div>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-wider">LIVE</span>
                </div>
                <div className="flex-1">
                  <SecurityMap 
                    personnel={personnel} 
                    selectedId={selectedPersonnel}
                    onSelectPersonnel={setSelectedPersonnel} 
                  />
                </div>
              </motion.div>
            </div>
            <div className="lg:col-span-1">
              <PersonnelList
                personnel={personnel}
                selectedId={selectedPersonnel}
                onSelect={setSelectedPersonnel}
                onSendAlert={handleSendAlert}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* TACTICAL LAYOUT */}
          <div className={cn("grid lg:grid-cols-2 gap-6 min-h-[500px]")}>
            <div className={cn("h-full", isSwapped ? "order-2" : "order-1")}>
              <VideoFeed 
                selectedPersonnelId={selectedPersonnel} 
                personnel={personnel}
                hideThumbnails={true}
              />
            </div>
            <motion.div
              initial={{ opacity: 0, x: isSwapped ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "bg-card backdrop-blur-xl border border-border rounded-2xl overflow-hidden shadow-sm h-full flex flex-col",
                isSwapped ? "order-1" : "order-2"
              )}
            >
              <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 glow-success" />
                  <h2 className="font-bold text-foreground tracking-tight">Tactical Map</h2>
                </div>
                <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-wider">LIVE</span>
              </div>
              <div className="flex-1">
                <SecurityMap 
                  personnel={personnel} 
                  selectedId={selectedPersonnel}
                  onSelectPersonnel={setSelectedPersonnel} 
                />
              </div>
            </motion.div>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <AIDetectionReport />
            </div>
            <div className="lg:col-span-2">
              <PersonnelList
                personnel={personnel}
                selectedId={selectedPersonnel}
                onSelect={setSelectedPersonnel}
                onSendAlert={handleSendAlert}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
