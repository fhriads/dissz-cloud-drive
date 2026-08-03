/**
 * Validates file size and allowed extensions
 */
export const isValidFileSize = (sizeInBytes: number, maxSizeInMB = 2000): boolean => {
  const maxBytes = maxSizeInMB * 1024 * 1024;
  return sizeInBytes <= maxBytes;
};

export const getFileExtension = (filename: string): string => {
  return filename.split(".").pop()?.toLowerCase() || "";
};
