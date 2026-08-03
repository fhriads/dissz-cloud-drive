import { listen, UnlistenFn } from "@tauri-apps/api/event";

export interface ProgressEventPayload {
  id: string;
  percent: number;
  uploaded_bytes: number;
  total_bytes: number;
  speed_bytes_per_sec: number;
}

export const events = {
  async onUploadProgress(callback: (payload: ProgressEventPayload) => void): Promise<UnlistenFn> {
    return await listen<ProgressEventPayload>("upload-progress", (event) => {
      callback(event.payload);
    });
  },

  async onDownloadProgress(callback: (payload: ProgressEventPayload) => void): Promise<UnlistenFn> {
    return await listen<ProgressEventPayload>("download-progress", (event) => {
      callback(event.payload);
    });
  },
};
