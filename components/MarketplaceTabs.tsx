"use client";

import { type Marketplace, MARKETPLACE_LABELS } from "@/lib/fees";
import PlatformIcon from "./PlatformIcon";

interface Props {
  active: Marketplace;
  onChange: (m: Marketplace) => void;
}

export default function MarketplaceTabs({ active, onChange }: Props) {
  const platforms = Object.keys(MARKETPLACE_LABELS) as Marketplace[];

  return (
    <div className="relative">
      <div className="flex overflow-x-auto gap-1 p-1 rounded-2xl bg-white/4 border border-white/8 scrollbar-none">
        {platforms.map((m) => {
          const isActive = active === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => onChange(m)}
              aria-pressed={isActive}
              className={`
                flex-shrink-0 inline-flex items-center justify-center gap-1.5
                px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap
                transition-all duration-150
                ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/6"
                }
              `}
            >
              <PlatformIcon platform={m} muted={!isActive} />
              <span className="hidden sm:inline">{MARKETPLACE_LABELS[m]}</span>
            </button>
          );
        })}
      </div>
      {/* Scroll hint — fades out on the right edge */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-12 rounded-r-2xl bg-gradient-to-l from-slate-900/60 to-transparent" />
    </div>
  );
}
