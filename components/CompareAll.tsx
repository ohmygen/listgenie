"use client";

import {
  type CompareResult,
  MARKETPLACE_LABELS,
  type Marketplace,
  formatCurrency,
} from "@/lib/fees";

const ICONS: Record<Marketplace, string> = {
  etsy: "🛍",
  poshmark: "👗",
  mercari: "📦",
  depop: "✨",
  ebay: "🔖",
  vinted: "👚",
  shopee_br: "🛒",
  subito: "📌",
};

// All comparison figures are shown in USD after normalisation
const fmtUSD = (n: number) => formatCurrency(n, "USD");

interface Props {
  results: CompareResult[];
}

export default function CompareAll({ results }: Props) {
  if (results.length === 0) return null;

  const maxProfitUSD = Math.max(...results.map((r) => r.profitUSD));
  const best = results.find((r) => r.profitUSD === maxProfitUSD);

  return (
    <div className="mt-4 animate-fade-in">
      <div className="glass rounded-2xl p-5">
        <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              All Platforms Compared
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              Non-USD platforms converted to $ at approximate rates
            </p>
          </div>
          {best && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 font-medium whitespace-nowrap">
              Best: {MARKETPLACE_LABELS[best.platform]}
            </span>
          )}
        </div>

        {/* Mobile: stacked cards */}
        <div className="flex flex-col gap-3 sm:hidden">
          {results.map((r) => {
            const isBest = r.profitUSD === maxProfitUSD;
            const isNonUSD = r.currency !== "USD";
            return (
              <div
                key={r.platform}
                className={`rounded-xl p-4 border ${
                  isBest
                    ? "border-emerald-500/30 bg-emerald-500/8"
                    : "border-white/8 bg-white/3"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2 text-sm font-medium text-white">
                    <span>{ICONS[r.platform]}</span>
                    {MARKETPLACE_LABELS[r.platform]}
                    {isBest && <span className="text-xs text-emerald-400">★ Best</span>}
                    {isNonUSD && (
                      <span className="text-xs text-slate-600">
                        ({r.currency})
                      </span>
                    )}
                  </span>
                  <span
                    className={`text-sm font-bold font-mono ${
                      r.profitUSD >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {r.profitUSD >= 0 ? "" : "−"}
                    {fmtUSD(Math.abs(r.profitUSD))}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs text-slate-500">
                  <span>
                    Fees:{" "}
                    <span className="text-red-400">{fmtUSD(r.totalFeesUSD)}</span>
                  </span>
                  <span>
                    Margin:{" "}
                    <span
                      className={
                        r.profitUSD >= 0 ? "text-emerald-400" : "text-red-400"
                      }
                    >
                      {r.profitMargin.toFixed(1)}%
                    </span>
                  </span>
                  <span>
                    Break-even:{" "}
                    <span className="text-slate-300">
                      {formatCurrency(r.breakEvenPrice, r.currency)}
                    </span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop: table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left text-xs text-slate-500 font-medium pb-2 pr-4">
                  Platform
                </th>
                <th className="text-right text-xs text-slate-500 font-medium pb-2 px-3">
                  Fees (USD)
                </th>
                <th className="text-right text-xs text-slate-500 font-medium pb-2 px-3">
                  Profit (USD)
                </th>
                <th className="text-right text-xs text-slate-500 font-medium pb-2 px-3">
                  Margin
                </th>
                <th className="text-right text-xs text-slate-500 font-medium pb-2 pl-3">
                  Break-even
                </th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => {
                const isBest = r.profitUSD === maxProfitUSD;
                const isNonUSD = r.currency !== "USD";
                return (
                  <tr
                    key={r.platform}
                    className={`border-b border-white/5 last:border-0 ${
                      isBest ? "bg-emerald-500/5" : ""
                    }`}
                  >
                    <td className="py-3 pr-4">
                      <span className="flex items-center gap-2 text-white font-medium">
                        <span>{ICONS[r.platform]}</span>
                        {MARKETPLACE_LABELS[r.platform]}
                        {isBest && (
                          <span className="text-xs text-emerald-400 font-semibold">★</span>
                        )}
                        {isNonUSD && (
                          <span className="text-xs text-slate-600 font-normal">
                            ({r.currency})
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-red-400">
                      {r.totalFeesUSD > 0 ? `−${fmtUSD(r.totalFeesUSD)}` : fmtUSD(0)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      <span
                        className={`font-semibold ${
                          r.profitUSD >= 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {r.profitUSD >= 0 ? "" : "−"}
                        {fmtUSD(Math.abs(r.profitUSD))}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      <span
                        className={
                          r.profitUSD >= 0 ? "text-emerald-400" : "text-red-400"
                        }
                      >
                        {r.profitMargin.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 pl-3 text-right font-mono text-slate-300">
                      {formatCurrency(r.breakEvenPrice, r.currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-700 mt-3">
          Default rates used: Etsy $0.20 listing, eBay 13.25% FVF, Shopee BR 14% commission, Subito no promotion.
          EUR/BRL profit converted to USD at 1 USD = €0.92 / R$5.10.
        </p>
      </div>
    </div>
  );
}
