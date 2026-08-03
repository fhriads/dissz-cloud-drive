import React, { useState, useContext } from "react";
import { Lock, KeyRound, ArrowRight } from "lucide-react";
import { AuthContext } from "../../../context/AuthContext";

export default function AppLockScreen() {
  const { unlockApp } = useContext(AuthContext)!;
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    
    const success = unlockApp(password);
    if (!success) {
      setError(true);
      setPassword("");
    } else {
      setError(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#090D16] text-white relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/3 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-[#111827]/80 border border-[#1F2937] backdrop-blur-2xl rounded-3xl p-8 shadow-2xl shadow-black/60 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-2xl mb-6 shadow-xl shadow-blue-500/5">
            <Lock className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold tracking-tight">Dissz Cloud Drive</h2>
          <p className="text-gray-400 text-xs mt-1.5 leading-relaxed">
            Aplikasi Terkunci. Silakan masukkan password login Anda.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="password"
                placeholder="Masukkan password..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                className={`w-full pl-11 pr-4 py-3 bg-[#090D16]/90 border rounded-2xl focus:border-blue-500 focus:outline-none transition-all text-sm font-semibold tracking-wider text-center ${
                  error ? "border-rose-500" : "border-[#1F2937]"
                }`}
                autoFocus
              />
            </div>

            {error && (
              <span className="text-[11px] text-rose-400 font-medium block">
                Password salah! Silakan coba lagi.
              </span>
            )}

            <button
              type="submit"
              disabled={!password}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer mt-2 text-sm"
            >
              <span>Masuk Ke Drive</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
