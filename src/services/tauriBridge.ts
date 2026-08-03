import { invoke } from "@tauri-apps/api/core";

export interface AuthResult {
  success: boolean;
  next_step: string | null;
  error: string | null;
}

export interface FolderData {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  is_encrypted: boolean;
}

export interface FileData {
  id: string;
  name: string;
  size: number;
  file_type: string;
  parent_id: string | null;
  created_at: string;
  is_encrypted: boolean;
  is_split: boolean;
  telegram_message_id?: number | null;
}

// ============================================================================
// TAURI IPC BRIDGE SERVICES
// ============================================================================

export const tauriBridge = {
  // Auth Commands
  async checkAutoLogin(): Promise<AuthResult> {
    return await invoke<AuthResult>("cmd_check_auto_login");
  },

  async connectTelegram(apiId: number): Promise<boolean> {
    return await invoke<boolean>("cmd_connect", { api_id: apiId });
  },

  async logoutTelegram(): Promise<boolean> {
    return await invoke<boolean>("cmd_logout");
  },

  async requestAuthCode(phone: string, apiId: number, apiHash: string): Promise<string> {
    return await invoke<string>("cmd_auth_request_code", { phone, api_id: apiId, api_hash: apiHash });
  },

  async signIn(code: string): Promise<AuthResult> {
    return await invoke<AuthResult>("cmd_auth_sign_in", { code });
  },

  async checkPassword(password: string): Promise<AuthResult> {
    return await invoke<AuthResult>("cmd_auth_check_password", { password });
  },

  async qrLogin(apiId: number, apiHash: string): Promise<string> {
    return await invoke<string>("cmd_auth_qr_login", { api_id: apiId, api_hash: apiHash });
  },

  async qrPoll(): Promise<AuthResult> {
    return await invoke<AuthResult>("cmd_auth_qr_poll");
  },

  // Database & File Operations
  async createFolder(id: string, name: string, parentId: string | null, createdAt: string, isEncrypted: boolean): Promise<void> {
    return await invoke("cmd_create_folder", {
      id,
      name,
      parent_id: parentId,
      created_at: createdAt,
      is_encrypted: isEncrypted,
    });
  },

  async createFileRecord(id: string, name: string, parentId: string | null, createdAt: string, isEncrypted: boolean): Promise<void> {
    return await invoke("cmd_create_file_record", {
      id,
      name,
      parent_id: parentId,
      created_at: createdAt,
      is_encrypted: isEncrypted,
    });
  },

  async getFolders(isVault: boolean): Promise<FolderData[]> {
    return await invoke<FolderData[]>("cmd_get_folders", { is_vault: isVault });
  },

  async getFiles(parentId: string | null): Promise<FileData[]> {
    return await invoke<FileData[]>("cmd_get_files", { parent_id: parentId });
  },

  async deleteFileRecord(fileId: string): Promise<void> {
    return await invoke("cmd_delete_file_record", { file_id: fileId });
  },

  async deleteFolderRecord(folderId: string): Promise<void> {
    return await invoke("cmd_delete_folder_record", { folder_id: folderId });
  },

  async previewFile(telegramMessageId: number, fileName: string): Promise<string> {
    return await invoke<string>("cmd_preview_file", {
      telegram_message_id: telegramMessageId,
      file_name: fileName,
    });
  },

  async uploadFile(filePath: string, transferId: string, folderId?: string | null, isEncrypted?: boolean): Promise<void> {
    return await invoke("cmd_upload_file", {
      file_path: filePath,
      transfer_id: transferId,
      folder_id: folderId ?? null,
      is_encrypted: isEncrypted ?? false,
    });
  },

  async downloadFile(fileName: string, telegramMessageId: number, transferId: string, savePath: string): Promise<void> {
    return await invoke("cmd_download_file", {
      file_name: fileName,
      telegram_message_id: telegramMessageId,
      transfer_id: transferId,
      save_path: savePath,
    });
  },
};
