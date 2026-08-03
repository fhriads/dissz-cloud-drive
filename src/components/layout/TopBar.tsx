import { useContext, useState, useEffect } from "react";
import { Search, Wifi, Shield, HardDrive } from "lucide-react";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import { DriveContext } from "../../context/DriveContext";

export default function TopBar() {
  const { isDarkMode } = useContext(ThemeContext)!;
  const { telegramUser } = useContext(AuthContext)!;
  const { searchQuery, setSearchQuery } = useContext(DriveContext)!;

  const [ping, setPing] = useState(24);
  const [vpnOptimized, setVpnOptimized] = useState(true);

  useEffect(() => {
    const pingTimer = setInterval(() => {
      setPing((prev) => {
        const offset = Math.floor(Math.random() * 5) - 2;
        return Math.max(15, prev + offset);
      });
    }, 3000);
    return () => clearInterval(pingTimer);
  }, []);

  return (
    <div
      className={`h-16 border-b px-8 flex items-center justify-between ${
        isDarkMode ? "border-[#1F2937]" : "border-[#E5E7EB]"
      }`}
    >
      <div className="relative w-80">
        <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-500" />
        <input
          type="text"
          placeholder="Cari file Anda disini..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full pl-10 pr-4 py-1.5 rounded-xl focus:outline-none transition-all text-xs border ${
            isDarkMode
              ? "bg-[#090D16] border-[#1F2937] text-white focus:border-blue-500"
              : "bg-[#F9F9F9] border-[#E5E7EB] text-gray-800 focus:border-blue-500"
          }`}
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Wifi
            className={`w-4 h-4 ${
              ping < 30 ? "text-emerald-500" : "text-amber-500"
            }`}
          />
          <div className="text-right">
            <span className="text-[10px] text-gray-500 block leading-none">
              Datacenter {telegramUser?.dc}
            </span>
            <span className="text-[11px] font-semibold text-gray-300 font-mono leading-none">
              {ping} ms
            </span>
          </div>
        </div>

        <button
          onClick={() => setVpnOptimized(!vpnOptimized)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
            vpnOptimized
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          {vpnOptimized ? "VPN Dioptimalkan" : "VPN Standard"}
        </button>

        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-blue-500" />
          <div className="text-right">
            <span className="text-[10px] text-gray-500 block">Storage</span>
            <span className="text-[11px] font-bold text-gray-300">
              UNLIMITED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
