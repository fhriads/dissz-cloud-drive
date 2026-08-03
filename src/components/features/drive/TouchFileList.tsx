import React, { useContext } from "react";
import { File, Search } from "lucide-react";
import { ThemeContext } from "../../../context/ThemeContext";
import { DriveContext } from "../../../context/DriveContext";
import { QueueContext } from "../../../context/QueueContext";
import FileTypeIcon from "../../common/FileTypeIcon";
import ChevronRightIcon from "../../common/ChevronRightIcon";
import { formatBytes } from "../../../utils/formatBytes";

interface TouchFileListProps {
  setActiveTab: (tab: "drive" | "vault" | "queue" | "settings") => void;
}

export default function TouchFileList({ setActiveTab }: TouchFileListProps) {
  const { isDarkMode } = useContext(ThemeContext)!;
  const {
    files,
    currentFolderId,
    searchQuery,
    setSearchQuery,
    setActiveFileForDetail,
  } = useContext(DriveContext)!;
  const { addTransfer } = useContext(QueueContext)!;

  const currentFiles = files.filter((f) => {
    if (f.parentId !== currentFolderId) return false;
    if (searchQuery && !f.name.toLowerCase().includes(searchQuery.toLowerCase()))
      return false;
    return !f.isEncrypted;
  });

  const triggerMobileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isSplit = file.size > 2000000000;
      addTransfer(file.name, file.size, "upload", isSplit);
      setActiveTab("queue");
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`p-4 rounded-2xl border ${
          isDarkMode
            ? "bg-[#111827]/40 border-[#1F2937]"
            : "bg-white border-[#E5E7EB]"
        }`}
      >
        <h3 className="font-bold text-sm">Penyimpanan Terdistribusi</h3>
        <p className="text-[10px] text-gray-400 mt-1 max-w-xs">
          Data Anda dipecah secara lokal dan dikirim langsung ke datacenter
          Telegram tanpa filter limitasi.
        </p>

        <div className="mt-4 flex gap-4">
          <label className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl text-center cursor-pointer transition-all">
            Unggah Berkas
            <input
              type="file"
              className="hidden"
              onChange={triggerMobileUpload}
            />
          </label>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Cari file..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={`w-full pl-9 pr-4 py-2 rounded-xl focus:outline-none text-xs border ${
            isDarkMode
              ? "bg-[#111827] border-[#1F2937] text-white"
              : "bg-[#F9F9F9] border-[#E5E7EB] text-gray-800"
          }`}
        />
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
          Daftar File
        </h4>
        {currentFiles.length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            <File className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Tidak ada berkas terdaftar</p>
          </div>
        ) : (
          currentFiles.map((file) => (
            <div
              key={file.id}
              onClick={() => setActiveFileForDetail(file)}
              className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                isDarkMode
                  ? "bg-[#111827]/20 border-[#1F2937] active:bg-[#111827]/60"
                  : "bg-white border-[#E5E7EB] active:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <FileTypeIcon type={file.type} />
                <div className="overflow-hidden">
                  <span className="font-semibold block truncate text-xs">
                    {file.name}
                  </span>
                  <span className="text-[9px] text-gray-500 block font-mono mt-0.5">
                    {file.type === "folder" ? "FOLDER" : formatBytes(file.size)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {file.isSplit && (
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold text-[8px]">
                    Parts
                  </span>
                )}
                <ChevronRightIcon className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
