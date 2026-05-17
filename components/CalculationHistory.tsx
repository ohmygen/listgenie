"use client";

import { useState, useEffect } from "react";
import {
  formatCurrency,
  MARKETPLACE_LABELS,
  MARKETPLACE_CURRENCY,
  type Marketplace,
  type Currency,
} from "@/lib/fees";
import PlatformIcon from "./PlatformIcon";

export interface HistoryEntry {
  id: string;
  platform: Marketplace;
  mode: "normal" | "reverse";
  salePrice: number;
  itemCost: number;
  netProfit: number;
  marginPercent: number;
  timestamp: number;
}

const STORAGE_KEY = "calc_history";

function loadHistory(): HistoryEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveToHistory(entry: HistoryEntry) {
  try {
    const history = loadHistory();
    const updated = [entry, ...history.filter((h) => h.id !== entry.id)].slice(0, 5);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("calc-history-updated"));
  } catch {}
}

function relativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "yesterday" : `${days}d ago`;
}

function getMarginColor(profit: number, margin: number): string {
  if (profit < 0) return "text-red-500";
  if (margin < 10) return "text-red-400";
  if (margin < 25) return "text-amber-400";
  return "text-emerald-400";
}

export default function CalculationHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [expanded, setExpanded] = useState(true);

  function refresh() {
    setHistory(loadHistory());
  }

  useEffect(() => {
    refresh();
    window.addEventListener("calc-history-updated", refresh);
    return () => window.removeEventListener("calc-history-updated", refresh);
  }, []);

  function deleteEntry(id: string) {
    try {
      const updated = history.filter((h) => h.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setHistory(updated);
    } catch {}
  }

  function clearAll() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHistory([]);
    } catch {}
  }

  function restoreEntry(entry: HistoryEntry) {
    const params = new URLSearchParams();
    params.set("t", entry.platform);
    if (entry.mode === "reverse") {
      params.set("md", "r");
      params.set("tp", entry.netProfit.toFixed(2));
      params.set("ic", entry.itemCost.toFixed(2));
    } else {
      params.set("sp", entry.salePrice.toFixed(2));
      params.set("ic", entry.itemCost.toFixed(2));
    }
    window.location.assign(`?${params.toString()}`);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="glass rounded-2xl p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest hover:text-slate-300 transition-colors"
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
            Recent Calculations
          </button>
          {expanded && history.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {expanded && (
          <>
            {history.length === 0 ? (
              <p className="text-xs text-slate-600 text-center py-4">
                Your last 5 calculations will appear here.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {history.map((entry) => {
                  const currency: Currency = MARKETPLACE_CURRENCY[entry.platform];
                  const marginColor = getMarginColor(entry.netProfit, entry.marginPercent);
                  const fmt = (n: number) => formatCurrency(n, currency);
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/3 border border-white/6 hover:bg-white/5 transition-colors"
                    >
                      <PlatformIcon platform={entry.platform} size={20} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-white font-mono">
                            {fmt(entry.itemCost)} → {fmt(entry.salePrice)}
                          </span>
                          <span className={`text-xs font-semibold ${marginColor}`}>
                            {entry.marginPercent.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-600">
                            {MARKETPLACE_LABELS[entry.platform]}
                          </span>
                          {entry.mode === "reverse" && (
                            <span className="text-xs text-indigo-400/70">reverse</span>
                          )}
                          <span className="text-xs text-slate-700">·</span>
                          <span className="text-xs text-slate-700">
                            {relativeTime(entry.timestamp)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => restoreEntry(entry)}
                          className="text-xs px-2 py-1 rounded-lg bg-indigo-600/20 border border-indigo-500/25 text-indigo-400 hover:bg-indigo-600/30 transition-colors"
                        >
                          Restore
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteEntry(entry.id)}
                          className="text-xs w-6 h-6 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-400 hover:bg-white/8 transition-colors"
                          aria-label="Delete entry"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
