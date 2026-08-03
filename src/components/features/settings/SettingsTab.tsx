import { useState, useContext, FormEvent } from "react";
import { Shield, KeyRound, CheckCircle, Trash2, ShieldCheck, User } from "lucide-react";
import { AuthContext } from "../../../context/AuthContext";
import { ThemeContext } from "../../../context/ThemeContext";

export default function SettingsTab() {
  const { isDarkMode } = useContext(ThemeContext)!;
  const { telegramUser, appPasswordSet, setAppPassword, removeAppPassword } =
    useContext(AuthContext)!;

  const [passwordInput, setPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const handleSetPassword = (e: FormEvent) => {
    e.preventDefault();
    setActionError("");
    setActionSuccess("");

    if (!passwordInput.trim()) {
      setActionError("Password tidak boleh kosong!");
      return;
    }

    if (passwordInput !== confirmPasswordInput) {
      setActionError("Konfirmasi password tidak cocok!");
      return;
    }

    setAppPassword(passwordInput);
    setPasswordInput("");
    setConfirmPasswordInput("");
    setActionSuccess("Password login berhasil diaktifkan!");
  };

  const handleRemovePassword = (e: FormEvent) => {
    e.preventDefault();
    setActionError("");
    setActionSuccess("");

    if (!currentPasswordInput) {
      setActionError("Masukkan password saat ini untuk memverifikasi!");
      return;
    }

    const success = removeAppPassword(currentPasswordInput);
    if (success) {
      setCurrentPasswordInput("");
      setActionSuccess("Password login berhasil dihapus!");
    } else {
      setActionError("Password salah!");
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto max-w-4xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-xl font-bold tracking-tight">Pengaturan & Sesi Keamanan</h1>
        <p className="text-xs text-gray-500 mt-1">
          Kelola sesi login Telegram dan keamanan akses aplikasi Anda secara lokal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? "bg-[#111827]/40 border-[#1F2937]" : "bg-white border-[#E5E7EB]"
        }`}>
          <div className="flex items-center gap-3 border-b pb-4 mb-4 border-gray-500/10">
            <div className="w-12 h-12 bg-blue-600/10 text-blue-400 rounded-2xl flex items-center justify-center border border-blue-500/15">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Akun Telegram Aktif</h3>
              <p className="text-xs text-gray-500">Koneksi lokal terenkripsi</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Nama Tampilan</span>
              <span className="font-semibold">{telegramUser?.name || "Pengguna Drive"}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Username</span>
              <span className="font-mono text-gray-400">{telegramUser?.username || "@tanpa_username"}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Telegram Datacenter</span>
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold font-mono text-[10px]">
                DC {telegramUser?.dc || 4}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Kapasitas Penyimpanan</span>
              <span className="font-bold text-emerald-500">UNLIMITED</span>
            </div>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border transition-all ${
          isDarkMode ? "bg-[#111827]/40 border-[#1F2937]" : "bg-white border-[#E5E7EB]"
        }`}>
          <div className="flex items-center gap-3 border-b pb-4 mb-4 border-gray-500/10">
            <div className="w-12 h-12 bg-teal-500/10 text-teal-400 rounded-2xl flex items-center justify-center border border-teal-500/15">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Password Aplikasi (Local Lock)</h3>
              <p className="text-xs text-gray-500">Amankan drive Anda saat dibuka kembali</p>
            </div>
          </div>

          {actionError && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-medium animate-pulse">
              {actionError}
            </div>
          )}
          {actionSuccess && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-medium flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {!appPasswordSet ? (
            <form onSubmit={handleSetPassword} className="space-y-4">
              <div className="bg-[#1F2937]/30 border border-[#1F2937]/50 rounded-xl p-3 flex items-start gap-3">
                <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Mengaktifkan password aplikasi akan meminta Anda memasukkan password ini setiap kali aplikasi dibuka. Anda tidak perlu lagi login ulang menggunakan kode OTP Telegram.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Password Login Baru
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    placeholder="Buat password login..."
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#090D16] border border-[#1F2937] focus:border-blue-500 focus:outline-none transition-all rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    placeholder="Ketik ulang password..."
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#090D16] border border-[#1F2937] focus:border-blue-500 focus:outline-none transition-all rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/10 text-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Set Password Login</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleRemovePassword} className="space-y-4">
              <div className="p-3 bg-teal-500/5 border border-teal-500/15 text-teal-400 rounded-xl text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span className="font-medium">Password aplikasi saat ini AKTIF dan melindungi akses.</span>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Masukkan Password Saat Ini untuk Menghapus
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    placeholder="Ketik password Anda saat ini..."
                    value={currentPasswordInput}
                    onChange={(e) => setCurrentPasswordInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-[#090D16] border border-[#1F2937] focus:border-rose-500 focus:outline-none transition-all rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-rose-500/10 text-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Hapus Password Login</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
