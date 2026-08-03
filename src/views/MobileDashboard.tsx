import { useState, useContext, FormEvent } from "react";
import { Lock, Activity } from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import { DriveContext } from "../context/DriveContext";
import { QueueContext } from "../context/QueueContext";
import MobileHeader from "../components/layout/MobileHeader";
import BottomNavBar from "../components/layout/BottomNavBar";
import TouchFileList from "../components/features/drive/TouchFileList";
import DetailDrawer from "../components/features/drive/DetailDrawer";
import FileTypeIcon from "../components/common/FileTypeIcon";
import ChevronRightIcon from "../components/common/ChevronRightIcon";
import { formatBytes } from "../utils/formatBytes";

export default function MobileDashboard() {
  const { isDarkMode } = useContext(ThemeContext)!;
  const { logout, telegramUser, appPasswordSet, setAppPassword, removeAppPassword } = useContext(AuthContext)!;
  const {
    files,
    currentFolderId,
    searchQuery,
    isVaultUnlocked,
    unlockVault,
    setActiveFileForDetail,
    vaultPasswordSet,
    setVaultPassword,
  } = useContext(DriveContext)!;
  const { transfers } = useContext(QueueContext)!;

  const [activeTab, setActiveTab] = useState<
    "drive" | "vault" | "queue" | "settings"
  >("drive");
  const [vaultPasswordInput, setVaultPasswordInput] = useState("");
  const [vaultInputError, setVaultInputError] = useState(false);

  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [setPasswordError, setSetPasswordError] = useState("");

  const [appPasswordInput, setAppPasswordInput] = useState("");
  const [confirmAppPasswordInput, setConfirmAppPasswordInput] = useState("");
  const [currentAppPasswordInput, setCurrentAppPasswordInput] = useState("");
  
  const [mobileSettingsError, setMobileSettingsError] = useState("");
  const [mobileSettingsSuccess, setMobileSettingsSuccess] = useState("");

  const handleMobileSetPassword = (e: FormEvent) => {
    e.preventDefault();
    setMobileSettingsError("");
    setMobileSettingsSuccess("");

    if (!appPasswordInput.trim()) {
      setMobileSettingsError("Password tidak boleh kosong!");
      return;
    }
    if (appPasswordInput !== confirmAppPasswordInput) {
      setMobileSettingsError("Konfirmasi password tidak cocok!");
      return;
    }

    setAppPassword(appPasswordInput);
    setAppPasswordInput("");
    setConfirmAppPasswordInput("");
    setMobileSettingsSuccess("Password login diaktifkan!");
  };

  const handleMobileRemovePassword = (e: FormEvent) => {
    e.preventDefault();
    setMobileSettingsError("");
    setMobileSettingsSuccess("");

    if (!currentAppPasswordInput) {
      setMobileSettingsError("Ketik password saat ini!");
      return;
    }

    const success = removeAppPassword(currentAppPasswordInput);
    if (success) {
      setCurrentAppPasswordInput("");
      setMobileSettingsSuccess("Password login dihapus!");
    } else {
      setMobileSettingsError("Password salah!");
    }
  };

  const handleSetPasswordSubmit = (e: FormEvent) => {
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

  const vaultFiles = files.filter((f) => {
    if (f.parentId !== currentFolderId) return false;
    if (searchQuery && !f.name.toLowerCase().includes(searchQuery.toLowerCase()))
      return false;
    return f.isEncrypted;
  });

  const handleVaultUnlockSubmit = (e: FormEvent) => {
    e.preventDefault();
    const success = unlockVault(vaultPasswordInput);
    if (success) {
      setVaultPasswordInput("");
      setVaultInputError(false);
    } else {
      setVaultInputError(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between text-xs pb-16 select-none relative">
      <MobileHeader />

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {activeTab === "drive" && <TouchFileList setActiveTab={setActiveTab} />}

        {activeTab === "vault" &&
          (!isVaultUnlocked ? (
            !vaultPasswordSet ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-2xl flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold">Atur Sandi Brankas</h3>
                <p className="text-[11px] text-gray-500 mt-2 max-w-xs leading-normal">
                  Silakan atur sandi Anda terlebih dahulu untuk mengamankan data Anda di Brankas Rahasia.
                </p>

                <form
                  onSubmit={handleSetPasswordSubmit}
                  className="mt-6 w-full max-w-xs space-y-3"
                >
                  <input
                    type="password"
                    placeholder="Buat sandi baru..."
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="w-full px-4 py-2 bg-[#111827] border border-[#1F2937] rounded-xl text-center text-xs focus:outline-none focus:border-teal-500 text-white"
                  />
                  <input
                    type="password"
                    placeholder="Konfirmasi sandi..."
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    className="w-full px-4 py-2 bg-[#111827] border border-[#1F2937] rounded-xl text-center text-xs focus:outline-none focus:border-teal-500 text-white"
                  />
                  {setPasswordError && (
                    <span className="text-[10px] text-rose-500 block font-medium">
                      {setPasswordError}
                    </span>
                  )}
                  <button
                    type="submit"
                    className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs"
                  >
                    Simpan Sandi
                  </button>
                </form>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-2xl flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold">Secure Vault Mobile</h3>
                <p className="text-[11px] text-gray-500 mt-2 max-w-xs leading-normal">
                  Enkripsi AES-256 lokal didukung penuh di platform Android dan
                  iOS.
                </p>

                <form
                  onSubmit={handleVaultUnlockSubmit}
                  className="mt-6 w-full max-w-xs space-y-3"
                >
                  <input
                    type="password"
                    placeholder="Password Brankas..."
                    value={vaultPasswordInput}
                    onChange={(e) => setVaultPasswordInput(e.target.value)}
                    className={`w-full px-4 py-2 bg-[#111827] border rounded-xl text-center text-xs focus:outline-none focus:border-teal-500 ${
                      vaultInputError ? "border-rose-500 animate-shake" : "border-[#1F2937]"
                    }`}
                  />
                  {vaultInputError && (
                    <span className="text-[10px] text-rose-500 block font-medium">
                      Sandi salah! Silakan coba lagi.
                    </span>
                  )}
                  <button
                    type="submit"
                    className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs"
                  >
                    Buka Brankas Rahasia
                  </button>
                </form>
              </div>
            )
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-sm text-teal-400">
                  Secure Vault Aktif
                </h3>
                <span className="text-[9px] px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/20 font-bold text-teal-400">
                  Unlocked
                </span>
              </div>

              <div className="space-y-2">
                {vaultFiles.length === 0 ? (
                  <div className="py-12 text-center text-gray-500">
                    <Lock className="w-8 h-8 mx-auto mb-2 opacity-50 text-teal-500" />
                    <p className="text-xs">Brankas Anda masih kosong</p>
                  </div>
                ) : (
                  vaultFiles.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => setActiveFileForDetail(file)}
                      className="p-3.5 rounded-xl border border-[#1F2937] bg-[#111827]/20 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileTypeIcon type={file.type} />
                        <div className="overflow-hidden">
                          <span className="font-semibold block truncate text-xs">
                            {file.name}
                          </span>
                          <span className="text-[9px] text-gray-500 block font-mono mt-0.5">
                            {formatBytes(file.size)}
                          </span>
                        </div>
                      </div>
                      <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}

        {activeTab === "queue" && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm">Sesi Antrean Aktif</h3>

            <div className="space-y-3">
              {transfers.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">
                    Tidak ada aktivitas transfer terdeteksi
                  </p>
                </div>
              ) : (
                transfers.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 border rounded-xl space-y-3 ${
                      isDarkMode
                        ? "bg-[#111827]/20 border-[#1F2937]"
                        : "bg-white border-[#E5E7EB]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="overflow-hidden pr-4">
                        <h4 className="font-semibold text-xs truncate">
                          {item.fileName}
                        </h4>
                        <span className="text-[9px] text-gray-500 font-mono block mt-0.5 uppercase">
                          {item.type} • {formatBytes(item.size)}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-blue-500 shrink-0">
                        {item.progress}%
                      </span>
                    </div>

                    <div className="h-1.5 bg-[#090D16] rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm">Pengaturan & Sesi</h3>

            <div
              className={`p-4 border rounded-2xl ${
                isDarkMode
                  ? "bg-[#111827]/20 border-[#1F2937]"
                  : "bg-white border-[#E5E7EB]"
              }`}
            >
              <div className="flex items-center gap-3 border-b border-[#1F2937]/30 pb-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                  FD
                </div>
                <div>
                  <h4 className="font-semibold text-xs">
                    {telegramUser?.name}
                  </h4>
                  <span className="text-[9px] text-gray-500 font-mono block mt-0.5">
                    {telegramUser?.username}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Datacenter</span>
                  <span className="font-bold font-mono">
                    DC {telegramUser?.dc} (SG)
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Kapasitas</span>
                  <span className="font-bold text-emerald-500">UNLIMITED</span>
                </div>
              </div>
            </div>

            <div
              className={`p-4 border rounded-2xl space-y-4 ${
                isDarkMode
                  ? "bg-[#111827]/20 border-[#1F2937]"
                  : "bg-white border-[#E5E7EB]"
              }`}
            >
              <h4 className="font-bold text-[10px] text-gray-400 uppercase tracking-wider">Password Aplikasi (Local Lock)</h4>

              {mobileSettingsError && (
                <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-[10px] font-medium">
                  {mobileSettingsError}
                </div>
              )}
              {mobileSettingsSuccess && (
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-medium">
                  {mobileSettingsSuccess}
                </div>
              )}

              {!appPasswordSet ? (
                <form onSubmit={handleMobileSetPassword} className="space-y-3">
                  <input
                    type="password"
                    placeholder="Buat password login..."
                    value={appPasswordInput}
                    onChange={(e) => setAppPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 bg-[#111827] border border-[#1F2937] rounded-xl text-xs focus:outline-none focus:border-blue-500 text-white"
                  />
                  <input
                    type="password"
                    placeholder="Konfirmasi password..."
                    value={confirmAppPasswordInput}
                    onChange={(e) => setConfirmAppPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 bg-[#111827] border border-[#1F2937] rounded-xl text-xs focus:outline-none focus:border-blue-500 text-white"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs"
                  >
                    Aktifkan Password Login
                  </button>
                </form>
              ) : (
                <form onSubmit={handleMobileRemovePassword} className="space-y-3">
                  <div className="p-2 bg-teal-500/5 border border-teal-500/10 text-teal-400 rounded-lg text-[10px]">
                    Password aktif. Masukkan password saat ini untuk menghapus.
                  </div>
                  <input
                    type="password"
                    placeholder="Password saat ini..."
                    value={currentAppPasswordInput}
                    onChange={(e) => setCurrentAppPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 bg-[#111827] border border-[#1F2937] rounded-xl text-xs focus:outline-none focus:border-rose-500 text-white"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs"
                  >
                    Hapus Password Login
                  </button>
                </form>
              )}
            </div>

            <button
              onClick={logout}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-center text-xs shadow-lg transition-all"
            >
              Keluar Akun Telegram
            </button>
          </div>
        )}
      </div>

      <DetailDrawer setActiveTab={setActiveTab} />
      <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
