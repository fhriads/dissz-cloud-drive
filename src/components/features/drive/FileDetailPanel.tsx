import { useContext, useEffect, useState } from "react";
import { File, X, Layers, Loader2, Play } from "lucide-react";
import { ThemeContext } from "../../../context/ThemeContext";
import { DriveContext } from "../../../context/DriveContext";
import { QueueContext } from "../../../context/QueueContext";
import FileTypeIcon from "../../common/FileTypeIcon";
import { formatBytes } from "../../../utils/formatBytes";
import { tauriBridge } from "../../../services/tauriBridge";

interface FileDetailPanelProps {
  setActiveTab: (tab: "drive" | "queue" | "settings") => void;
}

export default function FileDetailPanel({
  setActiveTab,
}: FileDetailPanelProps) {
  const { isDarkMode } = useContext(ThemeContext)!;
  const { activeFileForDetail, setActiveFileForDetail } =
    useContext(DriveContext)!;
  const { addTransfer } = useContext(QueueContext)!;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setPreviewError(null);

    if (
      activeFileForDetail?.type === "image" &&
      activeFileForDetail.telegramMessageId
    ) {
      loadImagePreview(
        activeFileForDetail.telegramMessageId,
        activeFileForDetail.name
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFileForDetail?.id]);

  const loadImagePreview = async (msgId: number, fileName: string) => {
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const localPath = await tauriBridge.previewFile(msgId, fileName);

      const { readFile } = await import("@tauri-apps/plugin-fs");
      const bytes = await readFile(localPath);
      const ext = fileName.split(".").pop()?.toLowerCase() ?? "jpg";
      const mime =
        ext === "png"
          ? "image/png"
          : ext === "gif"
          ? "image/gif"
          : ext === "webp"
          ? "image/webp"
          : "image/jpeg";
      const blob = new Blob([bytes], { type: mime });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err: any) {
      console.error("Gagal memuat pratinjau gambar:", err);
      setPreviewError("Pratinjau tidak tersedia");
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div
      className={`w-80 border rounded-2xl p-6 flex flex-col transition-all duration-300 ${
        isDarkMode
          ? "bg-[#111827]/20 border-[#1F2937]/80"
          : "bg-[#F9F9F9] border-[#E5E7EB]"
      }`}
    >
      {activeFileForDetail ? (
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#1F2937]/50 pb-4 mb-4">
              <h3 className="font-bold">Detail Berkas</h3>
              <button
                onClick={() => setActiveFileForDetail(null)}
                className="text-gray-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col items-center justify-center border-b border-[#1F2937]/30 mb-6 bg-black/10 rounded-xl overflow-hidden">
              {activeFileForDetail.type === "image" ? (
                previewLoading ? (
                  <div className="py-8 flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
                    <span className="text-[10px] text-gray-500">Memuat pratinjau...</span>
                  </div>
                ) : previewUrl ? (
                  <div className="w-full relative group">
                    <img
                      src={previewUrl}
                      alt={activeFileForDetail.name}
                      className="w-full max-h-52 object-contain rounded-xl"
                      onError={() => {
                        setPreviewError("Gagal menampilkan gambar");
                        setPreviewUrl(null);
                      }}
                    />
                    <button
                      onClick={() => (window as any).__setMediaPreview?.(activeFileForDetail)}
                      className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/40 transition-all rounded-xl opacity-0 group-hover:opacity-100"
                      title="Buka pratinjau penuh"
                    >
                      <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Play className="w-5 h-5 text-white" />
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="py-6 flex flex-col items-center gap-2">
                    <FileTypeIcon type={activeFileForDetail.type} />
                    {previewError && (
                      <span className="text-[10px] text-gray-500">{previewError}</span>
                    )}
                  </div>
                )
              ) : (
                <div className="py-6">
                  <FileTypeIcon type={activeFileForDetail.type} />
                </div>
              )}
              <div className="pb-4 px-4 text-center">
                <h4 className="font-bold text-center mt-2 text-sm px-4 truncate w-full">
                  {activeFileForDetail.name}
                </h4>
                <span className="text-[10px] text-gray-500 mt-1 uppercase font-mono font-bold">
                  {activeFileForDetail.type}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-600/10 pb-2">
                <span className="text-gray-500 text-xs">Ukuran Berkas</span>
                <span className="font-mono font-semibold">
                  {formatBytes(activeFileForDetail.size)}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-600/10 pb-2">
                <span className="text-gray-500 text-xs">Diunggah Pada</span>
                <span className="text-gray-300 font-medium">
                  {activeFileForDetail.createdAt}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-600/10 pb-2">
                <span className="text-gray-500 text-xs">
                  ID Pesan Telegram
                </span>
                <span className="font-mono text-blue-400 font-semibold">
                  #{activeFileForDetail.telegramMessageId || "-"}
                </span>
              </div>
            </div>

            {activeFileForDetail.isSplit && (
              <div className="bg-[#1F2937]/40 border border-[#1F2937] p-3 rounded-xl mt-6">
                <div className="flex items-center gap-2 mb-2 text-blue-400">
                  <Layers className="w-4 h-4" />
                  <h4 className="text-xs font-bold">
                    Auto-Splitting Aktif (&gt; 2GB)
                  </h4>
                </div>
                <p className="text-[11px] text-gray-400 leading-normal">
                  File ini diunggah dalam {activeFileForDetail.splitParts}{" "}
                  partisi di server Telegram. Penggabungan otomatis akan
                  dieksekusi saat proses download.
                </p>
                <div className="grid grid-cols-3 gap-1 mt-3">
                  {Array.from({
                    length: activeFileForDetail.splitParts || 1,
                  }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-blue-600 text-white rounded-lg p-1.5 text-center text-[10px] font-bold"
                    >
                      Part {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 mt-6">
            {activeFileForDetail.type !== "folder" &&
              activeFileForDetail.telegramMessageId && (
                <button
                  onClick={() =>
                    (window as any).__setMediaPreview?.(activeFileForDetail)
                  }
                  className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl text-xs transition-all"
                >
                  {activeFileForDetail.type === "image"
                    ? "🖼 Buka Pratinjau"
                    : activeFileForDetail.type === "video"
                    ? "▶ Putar Video"
                    : activeFileForDetail.type === "audio"
                    ? "🎵 Putar Audio"
                    : activeFileForDetail.type === "document"
                    ? "📄 Buka Dokumen"
                    : "🔍 Pratinjau"}
                </button>
              )}

            {activeFileForDetail.type !== "folder" && (
              <button
                onClick={() => {
                  if (!activeFileForDetail.telegramMessageId) {
                    alert(
                      "File ini tidak memiliki ID pesan Telegram yang valid. Tidak dapat diunduh."
                    );
                    return;
                  }
                  addTransfer(
                    activeFileForDetail.name,
                    activeFileForDetail.size,
                    "download",
                    activeFileForDetail.isSplit,
                    undefined,
                    activeFileForDetail.telegramMessageId
                  );
                  setActiveTab("queue");
                }}
                disabled={!activeFileForDetail.telegramMessageId}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-xs transition-all shadow-md"
              >
                {activeFileForDetail.telegramMessageId
                  ? "Unduh File"
                  : "Tidak Dapat Diunduh"}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <File className="w-10 h-10 text-gray-500 mb-2" />
          <h4 className="font-semibold text-gray-400">
            Tidak ada berkas terpilih
          </h4>
          <p className="text-[11px] text-gray-500 mt-1 max-w-xs leading-normal">
            Klik salah satu baris file pada tabel di samping untuk melihat info
            detail dan opsi transfer.
          </p>
        </div>
      )}
    </div>
  );
}
