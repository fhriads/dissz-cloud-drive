import React, { createContext, useState, useEffect } from "react";
import type { QueueContextType, TransferItem } from "../types";
import { tauriBridge } from "../services/tauriBridge";
import { events, ProgressEventPayload } from "../services/events";

export const QueueContext = createContext<QueueContextType | undefined>(undefined);

export function QueueProvider({ children }: { children: React.ReactNode }) {
  const [transfers, setTransfers] = useState<TransferItem[]>([]);

  useEffect(() => {
    let unlistenUpload: (() => void) | null = null;
    let unlistenDownload: (() => void) | null = null;

    const setupListeners = async () => {
      unlistenUpload = await events.onUploadProgress((payload: ProgressEventPayload) => {
        updateTransferProgress(payload, "upload");
      });

      unlistenDownload = await events.onDownloadProgress((payload: ProgressEventPayload) => {
        updateTransferProgress(payload, "download");
      });
    };

    setupListeners();

    return () => {
      if (unlistenUpload) unlistenUpload();
      if (unlistenDownload) unlistenDownload();
    };
  }, []);

  const updateTransferProgress = (payload: ProgressEventPayload, type: "upload" | "download") => {
    setTransfers((prev) => {
      const exists = prev.some((t) => t.id === payload.id);
      const speedMb = (payload.speed_bytes_per_sec / (1024 * 1024)).toFixed(1) + " MB/s";

      if (!exists) {
        const newTransfer: TransferItem = {
          id: payload.id,
          fileName: "Mempersiapkan Berkas...",
          size: payload.total_bytes,
          progress: payload.percent,
          speed: speedMb,
          type,
          status: payload.percent >= 100 ? "completed" : "running",
          isSplit: payload.total_bytes > 2000000000,
        };
        return [newTransfer, ...prev];
      }

      return prev.map((t) => {
        if (t.id === payload.id) {
          const isCompleted = payload.percent >= 100;
          return {
            ...t,
            progress: payload.percent,
            speed: isCompleted ? "0 MB/s" : speedMb,
            status: isCompleted ? "completed" : "running",
          };
        }
        return t;
      });
    });
  };

  const addTransfer = async (
    fileName: string,
    size: number,
    type: "upload" | "download",
    isSplit: boolean,
    filePath?: string,
    telegramMessageId?: number,
    savePath?: string,
    folderId?: string | null,
    isEncrypted?: boolean,
  ) => {
    const generatedId = "t_" + Math.random().toString(36).substr(2, 9);
    
    const newTransfer: TransferItem = {
      id: generatedId,
      fileName,
      size,
      progress: 0,
      speed: "0.0 MB/s",
      type,
      status: "running",
      isSplit,
      telegramMessageId,
      savePath,
    };

    setTransfers((prev) => [newTransfer, ...prev]);

    if (type === "upload" && filePath) {
      try {
        await tauriBridge.uploadFile(filePath, generatedId, folderId, isEncrypted);
      } catch (err) {
        console.error("Gagal menginisiasi unggahan berkas ke Rust:", err);
        setTransfers((prev) => prev.map((t) => t.id === generatedId ? { ...t, status: "failed" } : t));
      }
    }

    if (type === "download" && telegramMessageId) {
      try {
        let finalSavePath = savePath;
        if (!finalSavePath) {
          try {
            const { save } = await import("@tauri-apps/plugin-dialog");
            const chosen = await save({
              defaultPath: fileName,
              title: "Simpan file ke...",
            });
            if (!chosen) {
              setTransfers((prev) => prev.filter((t) => t.id !== generatedId));
              return;
            }
            finalSavePath = typeof chosen === "string" ? chosen : (chosen as any).path || "";
          } catch {
            finalSavePath = fileName;
          }
        }

        await tauriBridge.downloadFile(fileName, telegramMessageId, generatedId, finalSavePath || fileName);
      } catch (err) {
        console.error("Gagal menginisiasi unduhan berkas dari Rust:", err);
        setTransfers((prev) => prev.map((t) => t.id === generatedId ? { ...t, status: "failed" } : t));
      }
    }
  };

  const pauseTransfer = async (id: string) => {
    setTransfers((prev) => prev.map((t) => t.id === id ? { ...t, status: "paused" } : t));
  };

  const resumeTransfer = async (id: string) => {
    setTransfers((prev) => prev.map((t) => t.id === id ? { ...t, status: "running" } : t));
  };

  const cancelTransfer = async (id: string) => {
    setTransfers((prev) => prev.filter((t) => t.id !== id));
  };

  const clearCompleted = () => {
    setTransfers((prev) => prev.filter((t) => t.status !== "completed"));
  };

  return (
    <QueueContext.Provider value={{ transfers, addTransfer, pauseTransfer, resumeTransfer, cancelTransfer, clearCompleted }}>
      {children}
    </QueueContext.Provider>
  );
}