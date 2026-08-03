export interface FolderData {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  is_encrypted: boolean;
}

export interface FileData {
  id: string;
  name: string;
  size: number;
  file_type: string;
  parent_id: string | null;
  created_at: string;
  is_encrypted: boolean;
  is_split: boolean;
  telegram_message_id?: number | null;
}
