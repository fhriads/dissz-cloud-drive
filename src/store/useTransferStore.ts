import { useContext } from "react";
import { QueueContext } from "../context/QueueContext";
import type { QueueContextType } from "../types";

export function useTransferStore(): QueueContextType {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error("useTransferStore must be used within a QueueProvider");
  }
  return context;
}
