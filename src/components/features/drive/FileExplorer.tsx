import { useContext, useState, Fragment } from "react";
import { Plus, ArrowUp, Lock, Home, ChevronRight } from "lucide-react";
import { ThemeContext } from "../../../context/ThemeContext";
import { DriveContext } from "../../../context/DriveContext";
import { QueueContext } from "../../../context/QueueContext";
import { dbClient } from "../../../services/dbClient";
import FileTable from "./FileTable";
import FileDetailPanel from "./FileDetailPanel";
import MediaPreviewModal from "./MediaPreviewModal";

interface FileExplorerProps {
  setActiveTab: (tab: "drive" | "queue" | "settings") => void;
}

export default function FileExplorer({ setActiveTab }: FileExplorerProps) {
  const { isDarkMode } = useContext(ThemeContext)!;
  const {
    isVaultUnlocked,
    unlockVault,
    isSecureVaultActive,
    createFolder,
    currentFolderId,
    folderPath,
    navigateToBreadcrumb,
    navigateToFolder,
    vaultPasswordSet,
    setVaultPassword,
    refreshFiles,
  } = useContext(DriveContext)!;
  const { addTransfer } = useContext(QueueContext)!;

  const [vaultPasswordInput, setVaultPasswordInput] = useState("");
  const [vaultInputError, setVaultInputError] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [setPasswordError, setSetPasswordError] = useState("");

  const handleSetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordInput.trim()) {
      setSetPasswordError("Sandi tidak boleh kosong");
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setSetPasswordError("Konfirmasi sandi tidak cocok");
      return;
    }
    setVaultPassword(newPasswordInput);
    setNewPasswordInput("");
    setConfirmPasswordInput("");
    setSetPasswordError("");
  };

  const handleCreateFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      setNewFolderName("");
      setShowFolderModal(false);
    }
  };

  const handleVaultUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = unlockVault(vaultPasswordInput);
    if (success) {
      setVaultPasswordInput("");
      setVaultInputError(false);
    } else {
      setVaultInputError(true);
    }
  };

  const triggerFileUpload = async () => {
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const selected = await open({
        multiple: true,
        title: "Pilih file untuk diunggah",
      });
      
      if (!selected) return;
      
      const paths = Array.isArray(selected)
        ? selected
        : typeof selected === "string"
        ? [selected]
        : typeof selected === "object" && selected !== null && "path" in selected
        ? [(selected as any).path]
        : [];
        
      if (paths.length === 0) return;
      
      const { stat } = await import("@tauri-apps/plugin-fs");
      
      for (const filePath of paths) {
        if (!filePath || typeof filePath !== "string") continue;
        
        const fileName = filePath.split(/[/\\]/).pop() || "unknown";
        
        let fileSize = 0;
        try {
          const fileInfo = await stat(filePath);
          fileSize = fileInfo.size;
        } catch {
          fileSize = 0;
        }
        
        const isSplit = fileSize > 2000000000;

        addTransfer(
          fileName,
          fileSize,
          "upload",
          isSplit,
          filePath,
          undefined,
          undefined,
          currentFolderId,
          isSecureVaultActive
        );
      }

      setActiveTab("queue");
    } catch (err) {
      console.error("Gagal membuka dialog file:", err);
      alert(`Gagal membuka dialog file: ${err}`);
    }
  };

  const uploadDirectoryRecursive = async (
    dirPath: string,
    folderName: string,
    parentId: string | null
  ) => {
    const { readDir, stat } = await import("@tauri-apps/plugin-fs");
    
    const newFolderId = crypto.randomUUID();
    const created_at = new Date().toISOString();
    
    await dbClient.createFolder(
      newFolderId,
      folderName,
      parentId,
      created_at,
      isSecureVaultActive
    );
    
    try {
      const entries = await readDir(dirPath);
      
      for (const entry of entries) {
        const fullPath = `${dirPath}/${entry.name}`;
        
        if (entry.isFile) {
          let fileSize = 0;
          try {
            const fileInfo = await stat(fullPath);
            fileSize = fileInfo.size;
          } catch {
            fileSize = 0;
          }
          
          const isSplit = fileSize > 2000000000;
          
          addTransfer(
            entry.name,
            fileSize,
            "upload",
            isSplit,
            fullPath,
            undefined,
            undefined,
            newFolderId,
            isSecureVaultActive
          );
        } else if (entry.isDirectory) {
          await uploadDirectoryRecursive(fullPath, entry.name, newFolderId);
        }
      }
    } catch (readErr) {
      console.error(`Gagal membaca folder ${dirPath}:`, readErr);
    }
  };

  const triggerFolderUpload = async () => {
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Pilih folder untuk diunggah",
      });
      
      if (!selected) return;
      
      const dirPath = typeof selected === "string"
        ? selected
        : typeof selected === "object" && selected !== null && "path" in selected
        ? (selected as any).path
        : null;
        
      if (!dirPath || typeof dirPath !== "string") return;
      
      const folderName = dirPath.split(/[/\\]/).pop() || "Folder Baru";
      
      await uploadDirectoryRecursive(dirPath, folderName, currentFolderId);
      refreshFiles();
      setActiveTab("queue");
    } catch (err) {
      console.error("Gagal mengunggah folder:", err);
      alert(`Gagal mengunggah folder: ${err}`);
    }
  };

  if (isSecureVaultActive && !isVaultUnlocked) {
    if (!vaultPasswordSet) {
      return (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-sm w-full bg-[#111827]/40 border border-[#1F2937] rounded-2xl p-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold">Atur Sandi Brankas</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              Anda belum mengatur sandi untuk Brankas Rahasia (Secure Vault). Silakan atur sandi Anda terlebih dahulu untuk mengamankan data Anda.
            </p>

            <form onSubmit={handleSetPasswordSubmit} className="mt-6 space-y-3">
              <input
                type="password"
                placeholder="Buat sandi brankas baru..."
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                className="w-full px-4 py-2 bg-[#090D16] border border-[#1F2937] rounded-xl text-center font-semibold text-sm focus:outline-none focus:border-teal-500 transition-all text-white"
              />
              <input
                type="password"
                placeholder="Konfirmasi sandi brankas..."
                value={confirmPasswordInput}
                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                className="w-full px-4 py-2 bg-[#090D16] border border-[#1F2937] rounded-xl text-center font-semibold text-sm focus:outline-none focus:border-teal-500 transition-all text-white"
              />
              {setPasswordError && (
                <span className="text-[10px] text-rose-500 block font-medium animate-shake">
                  {setPasswordError}
                </span>
              )}
              <button
                type="submit"
                className="w-full py-2 bg-teal-600 hover:bg-teal-700 font-semibold text-white rounded-xl transition-all shadow-lg text-xs cursor-pointer"
              >
                Simpan Sandi
              </button>
            </form>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-sm w-full bg-[#111827]/40 border border-[#1F2937] rounded-2xl p-8 text-center shadow-lg">
          <div className="w-16 h-16 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold">Secure Vault Terkunci</h3>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Brankas rahasia dienkripsi penuh dengan standar Zero-Knowledge
            AES-256. Masukkan password Anda untuk membukanya.
          </p>

          <form onSubmit={handleVaultUnlockSubmit} className="mt-6 space-y-3">
            <input
              type="password"
              placeholder="Masukkan sandi brankas Anda..."
              value={vaultPasswordInput}
              onChange={(e) => setVaultPasswordInput(e.target.value)}
              className={`w-full px-4 py-2 bg-[#090D16] border rounded-xl text-center font-semibold text-sm focus:outline-none focus:border-teal-500 transition-all ${
                vaultInputError
                  ? "border-rose-500 animate-shake"
                  : "border-[#1F2937]"
              }`}
            />
            {vaultInputError && (
              <span className="text-[10px] text-rose-500 block font-medium">
                Sandi salah! Silakan coba lagi.
              </span>
            )}
            <button
              type="submit"
              className="w-full py-2 bg-teal-600 hover:bg-teal-700 font-semibold text-white rounded-xl transition-all shadow-lg text-xs cursor-pointer"
            >
              Buka Brankas
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto p-8 flex gap-8">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                {isSecureVaultActive ? "Secure Vault (AES-256)" : "Personal Drive"}
              </h1>
              <p className="text-xs text-gray-500 mt-1">
                Mengelola berkas yang tersimpan langsung di Cloud Telegram.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFolderModal(true)}
                className={`px-3 py-2 rounded-xl border font-semibold text-xs transition-all flex items-center gap-1.5 ${
                  isDarkMode
                    ? "bg-[#111827] border-[#1F2937] hover:bg-[#1F2937]"
                    : "bg-white border-[#E5E7EB] hover:bg-gray-100"
                }`}
              >
                <Plus className="w-4 h-4" />
                Folder Baru
              </button>

              <button
                onClick={triggerFolderUpload}
                className={`px-3 py-2 rounded-xl border font-semibold text-xs transition-all flex items-center gap-1.5 ${
                  isDarkMode
                    ? "bg-[#111827] border-[#1F2937] hover:bg-[#1F2937]"
                    : "bg-white border-[#E5E7EB] hover:bg-gray-100"
                }`}
              >
                <ArrowUp className="w-4 h-4" />
                Unggah Folder
              </button>

              <button
                onClick={triggerFileUpload}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs cursor-pointer shadow-lg shadow-blue-500/10 flex items-center gap-1.5"
              >
                <ArrowUp className="w-4 h-4" />
                Unggah File
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 mb-5 text-xs text-gray-400">
            <button
              onClick={() => navigateToFolder(null)}
              className="flex items-center gap-1 hover:text-white transition-colors font-medium"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Root</span>
            </button>
            {folderPath.map((crumb, idx) => (
              <Fragment key={crumb.id}>
                <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
                <button
                  onClick={() => navigateToBreadcrumb(idx)}
                  className={`hover:text-white transition-colors font-medium truncate max-w-[120px] ${
                    idx === folderPath.length - 1 ? "text-blue-400" : ""
                  }`}
                >
                  {crumb.name}
                </button>
              </Fragment>
            ))}
          </div>

          <FileTable />
        </div>

        <FileDetailPanel setActiveTab={setActiveTab} />
      </div>

      {showFolderModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-sm bg-[#111827] border border-[#1F2937] p-6 rounded-2xl">
            <h3 className="text-lg font-bold">Buat Folder Baru</h3>
            <p className="text-xs text-gray-500 mt-1">
              {currentFolderId
                ? `Folder akan dibuat di dalam folder aktif saat ini.`
                : "Gunakan folder untuk memisahkan kategori berkas Anda."}
            </p>
            <form
              onSubmit={handleCreateFolderSubmit}
              className="mt-4 space-y-4"
            >
              <input
                type="text"
                placeholder="Nama folder..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full px-4 py-2 bg-[#090D16] border border-[#1F2937] focus:border-blue-500 focus:outline-none transition-all rounded-xl text-sm text-white"
                autoFocus
              />
              <div className="flex gap-3 justify-end text-xs">
                <button
                  type="button"
                  onClick={() => setShowFolderModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#1F2937] text-gray-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                >
                  Simpan Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MediaPreviewModal setActiveTab={setActiveTab} />
    </>
  );
}
