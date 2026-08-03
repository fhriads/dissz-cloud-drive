export interface AuthContextType {
  isLoggedIn: boolean;
  phoneNumber: string;
  apiId: string;
  apiHash: string;
  loginStep: "credentials" | "otp" | "success";
  telegramUser: { name: string; username: string; dc: number } | null;
  loginWithPhone: (phone: string, apiId: string, apiHash: string) => void;
  submitOtp: (code: string) => void;
  logout: () => void;
  isLocked: boolean;
  appPasswordSet: boolean;
  unlockApp: (password: string) => boolean;
  setAppPassword: (password: string) => void;
  removeAppPassword: (password: string) => boolean;
}
