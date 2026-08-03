import { useCallback } from "react";
import { tauriBridge } from "../services/tauriBridge";

export function useTelegram() {
  const requestCode = useCallback(async (phone: string, apiId: number, apiHash: string) => {
    return await tauriBridge.requestAuthCode(phone, apiId, apiHash);
  }, []);

  const signInWithCode = useCallback(async (code: string) => {
    return await tauriBridge.signIn(code);
  }, []);

  const checkTwoFactorPassword = useCallback(async (password: string) => {
    return await tauriBridge.checkPassword(password);
  }, []);

  const logoutTelegramBackend = useCallback(async () => {
    return await tauriBridge.logoutTelegram();
  }, []);

  const initQrLoginBackend = useCallback(async (apiId: number, apiHash: string) => {
    return await tauriBridge.qrLogin(apiId, apiHash);
  }, []);

  const pollQrLoginStatus = useCallback(async () => {
    return await tauriBridge.qrPoll();
  }, []);

  const checkAutoLogin = useCallback(async () => {
    return await tauriBridge.checkAutoLogin();
  }, []);

  return {
    requestCode,
    signInWithCode,
    checkTwoFactorPassword,
    logoutTelegramBackend,
    initQrLoginBackend,
    pollQrLoginStatus,
    checkAutoLogin,
  };
}