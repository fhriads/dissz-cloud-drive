import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import AuthWizard from "../features/auth/AuthWizard";
import AppLockScreen from "../features/auth/AppLockScreen";
import DesktopDashboard from "../../views/DesktopDashboard";
import MobileDashboard from "../../views/MobileDashboard";

export default function DashboardContainer() {
  const { isLoggedIn, isLocked } = useContext(AuthContext)!;
  const [deviceWidth, setDeviceWidth] = useState(window.innerWidth);
  const [forceView, setForceView] = useState<"auto" | "desktop" | "mobile">(
    "auto"
  );

  useEffect(() => {
    const handleResize = () => setDeviceWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isLocked) {
    return <AppLockScreen />;
  }

  if (!isLoggedIn) {
    return <AuthWizard />;
  }

  const isMobile =
    forceView === "mobile" || (forceView === "auto" && deviceWidth < 768);

  return (
    <div className="relative">
      <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 bg-[#111827]/90 border border-gray-700/50 rounded-full px-3 py-1 flex items-center gap-2 text-[10px] font-bold text-gray-400 shadow-lg">
        <span>Tinjau:</span>
        <button
          onClick={() => setForceView("auto")}
          className={`px-2 py-0.5 rounded-full transition-all ${
            forceView === "auto"
              ? "bg-blue-600 text-white"
              : "hover:text-white"
          }`}
        >
          Otomatis
        </button>
        <button
          onClick={() => setForceView("desktop")}
          className={`px-2 py-0.5 rounded-full transition-all ${
            forceView === "desktop"
              ? "bg-blue-600 text-white"
              : "hover:text-white"
          }`}
        >
          Desktop
        </button>
        <button
          onClick={() => setForceView("mobile")}
          className={`px-2 py-0.5 rounded-full transition-all ${
            forceView === "mobile"
              ? "bg-blue-600 text-white"
              : "hover:text-white"
          }`}
        >
          Mobile
        </button>
      </div>

      {isMobile ? <MobileDashboard /> : <DesktopDashboard />}
    </div>
  );
}
