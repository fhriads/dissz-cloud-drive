import { useState, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import Sidebar from "../components/layout/Sidebar";
import TopBar from "../components/layout/TopBar";
import FileExplorer from "../components/features/drive/FileExplorer";
import QueueWidget from "../components/features/drive/QueueWidget";
import SettingsTab from "../components/features/settings/SettingsTab";

export default function DesktopDashboard() {
  const { isDarkMode } = useContext(ThemeContext)!;
  const [activeTab, setActiveTab] = useState<"drive" | "queue" | "settings">(
    "drive"
  );

  return (
    <div className="min-h-screen flex text-sm transition-all duration-300">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div
        className={`flex-1 flex flex-col min-w-0 ${
          isDarkMode ? "bg-[#0B0F19]" : "bg-white"
        }`}
      >
        <TopBar />

        {activeTab === "drive" && (
          <FileExplorer setActiveTab={setActiveTab} />
        )}

        {activeTab === "queue" && <QueueWidget />}

        {activeTab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}
