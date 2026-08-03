import { Folder, File, Play, Volume2, Layers } from "lucide-react";
import type { FileItem } from "../../types";

interface FileTypeIconProps {
  type: FileItem["type"];
}

export default function FileTypeIcon({ type }: FileTypeIconProps) {
  const baseClass =
    "w-10 h-10 flex items-center justify-center rounded-xl border";

  switch (type) {
    case "folder":
      return (
        <div
          className={`${baseClass} bg-amber-500/10 border-amber-500/20 text-amber-500`}
        >
          <Folder className="w-5 h-5 fill-current" />
        </div>
      );
    case "video":
      return (
        <div
          className={`${baseClass} bg-indigo-500/10 border-indigo-500/20 text-indigo-500`}
        >
          <Play className="w-5 h-5" />
        </div>
      );
    case "audio":
      return (
        <div
          className={`${baseClass} bg-teal-500/10 border-teal-500/20 text-teal-500`}
        >
          <Volume2 className="w-5 h-5" />
        </div>
      );
    case "image":
      return (
        <div
          className={`${baseClass} bg-rose-500/10 border-rose-500/20 text-rose-500`}
        >
          <File className="w-5 h-5" />
        </div>
      );
    case "archive":
      return (
        <div
          className={`${baseClass} bg-purple-500/10 border-purple-500/20 text-purple-500`}
        >
          <Layers className="w-5 h-5" />
        </div>
      );
    default:
      return (
        <div
          className={`${baseClass} bg-sky-500/10 border-sky-500/20 text-sky-500`}
        >
          <File className="w-5 h-5" />
        </div>
      );
  }
}
