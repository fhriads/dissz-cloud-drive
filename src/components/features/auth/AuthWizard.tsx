import React, { useContext } from "react";
import { Cpu, Phone, Shield, KeyRound, MessageSquareCode } from "lucide-react";
import { AuthContext } from "../../../context/AuthContext";

export default function AuthWizard() {
  const { loginWithPhone, submitOtp, loginStep, phoneNumber } =
    useContext(AuthContext)!;

  const [phoneInput, setPhoneInput] = React.useState("");
  const [apiIdInput, setApiIdInput] = React.useState(
    import.meta.env.VITE_TELEGRAM_API_ID || ""
  );
  const [apiHashInput, setApiHashInput] = React.useState(
    import.meta.env.VITE_TELEGRAM_API_HASH || ""
  );
  const [otpInput, setOtpInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmitPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput) {
      alert("Masukkan nomor telepon Anda!");
      return;
    }
    if (!apiIdInput || !apiHashInput) {
      alert("API ID dan API Hash wajib diisi. Dapatkan di my.telegram.org");
      return;
    }
    setIsLoading(true);
    try {
      await loginWithPhone(phoneInput, apiIdInput, apiHashInput);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput) return;
    setIsLoading(true);
    try {
      await submitOtp(otpInput);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#090D16] text-white relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#111827]/90 border border-[#1F2937] backdrop-blur-xl rounded-2xl p-8 shadow-2xl shadow-black/40">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-blue-600/15 border border-blue-500/25 text-blue-400 rounded-2xl mb-4 shadow-lg shadow-blue-500/10">
              <Cpu className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Dissz Cloud Drive
            </h1>
            <p className="text-gray-400 text-sm mt-1.5">
              Ubah Telegram Kamu Menjadi Harddisk Tanpa Batas
            </p>
          </div>

          <div className="flex items-center gap-2 mb-7">
            <div
              className={`flex items-center gap-2 flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                loginStep === "credentials"
                  ? "bg-blue-600/20 border-blue-500/40 text-blue-300"
                  : "bg-green-500/10 border-green-500/30 text-green-400"
              }`}
            >
              <Phone className="w-4 h-4 shrink-0" />
              <span>Nomor Telepon</span>
            </div>
            <div className="w-6 h-px bg-[#1F2937]" />
            <div
              className={`flex items-center gap-2 flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                loginStep === "otp"
                  ? "bg-blue-600/20 border-blue-500/40 text-blue-300"
                  : loginStep === "success"
                  ? "bg-green-500/10 border-green-500/30 text-green-400"
                  : "bg-[#1F2937]/30 border-[#1F2937] text-gray-500"
              }`}
            >
              <MessageSquareCode className="w-4 h-4 shrink-0" />
              <span>Kode OTP</span>
            </div>
          </div>

          {loginStep === "credentials" && (
            <form onSubmit={handleSubmitPhone} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Nomor Telepon
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="+62812345678"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#090D16] border border-[#1F2937] rounded-xl focus:border-blue-500 focus:outline-none transition-all text-sm placeholder-gray-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    API ID
                  </label>
                  <input
                    type="text"
                    placeholder="1234567"
                    value={apiIdInput}
                    onChange={(e) => setApiIdInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#090D16] border border-[#1F2937] rounded-xl focus:border-blue-500 focus:outline-none transition-all text-xs text-gray-300 font-mono placeholder-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    API HASH
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••••••••••"
                    value={apiHashInput}
                    onChange={(e) => setApiHashInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#090D16] border border-[#1F2937] rounded-xl focus:border-blue-500 focus:outline-none transition-all text-xs text-gray-300 font-mono placeholder-gray-600"
                  />
                </div>
              </div>

              <div className="bg-[#1F2937]/30 border border-[#1F2937]/60 rounded-xl p-3 flex items-start gap-3">
                <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Semua kredensial disimpan lokal di perangkat Anda. Dapatkan
                  API ID & Hash di{" "}
                  <span className="text-blue-400 font-medium">my.telegram.org</span>.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 text-sm mt-2 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Phone className="w-4 h-4" />
                )}
                {isLoading ? "Mengirim kode OTP..." : "Kirim Kode OTP"}
              </button>
            </form>
          )}

          {loginStep === "otp" && (
            <form onSubmit={handleSubmitOtp} className="space-y-5">
              <div className="text-center py-4 bg-blue-500/5 border border-blue-500/15 rounded-xl">
                <MessageSquareCode className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-sm text-gray-300 leading-relaxed">
                  Kode verifikasi telah dikirim ke akun Telegram Anda
                </p>
                <p className="text-sm font-mono font-bold text-blue-400 mt-1">
                  {phoneNumber}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Kode OTP Telegram
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="1 2 3 4 5"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-10 pr-4 py-3 bg-[#090D16] border border-[#1F2937] rounded-xl focus:border-blue-500 focus:outline-none transition-all text-center text-xl tracking-[0.5em] font-mono font-bold"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-gray-500 text-center mt-2">
                  Buka aplikasi Telegram di HP Anda dan cek pesan masuk dari Telegram.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || otpInput.length < 5}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <KeyRound className="w-4 h-4" />
                )}
                {isLoading ? "Memverifikasi..." : "Konfirmasi & Hubungkan"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-600 mt-5">
          Dissz Cloud Drive — Berjalan 100% lokal tanpa server perantara
        </p>
      </div>
    </div>
  );
}
