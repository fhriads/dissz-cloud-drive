import React, { createContext, useState, useEffect } from "react";
import type { AuthContextType } from "../types";
import { useTelegram } from "../hooks/useTelegram";

// ============================================================================
// AUTH CONTEXT - Manajemen Sesi Login Telegram Nyata via Tauri IPC
// ============================================================================

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [apiId, setApiId] = useState<string>("");
  const [apiHash, setApiHash] = useState<string>("");
  const [loginStep, setLoginStep] = useState<"credentials" | "otp" | "success">(
    "credentials"
  );
  const [telegramUser, setTelegramUser] = useState<
    AuthContextType["telegramUser"]
  >(null);

  // State pelindung untuk menahan rendering halaman selama pengecekan sesi otomatis berlangsung
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // State manajemen Lock screen lokal
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [appPasswordSet, setAppPasswordSet] = useState<boolean>(
    !!localStorage.getItem("app_password")
  );

  // Ambil alat penembak perintah Tauri dari hook useTelegram termasuk checkAutoLogin
  const { requestCode, signInWithCode, logoutTelegramBackend, checkAutoLogin } = useTelegram();

  const triggerAutoLoginVerification = async () => {
    try {
      console.log("Memeriksa keberadaan berkas konfigurasi sesi lokal...");
      const res = await checkAutoLogin();

      if (res.success && res.next_step === "dashboard") {
        setLoginStep("success");
        setTelegramUser({
          name: "Sesi Aktif Dissz Drive",
          username: "@telegram_user",
          dc: 4, // Home Datacenter default Asia
        });
        setIsLoggedIn(true);
      }
    } catch (err) {
      console.log("Belum ada sesi aktif atau config.json kosong. Menuju formulir login manual.");
    } finally {
      // Matikan loading screen setelah backend merespons
      setIsInitializing(false);
    }
  };

  // EFFECT UTAMA: Periksa status sesi ke backend Rust sesaat setelah aplikasi dimuat pertama kali
  useEffect(() => {
    const checkPasswordAndSession = async () => {
      const hasPassword = !!localStorage.getItem("app_password");
      if (hasPassword) {
        setIsLocked(true);
        setIsInitializing(false);
      } else {
        await triggerAutoLoginVerification();
      }
    };

    checkPasswordAndSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginWithPhone = async (phone: string, id: string, hash: string) => {
    try {
      const parsedApiId = parseInt(id, 10);
      if (isNaN(parsedApiId)) {
        alert("API ID harus berupa komponen angka valid!");
        return;
      }

      console.log("Menembak komando Rust untuk meminta kode OTP...");
      const res = await requestCode(phone, parsedApiId, hash);

      if (res === "code_sent") {
        setPhoneNumber(phone);
        setApiId(id);
        setApiHash(hash);
        setLoginStep("otp"); // Geser tampilan form input OTP di UI
      }
    } catch (err: any) {
      alert(`Gagal memicu koneksi Telegram: ${err}`);
    }
  };

  const submitOtp = async (code: string) => {
    try {
      console.log("Memverifikasi OTP ke server Telegram melalui Rust...");
      const res = await signInWithCode(code);

      if (res.success && res.next_step === "dashboard") {
        setLoginStep("success");
        setTelegramUser({
          name: "Sesi Aktif Dissz Drive",
          username: "@telegram_user",
          dc: 4, // Home Datacenter default Asia
        });
        setIsLoggedIn(true);
      } else if (res.next_step === "password") {
        alert("Akun Anda menggunakan 2FA (Verifikasi Dua Langkah). Silakan masukkan password Anda.");
      } else if (res.error) {
        alert(`Telegram Menolak: ${res.error}`);
      }
    } catch (err: any) {
      alert(`Error Verifikasi OTP: ${err}`);
    }
  };

  const unlockApp = (password: string): boolean => {
    const savedPassword = localStorage.getItem("app_password");
    if (savedPassword && password === savedPassword) {
      setIsLocked(false);
      setIsInitializing(true);
      triggerAutoLoginVerification();
      return true;
    }
    return false;
  };

  const setAppPassword = (password: string) => {
    localStorage.setItem("app_password", password);
    setAppPasswordSet(true);
  };

  const removeAppPassword = (password: string): boolean => {
    const savedPassword = localStorage.getItem("app_password");
    if (savedPassword && password === savedPassword) {
      localStorage.removeItem("app_password");
      setAppPasswordSet(false);
      return true;
    }
    return false;
  };

  const logout = async () => {
    try {
      console.log("Mematikan runner jaringan dan menghapus file .session...");
      await logoutTelegramBackend();
    } catch (err) {
      console.error("Gagal membersihkan sesi di backend:", err);
    }
    localStorage.removeItem("app_password");
    setAppPasswordSet(false);
    setIsLocked(false);
    setIsLoggedIn(false);
    setLoginStep("credentials");
    setTelegramUser(null);
  };

  // Tampilkan layar loading premium bertema gelap bawaan Tailwind kamu selama transisi inisialisasi
  if (isInitializing) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#0b0f19] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-xs font-medium tracking-wide text-slate-400 animate-pulse">
            Memeriksa Kredensial Sesi Dissz Drive...
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        phoneNumber,
        apiId,
        apiHash,
        loginStep,
        telegramUser,
        loginWithPhone,
        submitOtp,
        logout,
        isLocked,
        appPasswordSet,
        unlockApp,
        setAppPassword,
        removeAppPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}