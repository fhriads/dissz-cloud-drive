import { useState, useEffect, useContext } from "react";
import { File, Layers, X, Loader2, Volume2 } from "lucide-react";
import { QueueContext } from "../../../context/QueueContext";
import type { FileItem } from "../../../types";
import { tauriBridge } from "../../../services/tauriBridge";

interface MediaPreviewModalProps {
  setActiveTab: (tab: "drive" | "queue" | "settings") => void;
}

export default function MediaPreviewModal({
  setActiveTab,
}: MediaPreviewModalProps) {
  const { addTransfer } = useContext(QueueContext)!;
  const [activeMediaPreview, setActiveMediaPreview] =
    useState<FileItem | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    (window as any).__setMediaPreview = setActiveMediaPreview;
    return () => {
      delete (window as any).__setMediaPreview;
    };
  }, []);

  useEffect(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setPreviewError(null);

    if (!activeMediaPreview) return;

    if (!activeMediaPreview.telegramMessageId) {
      setPreviewError("Berkas tidak memiliki ID pesan Telegram yang valid. Tidak dapat di-preview.");
      return;
    }

    loadMedia(activeMediaPreview.telegramMessageId, activeMediaPreview.name, activeMediaPreview.type);

    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMediaPreview?.id]);

  const loadMedia = async (msgId: number, fileName: string, fileType: string) => {
    setPreviewLoading(true);
    setPreviewError(null);
    try {
      const localPath = await tauriBridge.previewFile(msgId, fileName);

      const { readFile } = await import("@tauri-apps/plugin-fs");
      const bytes = await readFile(localPath);

      const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
      let mime = "";

      if (fileType === "image") {
        mime = ext === "png" ? "image/png" : ext === "gif" ? "image/gif" : ext === "webp" ? "image/webp" : ext === "svg" ? "image/svg+xml" : "image/jpeg";
      } else if (fileType === "video") {
        mime = ext === "webm" ? "video/webm" : ext === "mov" ? "video/quicktime" : ext === "mkv" ? "video/x-matroska" : "video/mp4";
      } else if (fileType === "audio") {
        mime = ext === "wav" ? "audio/wav" : ext === "ogg" ? "audio/ogg" : ext === "flac" ? "audio/flac" : ext === "m4a" ? "audio/mp4" : "audio/mpeg";
      } else if (fileType === "document") {
        if (ext === "pdf") {
          mime = "application/pdf";
        } else if (ext === "txt") {
          mime = "text/plain";
        } else {
          setPreviewError(`Format dokumen ini (.${ext}) tidak mendukung pratinjau langsung. Silakan download untuk membuka.`);
          setPreviewLoading(false);
          return;
        }
      } else {
        mime = "application/octet-stream";
      }

      const blob = new Blob([bytes], { type: mime });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err: any) {
      console.error("Gagal memuat pratinjau media:", err);
      setPreviewError("Gagal mengunduh atau membaca file dari Telegram.");
    } finally {
      setPreviewLoading(false);
    }
  };

  if (!activeMediaPreview) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-3xl bg-[#111827] border border-[#1F2937] rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-[#1F2937]/50 flex items-center justify-between">
          <div className="overflow-hidden pr-6">
            <h3 className="font-bold text-sm truncate">
              {activeMediaPreview.name}
            </h3>
            <span className="text-[10px] text-gray-500 block uppercase font-mono mt-0.5">
              {activeMediaPreview.type}
            </span>
          </div>
          <button
            onClick={() => setActiveMediaPreview(null)}
            className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-[#090D16] h-[28rem] flex items-center justify-center relative p-4">
          {previewLoading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-400">Mengunduh dan memproses berkas...</p>
            </div>
          ) : previewError ? (
            <div className="flex flex-col items-center gap-2 text-center max-w-md px-6">
              <File className="w-12 h-12 text-rose-500/80 mb-2" />
              <p className="text-sm font-semibold text-rose-400">{previewError}</p>
              <p className="text-xs text-gray-500 mt-1">
                Anda masih dapat mengunduh berkas ini secara langsung menggunakan tombol di bawah.
              </p>
            </div>
          ) : previewUrl ? (
            activeMediaPreview.type === "image" ? (
              <img
                src={previewUrl}
                alt={activeMediaPreview.name}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            ) : activeMediaPreview.type === "video" ? (
              <video
                src={previewUrl}
                controls
                autoPlay
                className="max-w-full max-h-full rounded-lg"
              />
            ) : activeMediaPreview.type === "audio" ? (
              <div className="w-full flex flex-col items-center justify-center p-8 bg-gray-900/30 rounded-2xl border border-gray-800 max-w-md">
                <Volume2 className="w-16 h-16 text-teal-400 mb-4 animate-pulse" />
                <p className="text-sm font-semibold text-gray-200 mb-4 truncate w-full text-center">
                  {activeMediaPreview.name}
                </p>
                <audio
                  src={previewUrl}
                  controls
                  autoPlay
                  className="w-full"
                />
              </div>
            ) : activeMediaPreview.type === "document" ? (
              <div className="w-full h-full flex flex-col">
                <iframe
                  src={previewUrl}
                  title={activeMediaPreview.name}
                  className="w-full flex-1 border-0 rounded-lg bg-white"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center">
                <Layers className="w-12 h-12 text-purple-400" />
                <p className="text-sm font-semibold">Pratinjau tidak didukung untuk tipe ini</p>
                <p className="text-xs text-gray-500">Tipe berkas: {activeMediaPreview.type}</p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center gap-2 text-center">
              <File className="w-12 h-12 text-gray-500" />
              <p className="text-sm text-gray-400">Media tidak dapat diputar langsung</p>
            </div>
          )}
        </div>

        <div className="p-4 bg-[#1F2937]/30 border-t border-[#1F2937]/50 flex justify-end gap-3">
          <button
            onClick={() => setActiveMediaPreview(null)}
            className="px-4 py-2 rounded-xl border border-[#1F2937] text-gray-400 hover:text-white text-xs font-bold"
          >
            Tutup
          </button>
          <button
            onClick={() => {
              addTransfer(
                activeMediaPreview.name,
                activeMediaPreview.size,
                "download",
                activeMediaPreview.isSplit || false,
                undefined,
                activeMediaPreview.telegramMessageId
              );
              setActiveMediaPreview(null);
              setActiveTab("queue");
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all"
          >
            Download Berkas
          </button>
        </div>
      </div>
    </div>
  );
}
