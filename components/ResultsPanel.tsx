"use client";

import { type CalcResult, formatCurrency } from "@/lib/fees";
import { useAnimatedNumber } from "@/lib/useAnimatedNumber";

type MarginTier = "loss" | "poor" | "fair" | "good";

function getMarginTier(profit: number, margin: number): MarginTier {
  if (profit < 0) return "loss";
  if (margin < 10) return "poor";
  if (margin < 25) return "fair";
  return "good";
}

const TIER_VALUE_COLOR: Record<MarginTier, string> = {
  loss: "text-red-500",
  poor: "text-red-400",
  fair: "text-amber-400",
  good: "text-emerald-400",
};

const TIER_CARD_BG: Record<MarginTier, string> = {
  loss: "bg-red-950/30",
  poor: "bg-red-950/30",
  fair: "bg-amber-950/30",
  good: "bg-emerald-950/30",
};

const TIER_BADGE: Record<MarginTier, string> = {
  loss: "bg-red-500/15 text-red-400 border-red-500/25",
  poor: "bg-red-400/15 text-red-400 border-red-400/25",
  fair: "bg-amber-400/15 text-amber-400 border-amber-400/25",
  good: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
};

const TIER_LABEL: Record<MarginTier, string> = {
  loss: "Loss",
  poor: "Poor",
  fair: "Fair",
  good: "Good",
};

interface Props {
  result: CalcResult;
}

export default function ResultsPanel({ result }: Props) {
  const { feeLineItems, totalFees, grossRevenue, profit, profitMargin, breakEvenPrice, currency } = result;
  const fmt = (n: number) => formatCurrency(n, currency);

  const tier = getMarginTier(profit, profitMargin);
  const valueColor = TIER_VALUE_COLOR[tier];

  const animatedProfit = useAnimatedNumber(profit);
  const animatedFees = useAnimatedNumber(totalFees);
  const animatedMargin = useAnimatedNumber(profitMargin);

  const sellerFees = feeLineItems.filter((f) => !f.paidByBuyer);
  const buyerFees = feeLineItems.filter((f) => f.paidByBuyer);

  return (
    <div className="flex flex-col gap-3 animate-fade-in">
      {/* Fee breakdown */}
      <div className="glass rounded-2xl p-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
          Fee Breakdown
        </p>
        <div className="flex flex-col gap-2">
          {sellerFees.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{item.label}</span>
              <span className="text-sm font-mono text-red-400">
                {item.amount === 0 ? "—" : `−${fmt(item.amount)}`}
              </span>
            </div>
          ))}

          {buyerFees.length > 0 && (
            <div className="mt-1 pt-2 border-t border-white/6">
              {buyerFees.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 italic">{item.label}</span>
                  <span className="text-xs font-mono text-slate-600 italic">
                    {fmt(item.amount)} buyer pays
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-white/8 pt-2 mt-1 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Total fees (you)</span>
            <span className="text-sm font-mono font-semibold text-red-400">
              {totalFees === 0 ? fmt(0) : `−${fmt(Math.abs(animatedFees))}`}
            </span>
          </div>
        </div>
      </div>

      {/* Profit summary */}
      <div className={`glass rounded-2xl p-5 transition-colors duration-500 ${TIER_CARD_BG[tier]}`}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            Your Results
          </p>
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${TIER_BADGE[tier]}`}>
            {TIER_LABEL[tier]}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <Row label="Gross revenue" value={fmt(grossRevenue)} muted />
          <Row
            label="Platform fees"
            value={totalFees === 0 ? fmt(0) : `−${fmt(Math.abs(animatedFees))}`}
            negative={totalFees > 0}
          />

          <div className="border-t border-white/8 pt-2 mt-1 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Net profit</span>
              <span className={`text-lg font-bold font-mono ${valueColor}`}>
                {profit >= 0 ? "" : "−"}
                {fmt(Math.abs(animatedProfit))}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Profit margin</span>
              <span className={`text-sm font-mono font-semibold ${valueColor}`}>
                {Math.abs(animatedMargin).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Break-even */}
      <div className="glass rounded-2xl p-5">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
          Break-even Price
        </p>
        <p className="text-xs text-slate-600 mb-3">
          Minimum sale price to cover all costs with zero profit.
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-2xl font-bold font-mono text-white">
            {fmt(breakEvenPrice)}
          </span>
          {grossRevenue > 0 && (
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                grossRevenue >= breakEvenPrice
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                  : "bg-red-500/15 text-red-400 border border-red-500/25"
              }`}
            >
              {grossRevenue >= breakEvenPrice
                ? `${fmt(grossRevenue - breakEvenPrice)} above`
                : `${fmt(breakEvenPrice - grossRevenue)} below`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  muted,
  negative,
}: {
  label: string;
  value: string;
  muted?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-400">{label}</span>
      <span
        className={`text-sm font-mono ${
          negative ? "text-red-400" : muted ? "text-slate-300" : "text-white"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
