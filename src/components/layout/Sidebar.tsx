import { useContext } from "react";
import {
  Cpu,
  Folder,
  Lock,
  Shield,
  Activity,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import { DriveContext } from "../../context/DriveContext";
import { QueueContext } from "../../context/QueueContext";

interface SidebarProps {
  activeTab: "drive" | "queue" | "settings";
  setActiveTab: (tab: "drive" | "queue" | "settings") => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { toggleTheme, isDarkMode } = useContext(ThemeContext)!;
  const { logout, telegramUser } = useContext(AuthContext)!;
  const { files, isSecureVaultActive, setIsSecureVaultActive } =
    useContext(DriveContext)!;
  const { transfers } = useContext(QueueContext)!;

  return (
    <div
      className={`w-64 shrink-0 flex flex-col border-r transition-all duration-300 ${
        isDarkMode
          ? "bg-[#090D16] border-[#1F2937]"
          : "bg-[#F3F4F6] border-[#E5E7EB]"
      }`}
    >
      <div className="p-6 flex items-center gap-3">
        <div className="p-2 bg-blue-600 rounded-xl text-white">
          <Cpu className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold tracking-tight">Dissz Drive</h2>
          <span className="text-[10px] text-gray-500 font-medium">
            BETA V3.1
          </span>
        </div>
      </div>

      <div
        className={`mx-4 mb-6 p-4 rounded-xl flex items-center gap-3 ${
          isDarkMode
            ? "bg-[#111827]/60 border border-[#1F2937]"
            : "bg-white border border-[#E5E7EB]"
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
          FD
        </div>
        <div className="overflow-hidden">
          <h4 className="font-semibold text-xs truncate">
            {telegramUser?.name}
          </h4>
          <span className="text-[10px] text-gray-500 block truncate">
            {telegramUser?.username}
          </span>
        </div>
      </div>

      <div className="px-3 flex-1 space-y-1">
        <button
          onClick={() => {
            setActiveTab("drive");
            setIsSecureVaultActive(false);
          }}
          className={`w-full px-4 py-2.5 rounded-xl flex items-center justify-between transition-all ${
            activeTab === "drive" && !isSecureVaultActive
              ? "bg-blue-600 text-white font-medium shadow-md shadow-blue-500/10"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-3">
            <Folder className="w-4 h-4" />
            <span>Personal Drive</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/10 text-xs">
            {files.filter((f) => !f.isEncrypted).length}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab("drive");
            setIsSecureVaultActive(true);
          }}
          className={`w-full px-4 py-2.5 rounded-xl flex items-center justify-between transition-all ${
            activeTab === "drive" && isSecureVaultActive
              ? "bg-teal-600 text-white font-medium shadow-md shadow-teal-500/10"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-3">
            <Lock className="w-4 h-4" />
            <span>Secure Vault (E2EE)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-teal-400" />
          </div>
        </button>

        <button
          onClick={() => setActiveTab("queue")}
          className={`w-full px-4 py-2.5 rounded-xl flex items-center justify-between transition-all ${
            activeTab === "queue"
              ? "bg-blue-600 text-white font-medium shadow-md"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-3">
            <Activity className="w-4 h-4" />
            <span>Antrean Sesi</span>
          </div>
          {transfers.filter((t) => t.status === "running").length > 0 && (
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`w-full px-4 py-2.5 rounded-xl flex items-center justify-between transition-all ${
            activeTab === "settings"
              ? "bg-blue-600 text-white font-medium shadow-md shadow-blue-500/10"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4" />
            <span>Pengaturan Sesi</span>
          </div>
        </button>
      </div>

      <div className="p-4 border-t border-[#1F2937]/50">
        <div className="flex items-center justify-between text-xs mb-2 text-gray-400 font-medium">
          <span>Sesi Transfer</span>
          <span>
            {transfers.filter((t) => t.status === "running").length} Aktif
          </span>
        </div>
        <div className="flex gap-2">
          <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center text-[10px] font-bold text-blue-400">
            {transfers.length > 0 ? transfers[0].progress + "%" : "0%"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-[11px] font-semibold truncate text-gray-300">
              {transfers.length > 0
                ? transfers[0].fileName
                : "Tidak ada transfer"}
            </p>
            <span className="text-[9px] text-gray-500 block">
              {transfers.length > 0 ? transfers[0].speed : "Idle"}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[#1F2937]/30 flex items-center justify-between">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-gray-500/20 text-gray-400 hover:text-white"
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        <button
          onClick={logout}
          className="px-3 py-1.5 rounded-xl border border-rose-500/20 text-rose-400 hover:text-white hover:bg-rose-600 transition-all text-xs font-semibold flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>
    </div>
  );
}
