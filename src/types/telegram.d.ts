export interface TelegramUser {
  id?: number;
  name: string;
  username: string;
  dc: number;
}

export interface AuthResponse {
  success: boolean;
  next_step: string | null;
  error: string | null;
}
