import { useContext } from "react";
import { Folder, Lock, Activity, Smartphone } from "lucide-react";
import { ThemeContext } from "../../context/ThemeContext";
import { QueueContext } from "../../context/QueueContext";

interface BottomNavBarProps {
  activeTab: "drive" | "vault" | "queue" | "settings";
  setActiveTab: (tab: "drive" | "vault" | "queue" | "settings") => void;
}

export default function BottomNavBar({
  activeTab,
  setActiveTab,
}: BottomNavBarProps) {
  const { isDarkMode } = useContext(ThemeContext)!;
  const { transfers } = useContext(QueueContext)!;

  return (
    <div
      className={`h-16 px-6 border-t fixed bottom-0 left-0 right-0 z-30 flex items-center justify-between ${
        isDarkMode
          ? "bg-[#090D16]/95 border-[#1F2937]"
          : "bg-white/95 border-[#E5E7EB]"
      }`}
    >
      <button
        onClick={() => setActiveTab("drive")}
        className={`flex flex-col items-center gap-1 flex-1 transition-all ${
          activeTab === "drive"
            ? "text-blue-500 font-bold"
            : "text-gray-500 hover:text-white"
        }`}
      >
        <Folder className="w-5 h-5" />
        <span className="text-[9px]">Drive</span>
      </button>

      <button
        onClick={() => setActiveTab("vault")}
        className={`flex flex-col items-center gap-1 flex-1 transition-all ${
          activeTab === "vault"
            ? "text-teal-500 font-bold"
            : "text-gray-500 hover:text-white"
        }`}
      >
        <Lock className="w-5 h-5" />
        <span className="text-[9px]">Vault</span>
      </button>

      <button
        onClick={() => setActiveTab("queue")}
        className={`flex flex-col items-center gap-1 flex-1 transition-all ${
          activeTab === "queue"
            ? "text-blue-500 font-bold"
            : "text-gray-500 hover:text-white"
        }`}
      >
        <div className="relative">
          <Activity className="w-5 h-5" />
          {transfers.filter((t) => t.status === "running").length > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500"></span>
          )}
        </div>
        <span className="text-[9px]">Antrean</span>
      </button>

      <button
        onClick={() => setActiveTab("settings")}
        className={`flex flex-col items-center gap-1 flex-1 transition-all ${
          activeTab === "settings"
            ? "text-blue-500 font-bold"
            : "text-gray-500 hover:text-white"
        }`}
      >
        <Smartphone className="w-5 h-5" />
        <span className="text-[9px]">Sesi</span>
      </button>
    </div>
  );
}
