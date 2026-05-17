"use client";

interface Props {
  id: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  helpText?: string;
  min?: number;
  step?: number;
  disabled?: boolean;
}

export default function InputField({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  placeholder = "0.00",
  helpText,
  min = 0,
  step = 0.01,
  disabled = false,
}: Props) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-slate-400">
        {label}
      </label>

      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-slate-500 text-sm pointer-events-none select-none">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10
            text-white placeholder-slate-600 text-sm
            focus:outline-none focus:border-indigo-500/50 focus:bg-white/8
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-colors
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
            ${prefix ? "pl-7" : ""}
            ${suffix ? "pr-10" : ""}
          `}
        />
        {suffix && (
          <span className="absolute right-3 text-slate-500 text-sm pointer-events-none select-none">
            {suffix}
          </span>
        )}
      </div>

      {helpText && (
        <p className="text-xs text-slate-600 leading-snug">{helpText}</p>
      )}
    </div>
  );
}
