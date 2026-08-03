// ============================================================================
// HELPER FORMATTING UTILITIES
// ============================================================================

/**
 * Mengonversi ukuran bytes menjadi format yang mudah dibaca manusia.
 * Contoh: 1024 → "1 KB", 2450000000 → "2.28 GB"
 */
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};
