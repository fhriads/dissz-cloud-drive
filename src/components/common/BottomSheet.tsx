import { ReactNode } from "react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function BottomSheet({
  isOpen,
  onClose,
  children,
}: BottomSheetProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-end justify-center z-50">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="w-full max-w-md p-6 rounded-t-3xl border-t relative z-10 bg-[#111827] border-[#1F2937] text-white animate-slide-up">
        <div className="w-12 h-1 bg-gray-600/50 rounded-full mx-auto mb-4"></div>
        {children}
      </div>
    </div>
  );
}
