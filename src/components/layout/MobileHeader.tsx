import { useContext } from "react";
import { Cpu, Sun, Moon } from "lucide-react";
import { ThemeContext } from "../../context/ThemeContext";

export default function MobileHeader() {
  const { toggleTheme, isDarkMode } = useContext(ThemeContext)!;
  const ping = 28;

  return (
    <div
      className={`h-14 px-6 border-b flex items-center justify-between sticky top-0 z-30 backdrop-blur-md ${
        isDarkMode
          ? "bg-[#0B0F19]/90 border-[#1F2937]"
          : "bg-white/95 border-[#E5E7EB]"
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-blue-600 rounded-lg text-white">
          <Cpu className="w-4 h-4" />
        </div>
        <span className="font-bold tracking-tight text-sm">Dissz Drive</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] text-gray-500 font-mono">{ping}ms</span>
        </div>

        <button
          onClick={toggleTheme}
          className="p-1 text-gray-400 hover:text-white"
        >
          {isDarkMode ? (
            <Sun className="w-4.5 h-4.5" />
          ) : (
            <Moon className="w-4.5 h-4.5" />
          )}
        </button>
      </div>
    </div>
  );
}
