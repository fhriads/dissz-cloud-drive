import { useContext } from "react";
import { File, Lock, Play, Trash2, Layers, Folder, ChevronRight } from "lucide-react";
import { ThemeContext } from "../../../context/ThemeContext";
import { DriveContext } from "../../../context/DriveContext";
import FileTypeIcon from "../../common/FileTypeIcon";
import { formatBytes } from "../../../utils/formatBytes";

export default function FileTable() {
  const { isDarkMode } = useContext(ThemeContext)!;
  const {
    files,
    currentFolderId,
    searchQuery,
    isSecureVaultActive,
    activeFileForDetail,
    setActiveFileForDetail,
    deleteFile,
    navigateToFolder,
  } = useContext(DriveContext)!;

  const currentFiles = files.filter((f) => {
    if (f.parentId !== currentFolderId) return false;
    if (searchQuery && !f.name.toLowerCase().includes(searchQuery.toLowerCase()))
      return false;
    if (isSecureVaultActive) {
      return f.isEncrypted;
    } else {
      return !f.isEncrypted;
    }
  });

  const handleRowClick = (file: typeof files[0]) => {
    if (file.type === "folder") {
      navigateToFolder(file.id, file.name);
    } else {
      setActiveFileForDetail(file);
    }
  };

  return (
    <div
      className={`border rounded-2xl overflow-hidden ${
        isDarkMode
          ? "border-[#1F2937]/80 bg-[#111827]/10"
          : "border-[#E5E7EB] bg-white"
      }`}
    >
      <table className="w-full text-left border-collapse">
        <thead>
          <tr
            className={`border-b text-xs text-gray-500 font-semibold tracking-wide ${
              isDarkMode
                ? "border-[#1F2937]/80 bg-[#111827]/40"
                : "border-[#E5E7EB] bg-[#F9F9F9]"
            }`}
          >
            <th className="py-3 px-6">Nama File</th>
            <th className="py-3 px-4">Ukuran</th>
            <th className="py-3 px-4">Status Enkripsi</th>
            <th className="py-3 px-4 text-right pr-6">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {currentFiles.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-12 text-center">
                <div className="w-12 h-12 bg-gray-500/10 text-gray-400 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <File className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-gray-400">
                  {currentFolderId ? "Folder ini masih kosong" : "Belum ada file yang terdaftar"}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {currentFolderId
                    ? "Unggah file ke dalam folder ini menggunakan tombol 'Unggah File' di atas."
                    : "Gunakan tombol diatas untuk mulai mengunggah file Anda."}
                </p>
              </td>
            </tr>
          ) : (
            currentFiles.map((file) => (
              <tr
                key={file.id}
                onClick={() => handleRowClick(file)}
                className={`border-b border-[#1F2937]/30 text-xs transition-all cursor-pointer ${
                  file.type !== "folder" && activeFileForDetail?.id === file.id
                    ? isDarkMode
                      ? "bg-blue-600/10"
                      : "bg-blue-50"
                    : isDarkMode
                    ? "hover:bg-[#111827]/30"
                    : "hover:bg-gray-50"
                }`}
              >
                <td className="py-4 px-6 font-semibold flex items-center gap-3">
                  {file.type === "folder" ? (
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500/15 text-amber-400 shrink-0">
                      <Folder className="w-5 h-5" />
                    </div>
                  ) : (
                    <FileTypeIcon type={file.type} />
                  )}
                  <div className="overflow-hidden">
                    <span
                      className={`block truncate text-sm font-semibold ${
                        isDarkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      {file.name}
                    </span>
                    <span className="text-[10px] text-gray-500 block">
                      {file.type === "folder" ? "Folder" : file.createdAt}
                    </span>
                  </div>
                  {file.type === "folder" && (
                    <ChevronRight className="w-4 h-4 text-gray-500 ml-auto shrink-0" />
                  )}
                </td>
                <td className="py-4 px-4 font-mono font-medium text-gray-400">
                  {file.type === "folder" ? "-" : formatBytes(file.size)}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1.5">
                    {file.isEncrypted ? (
                      <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 text-[10px] font-bold border border-teal-500/20 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> E2EE
                      </span>
                    ) : (
                      <span className="text-gray-500 text-[10px] font-medium">
                        -
                      </span>
                    )}

                    {file.isSplit && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold border border-blue-500/20 flex items-center gap-1">
                        <Layers className="w-3 h-3" /> Part {file.splitParts}
                      </span>
                    )}
                  </div>
                </td>
                <td
                  className="py-4 px-4 text-right pr-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="inline-flex gap-2">
                    {file.type !== "folder" && (
                      <button
                        onClick={() => (window as any).__setMediaPreview?.(file)}
                        className="p-1.5 rounded-lg border border-gray-500/10 text-gray-400 hover:text-white hover:bg-gray-700/30 transition-all"
                        title="Pratinjau / Putar"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteFile(file.id)}
                      className="p-1.5 rounded-lg border border-rose-500/10 text-rose-400 hover:text-white hover:bg-rose-600 transition-all"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
