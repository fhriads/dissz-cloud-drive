import { useContext } from "react";
import { X } from "lucide-react";
import { ThemeContext } from "../../../context/ThemeContext";
import { DriveContext } from "../../../context/DriveContext";
import { QueueContext } from "../../../context/QueueContext";
import FileTypeIcon from "../../common/FileTypeIcon";
import { formatBytes } from "../../../utils/formatBytes";

interface DetailDrawerProps {
  setActiveTab: (tab: "drive" | "vault" | "queue" | "settings") => void;
}

export default function DetailDrawer({ setActiveTab }: DetailDrawerProps) {
  const { isDarkMode } = useContext(ThemeContext)!;
  const { activeFileForDetail, setActiveFileForDetail, deleteFile } =
    useContext(DriveContext)!;
  const { addTransfer } = useContext(QueueContext)!;

  if (!activeFileForDetail) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end justify-center z-50">
      <div
        className="absolute inset-0"
        onClick={() => setActiveFileForDetail(null)}
      ></div>

      <div
        className={`w-full max-w-md p-6 rounded-t-3xl border-t relative z-10 transition-all duration-300 animate-slide-up ${
          isDarkMode
            ? "bg-[#111827] border-[#1F2937] text-white"
            : "bg-white border-[#E5E7EB] text-gray-800"
        }`}
      >
        <div className="w-12 h-1 bg-gray-600/50 rounded-full mx-auto mb-4"></div>

        <div className="flex items-center justify-between border-b border-[#1F2937]/30 pb-4 mb-4">
          <h3 className="font-bold text-sm">Informasi File</h3>
          <button
            onClick={() => setActiveFileForDetail(null)}
            className="p-1 text-gray-500 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 p-3 bg-black/10 rounded-xl mb-4 overflow-hidden">
          <FileTypeIcon type={activeFileForDetail.type} />
          <div className="overflow-hidden">
            <h4 className="font-bold text-xs truncate pr-4">
              {activeFileForDetail.name}
            </h4>
            <span className="text-[9px] text-gray-500 font-mono block uppercase mt-0.5">
              {activeFileForDetail.type}
            </span>
          </div>
        </div>

        <div className="space-y-3 mb-6 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Ukuran</span>
            <span className="font-mono font-bold">
              {formatBytes(activeFileForDetail.size)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Pesan ID</span>
            <span className="font-mono font-bold text-blue-500">
              #{activeFileForDetail.telegramMessageId || "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Dibuat</span>
            <span className="font-bold text-gray-400">
              {activeFileForDetail.createdAt}
            </span>
          </div>
        </div>

        {activeFileForDetail.isSplit && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-6">
            <span className="text-[10px] font-bold text-blue-400 block mb-1">
              Auto-Splitting Aktif
            </span>
            <p className="text-[10px] text-gray-400 leading-normal">
              File ini berukuran besar dan dibagi menjadi{" "}
              {activeFileForDetail.splitParts} partisi di Cloud Telegram.
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              deleteFile(activeFileForDetail.id);
              setActiveFileForDetail(null);
            }}
            className="py-3 rounded-xl border border-rose-500/20 text-rose-400 font-bold text-xs"
          >
            Hapus
          </button>
          <button
            onClick={() => {
              addTransfer(
                activeFileForDetail.name,
                activeFileForDetail.size,
                "download",
                activeFileForDetail.isSplit
              );
              setActiveFileForDetail(null);
              setActiveTab("queue");
            }}
            className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
          >
            Unduh File
          </button>
        </div>
      </div>
    </div>
  );
}
