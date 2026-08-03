import { useContext } from "react";
import { ArrowUp, ArrowDown, Activity, Check } from "lucide-react";
import { ThemeContext } from "../../../context/ThemeContext";
import { QueueContext } from "../../../context/QueueContext";
import { formatBytes } from "../../../utils/formatBytes";

export default function QueueWidget() {
  const { isDarkMode } = useContext(ThemeContext)!;
  const { transfers, clearCompleted } = useContext(QueueContext)!;

  return (
    <div className="flex-1 overflow-y-auto p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Antrean Transfer Sesi
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Mengawasi aktivitas unggah dan unduh berkas secara real-time.
          </p>
        </div>

        <button
          onClick={clearCompleted}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold hover:bg-[#1F2937] transition-all ${
            isDarkMode
              ? "bg-[#111827] border-[#1F2937]"
              : "bg-white border-[#E5E7EB]"
          }`}
        >
          Bersihkan Riwayat Selesai
        </button>
      </div>

      <div className="space-y-3">
        {transfers.length === 0 ? (
          <div className="py-12 text-center bg-[#111827]/10 border border-[#1F2937]/50 rounded-2xl">
            <Activity className="w-10 h-10 text-gray-500 mx-auto mb-2" />
            <h4 className="font-semibold text-gray-400">
              Tidak ada aktivitas transfer
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              Riwayat antrean Anda kosong.
            </p>
          </div>
        ) : (
          transfers.map((item) => (
            <div
              key={item.id}
              className={`p-5 border rounded-2xl flex items-center justify-between gap-6 ${
                isDarkMode
                  ? "bg-[#111827]/30 border-[#1F2937]"
                  : "bg-white border-[#E5E7EB]"
              }`}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    item.type === "upload"
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-teal-500/10 text-teal-400"
                  }`}
                >
                  {item.type === "upload" ? (
                    <ArrowUp className="w-5 h-5" />
                  ) : (
                    <ArrowDown className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">
                    {item.fileName}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span className="font-mono font-medium">
                      {formatBytes(item.size)}
                    </span>
                    <span>•</span>
                    <span className="uppercase text-[10px] font-bold text-gray-400">
                      {item.type}
                    </span>
                    {item.isSplit && (
                      <>
                        <span>•</span>
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold text-[9px]">
                          Splitting
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-80 shrink-0">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold">{item.progress}%</span>
                  <span className="text-gray-500">
                    {item.status === "completed" ? "Selesai" : item.speed}
                  </span>
                </div>
                <div className="h-2 bg-[#090D16] rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      item.status === "completed"
                        ? "bg-emerald-500"
                        : item.type === "upload"
                        ? "bg-blue-500"
                        : "bg-teal-500"
                    }`}
                    style={{ width: `${item.progress}%` }}
                  ></div>
                </div>
                {item.isSplit && item.status === "running" && (
                  <span className="text-[10px] text-gray-500 block mt-1">
                    Mengirim partisi {item.currentPart} dari {item.partsCount}
                    ...
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {item.status === "completed" ? (
                  <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Check className="w-4 h-4" />
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-amber-500 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                    Sedang Berjalan
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
