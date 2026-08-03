import { useContext } from "react";
import { DriveContext } from "../context/DriveContext";
import type { DriveContextType } from "../types";

export function useDriveStore(): DriveContextType {
  const context = useContext(DriveContext);
  if (!context) {
    throw new Error("useDriveStore must be used within a DriveProvider");
  }
  return context;
}
