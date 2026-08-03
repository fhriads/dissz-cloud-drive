import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <div>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2 bg-[#090D16] border rounded-xl focus:outline-none transition-all text-sm ${
          error
            ? "border-rose-500 focus:border-rose-400"
            : "border-[#1F2937] focus:border-blue-500"
        } ${className}`}
        {...props}
      />
      {error && (
        <span className="text-[10px] text-rose-500 block mt-1 font-medium">
          {error}
        </span>
      )}
    </div>
  );
}
