export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: "video" | "audio" | "image" | "document" | "archive" | "folder";
  isEncrypted: boolean;
  isSplit: boolean;
  splitParts?: number;
  telegramMessageId?: number;
  createdAt: string;
  shareToken?: string;
  parentId: string | null;
}

export interface TransferItem {
  id: string;
  fileName: string;
  size: number;
  progress: number;
  speed: string;
  type: "upload" | "download";
  status: "running" | "paused" | "completed" | "failed";
  isSplit: boolean;
  partsCount?: number;
  currentPart?: number;
  telegramMessageId?: number;
  savePath?: string;
}
