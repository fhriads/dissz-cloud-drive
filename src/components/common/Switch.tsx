interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export default function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full transition-all relative ${
          checked ? "bg-blue-600" : "bg-gray-600"
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${
            checked ? "left-5.5" : "left-0.5"
          }`}
        ></div>
      </button>
      {label && <span className="text-xs text-gray-400">{label}</span>}
    </div>
  );
}
