export * from "./auth";
export * from "./file";
export * from "./telegram";
export * from "./tauri";

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export interface DriveContextType {
  files: import("./file").FileItem[];
  currentFolderId: string | null;
  folderPath: { id: string; name: string }[];
  navigateToFolder: (folderId: string | null, folderName?: string) => void;
  navigateToBreadcrumb: (index: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isVaultUnlocked: boolean;
  unlockVault: (password: string) => boolean;
  lockVault: () => void;
  vaultPasswordSet: boolean;
  setVaultPassword: (password: string) => void;
  isSecureVaultActive: boolean;
  setIsSecureVaultActive: (active: boolean) => void;
  createFolder: (name: string) => void;
  deleteFile: (id: string) => void;
  addMockUploadedFile: (name: string, size: number, encrypt: boolean) => void;
  activeFileForDetail: import("./file").FileItem | null;
  setActiveFileForDetail: (file: import("./file").FileItem | null) => void;
  refreshFiles: () => void;
}

export interface QueueContextType {
  transfers: import("./file").TransferItem[];
  addTransfer: (
    fileName: string,
    size: number,
    type: "upload" | "download",
    isSplit: boolean,
    filePath?: string,
    telegramMessageId?: number,
    savePath?: string,
    folderId?: string | null,
    isEncrypted?: boolean,
  ) => void;
  pauseTransfer: (id: string) => void;
  resumeTransfer: (id: string) => void;
  cancelTransfer: (id: string) => void;
  clearCompleted: () => void;
}
