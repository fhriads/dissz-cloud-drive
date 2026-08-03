/**
 * Formats a timestamp string or Unix timestamp into a readable date string
 */
export const formatDate = (timestamp: string | number): string => {
  const date = typeof timestamp === "number" ? new Date(timestamp * 1000) : new Date(timestamp);
  if (isNaN(date.getTime())) {
    return String(timestamp);
  }
  return date.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
