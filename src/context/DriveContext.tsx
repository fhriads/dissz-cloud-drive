import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import type { DriveContextType, FileItem } from "../types";
import { AuthContext } from "./AuthContext";
import { dbClient } from "../services/dbClient";

export const DriveContext = createContext<DriveContextType | undefined>(undefined);

export function DriveProvider({ children }: { children: React.ReactNode }) {
  const auth = useContext(AuthContext);
  
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentFolderId, setCurrentFolderIdRaw] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSecureVaultActive, setIsSecureVaultActive] = useState<boolean>(false);
  const [activeFileForDetail, setActiveFileForDetail] = useState<FileItem | null>(null);
  
  const [isVaultUnlocked, setIsVaultUnlocked] = useState<boolean>(false);
  const [vaultPasswordSet, setVaultPasswordSetState] = useState<boolean>(
    !!localStorage.getItem("vault_password")
  );

  useEffect(() => {
    if (auth?.isLoggedIn) {
      fetchDataFromLocalDatabase();
    } else {
      setFiles([]);
    }
  }, [currentFolderId, isSecureVaultActive, auth?.isLoggedIn]);

  const fetchDataFromLocalDatabase = useCallback(async () => {
    try {
      console.log("Memuat data folder dan file dari SQLite lokal...");
      
      const dbFolders = await dbClient.fetchFolders(isSecureVaultActive);
      const dbFiles = await dbClient.fetchFiles(currentFolderId);

      const filteredFolders = dbFolders.filter(f => {
        if (currentFolderId === null) return f.parent_id === null || f.parent_id === undefined;
        return f.parent_id === currentFolderId;
      });

      const mappedFolders: FileItem[] = filteredFolders.map(f => ({
        id: f.id,
        name: f.name,
        size: 0,
        type: "folder" as const,
        isEncrypted: f.is_encrypted,
        isSplit: false,
        createdAt: f.created_at,
        parentId: f.parent_id ?? null
      }));

      const mappedFiles: FileItem[] = dbFiles.map(f => ({
        id: f.id,
        name: f.name,
        size: f.size ?? 0,
        type: (f.file_type ?? "document") as FileItem["type"],
        isEncrypted: f.is_encrypted,
        isSplit: f.is_split ?? false,
        splitParts: undefined,
        telegramMessageId: f.telegram_message_id ?? undefined,
        createdAt: f.created_at,
        shareToken: undefined,
        parentId: f.parent_id ?? null
      }));

      setFiles([...mappedFolders, ...mappedFiles]);
    } catch (err) {
      console.error("Gagal melakukan penarikan data dari SQLite:", err);
    }
  }, [currentFolderId, isSecureVaultActive]);

  const navigateToFolder = (folderId: string | null, folderName?: string) => {
    if (folderId === null) {
      setCurrentFolderIdRaw(null);
      setFolderPath([]);
    } else {
      setFolderPath(prev => [...prev, { id: folderId, name: folderName || "Folder" }]);
      setCurrentFolderIdRaw(folderId);
    }
    setActiveFileForDetail(null);
  };

  const navigateToBreadcrumb = (index: number) => {
    if (index < 0) {
      setCurrentFolderIdRaw(null);
      setFolderPath([]);
    } else {
      const targetCrumb = folderPath[index];
      setFolderPath(prev => prev.slice(0, index + 1));
      setCurrentFolderIdRaw(targetCrumb.id);
    }
    setActiveFileForDetail(null);
  };

  const createFolder = async (name: string) => {
    try {
      console.log("Mengirim sinyal pembentukan folder virtual ke backend Rust...");
      const id = crypto.randomUUID();
      const created_at = new Date().toISOString();
      await dbClient.createFolder(id, name, currentFolderId, created_at, isSecureVaultActive);
      
      await fetchDataFromLocalDatabase();
    } catch (err: any) {
      alert(`Gagal membuat folder baru: ${err}`);
    }
  };

  const deleteFile = async (id: string) => {
    try {
      const fileToDelete = files.find(f => f.id === id);
      if (fileToDelete?.type === "folder") {
        console.log(`Menghapus folder ID: ${id}`);
        await dbClient.deleteFolder(id);
      } else {
        console.log(`Menghapus indeks berkas ID: ${id}`);
        await dbClient.deleteFile(id);
      }
      
      if (activeFileForDetail?.id === id) {
        setActiveFileForDetail(null);
      }
      
      await fetchDataFromLocalDatabase();
    } catch (err: any) {
      alert(`Gagal menghapus: ${err}`);
    }
  };

  const addMockUploadedFile = (_name: string, _size: number, _encrypt: boolean) => {
    fetchDataFromLocalDatabase();
  };

  const unlockVault = (password: string): boolean => {
    const savedPassword = localStorage.getItem("vault_password");
    if (savedPassword && password === savedPassword) {
      setIsVaultUnlocked(true);
      return true;
    }
    return false;
  };

  const lockVault = () => {
    setIsVaultUnlocked(false);
  };

  const setVaultPassword = (password: string) => {
    localStorage.setItem("vault_password", password);
    setVaultPasswordSetState(true);
  };

  return (
    <DriveContext.Provider
      value={{
        files,
        currentFolderId,
        folderPath,
        navigateToFolder,
        navigateToBreadcrumb,
        searchQuery,
        setSearchQuery,
        isVaultUnlocked,
        unlockVault,
        lockVault,
        vaultPasswordSet,
        setVaultPassword,
        isSecureVaultActive,
        setIsSecureVaultActive: (active: boolean) => {
          setCurrentFolderIdRaw(null);
          setFolderPath([]);
          setIsSecureVaultActive(active);
        },
        createFolder,
        deleteFile,
        addMockUploadedFile,
        activeFileForDetail,
        setActiveFileForDetail,
        refreshFiles: fetchDataFromLocalDatabase,
      }}
    >
      {children}
    </DriveContext.Provider>
  );
}