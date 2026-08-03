import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { DriveProvider } from "./context/DriveContext";
import { QueueProvider } from "./context/QueueContext";
import DashboardContainer from "./components/layout/DashboardContainer";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DriveProvider>
          <QueueProvider>
            <DashboardContainer />
          </QueueProvider>
        </DriveProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
