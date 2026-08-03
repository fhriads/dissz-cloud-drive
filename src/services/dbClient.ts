import { tauriBridge, FolderData, FileData } from "./tauriBridge";

export const dbClient = {
  async fetchFolders(isVault: boolean): Promise<FolderData[]> {
    return await tauriBridge.getFolders(isVault);
  },

  async fetchFiles(parentId: string | null): Promise<FileData[]> {
    return await tauriBridge.getFiles(parentId);
  },

  async createFolder(id: string, name: string, parentId: string | null, createdAt: string, isEncrypted: boolean): Promise<void> {
    return await tauriBridge.createFolder(id, name, parentId, createdAt, isEncrypted);
  },

  async createFileRecord(id: string, name: string, parentId: string | null, createdAt: string, isEncrypted: boolean): Promise<void> {
    return await tauriBridge.createFileRecord(id, name, parentId, createdAt, isEncrypted);
  },

  async deleteFile(fileId: string): Promise<void> {
    return await tauriBridge.deleteFileRecord(fileId);
  },

  async deleteFolder(folderId: string): Promise<void> {
    return await tauriBridge.deleteFolderRecord(folderId);
  },
};
