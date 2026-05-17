"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import MarketplaceTabs from "./MarketplaceTabs";
import InputField from "./InputField";
import ResultsPanel from "./ResultsPanel";
import CompareAll from "./CompareAll";
import { saveToHistory, type HistoryEntry } from "./CalculationHistory";
import {
  type Marketplace,
  type Currency,
  type CalcResult,
  type CompareResult,
  MARKETPLACE_CURRENCY,
  CURRENCY_SYMBOL,
  EXCHANGE_RATES,
  calcEtsy,
  calcPoshmark,
  calcMercari,
  calcDepop,
  calcEbay,
  calcVinted,
  calcShopeeBR,
  calcSubito,
  calcAllPlatformsForCompare,
  calcReversePrice,
  formatCurrency,
  EBAY_CATEGORY_RATES,
  SHOPEE_BR_CATEGORIES,
  SUBITO_VETRINA_OPTIONS,
} from "@/lib/fees";

// ─── State ────────────────────────────────────────────────────────────────────

interface Inputs {
  salePrice: string;
  targetProfit: string;
  itemCost: string;
  shippingChargedToBuyer: string;
  shippingPaidBySeller: string;
  // Etsy
  etsyListingFee: string;
  etsyOffsiteAds: "0" | "12" | "15";
  // eBay
  ebayFeeRate: string;
  ebayInsertionFee: string;
  ebayCategory: number;
  // Shopee BR
  shopeeCategory: number;
  // Subito.it
  subitoVetrina: number;
}

const DEFAULT_INPUTS: Inputs = {
  salePrice: "",
  targetProfit: "",
  itemCost: "",
  shippingChargedToBuyer: "",
  shippingPaidBySeller: "",
  etsyListingFee: "0.20",
  etsyOffsiteAds: "0",
  ebayFeeRate: "13.25",
  ebayInsertionFee: "0.00",
  ebayCategory: 0,
  shopeeCategory: 0,
  subitoVetrina: 0,
};

function n(val: string): number {
  const p = parseFloat(val);
  return isNaN(p) || p < 0 ? 0 : p;
}

function hasData(inputs: Inputs): boolean {
  return n(inputs.salePrice) > 0;
}

function hasReverseData(inputs: Inputs): boolean {
  return n(inputs.itemCost) > 0 || n(inputs.targetProfit) > 0;
}

// ─── URL encoding ─────────────────────────────────────────────────────────────

function encodeToURL(tab: Marketplace, inputs: Inputs, mode: "normal" | "reverse"): string {
  const p = new URLSearchParams();
  p.set("t", tab);
  if (mode === "reverse") p.set("md", "r");
  if (mode === "normal" && inputs.salePrice) p.set("sp", inputs.salePrice);
  if (mode === "reverse" && inputs.targetProfit) p.set("tp", inputs.targetProfit);
  if (inputs.itemCost) p.set("ic", inputs.itemCost);
  if (inputs.shippingChargedToBuyer) p.set("sc", inputs.shippingChargedToBuyer);
  if (inputs.shippingPaidBySeller) p.set("ss", inputs.shippingPaidBySeller);
  if (inputs.etsyListingFee !== "0.20") p.set("elf", inputs.etsyListingFee);
  if (inputs.etsyOffsiteAds !== "0") p.set("eoa", inputs.etsyOffsiteAds);
  if (inputs.ebayFeeRate !== "13.25") p.set("efr", inputs.ebayFeeRate);
  if (inputs.ebayInsertionFee !== "0.00") p.set("eif", inputs.ebayInsertionFee);
  if (inputs.ebayCategory !== 0) p.set("ebc", String(inputs.ebayCategory));
  if (inputs.shopeeCategory !== 0) p.set("shc", String(inputs.shopeeCategory));
  if (inputs.subitoVetrina !== 0) p.set("svt", String(inputs.subitoVetrina));
  return p.toString();
}

function decodeFromURL(
  search: string
): { tab: Marketplace; inputs: Partial<Inputs>; mode: "normal" | "reverse" } | null {
  const p = new URLSearchParams(search);
  const t = p.get("t");
  if (!t) return null;
  const mode: "normal" | "reverse" = p.get("md") === "r" ? "reverse" : "normal";
  const inputs: Partial<Inputs> = {};
  if (p.get("sp")) inputs.salePrice = p.get("sp")!;
  if (p.get("tp")) inputs.targetProfit = p.get("tp")!;
  if (p.get("ic")) inputs.itemCost = p.get("ic")!;
  if (p.get("sc")) inputs.shippingChargedToBuyer = p.get("sc")!;
  if (p.get("ss")) inputs.shippingPaidBySeller = p.get("ss")!;
  if (p.get("elf")) inputs.etsyListingFee = p.get("elf")!;
  if (p.get("eoa")) inputs.etsyOffsiteAds = p.get("eoa") as "0" | "12" | "15";
  if (p.get("efr")) inputs.ebayFeeRate = p.get("efr")!;
  if (p.get("eif")) inputs.ebayInsertionFee = p.get("eif")!;
  if (p.get("ebc")) inputs.ebayCategory = parseInt(p.get("ebc")!);
  if (p.get("shc")) inputs.shopeeCategory = parseInt(p.get("shc")!);
  if (p.get("svt")) inputs.subitoVetrina = parseInt(p.get("svt")!);
  return { tab: t as Marketplace, inputs, mode };
}

// ─── Currency selector ────────────────────────────────────────────────────────

const CURRENCY_DEFAULT_TAB: Record<Currency, Marketplace> = {
  USD: "etsy",
  EUR: "vinted",
  BRL: "shopee_br",
};

const CURRENCIES: Currency[] = ["USD", "EUR", "BRL"];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Calculator() {
  const [tab, setTab] = useState<Marketplace>("etsy");
  const [mode, setMode] = useState<"normal" | "reverse">("normal");
  const [activeCurrency, setActiveCurrency] = useState<Currency>("USD");
  const [inputs, setInputs] = useState<Inputs>(DEFAULT_INPUTS);
  const [showCompare, setShowCompare] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const didReadURL = useRef(false);

  // Read URL params on mount and pre-fill state
  useEffect(() => {
    if (!window.location.search) return;
    const decoded = decodeFromURL(window.location.search);
    if (!decoded) return;
    setTab(decoded.tab);
    setActiveCurrency(MARKETPLACE_CURRENCY[decoded.tab]);
    setMode(decoded.mode);
    setInputs((prev) => ({ ...prev, ...decoded.inputs }));
    didReadURL.current = true;
  }, []);

  // Keep URL in sync with state
  useEffect(() => {
    const qs = encodeToURL(tab, inputs, mode);
    window.history.replaceState({}, "", `?${qs}`);
  }, [tab, inputs, mode]);

  function set(key: keyof Inputs) {
    return (val: string) => setInputs((prev) => ({ ...prev, [key]: val }));
  }

  function handleTabChange(m: Marketplace) {
    setTab(m);
    setActiveCurrency(MARKETPLACE_CURRENCY[m]);
  }

  function handleCurrencyClick(c: Currency) {
    const newTab = CURRENCY_DEFAULT_TAB[c];
    setTab(newTab);
    setActiveCurrency(c);
  }

  function handleEbayCategoryChange(idx: number) {
    setInputs((prev) => ({
      ...prev,
      ebayCategory: idx,
      ebayFeeRate: String(EBAY_CATEGORY_RATES[idx].rate),
    }));
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // fallback — URL is already in address bar
    }
  }

  const sym = CURRENCY_SYMBOL[activeCurrency];
  const isLastEbayOption = inputs.ebayCategory === EBAY_CATEGORY_RATES.length - 1;

  // ─── Live calculation (normal mode) ───────────────────────────────────────
  const result = useMemo<CalcResult | null>(() => {
    if (mode !== "normal" || !hasData(inputs)) return null;
    const shared = {
      salePrice: n(inputs.salePrice),
      itemCost: n(inputs.itemCost),
      shippingChargedToBuyer: n(inputs.shippingChargedToBuyer),
      shippingPaidBySeller: n(inputs.shippingPaidBySeller),
    };
    switch (tab) {
      case "etsy":
        return calcEtsy({
          ...shared,
          listingFee: n(inputs.etsyListingFee),
          offsiteAdsRate: parseFloat(inputs.etsyOffsiteAds) / 100,
        });
      case "poshmark":
        return calcPoshmark(shared);
      case "mercari":
        return calcMercari(shared);
      case "depop":
        return calcDepop(shared);
      case "ebay":
        return calcEbay({
          ...shared,
          fvfRate: n(inputs.ebayFeeRate),
          insertionFee: n(inputs.ebayInsertionFee),
        });
      case "vinted":
        return calcVinted(shared);
      case "shopee_br":
        return calcShopeeBR({
          ...shared,
          categoryRate: SHOPEE_BR_CATEGORIES[inputs.shopeeCategory].rate,
        });
      case "subito":
        return calcSubito({
          ...shared,
          vetrinaFee: SUBITO_VETRINA_OPTIONS[inputs.subitoVetrina].fee,
        });
    }
  }, [mode, tab, inputs]);

  // ─── Live calculation (reverse mode) ──────────────────────────────────────
  const reversePrice = useMemo<number | null>(() => {
    if (mode !== "reverse") return null;
    if (!hasReverseData(inputs)) return null;
    return calcReversePrice(
      tab,
      n(inputs.itemCost),
      n(inputs.shippingPaidBySeller),
      n(inputs.targetProfit)
    );
  }, [mode, tab, inputs.itemCost, inputs.shippingPaidBySeller, inputs.targetProfit]);

  const compareResults = useMemo<CompareResult[]>(() => {
    if (!showCompare || mode !== "normal" || !hasData(inputs)) return [];
    return calcAllPlatformsForCompare(
      {
        salePrice: n(inputs.salePrice),
        itemCost: n(inputs.itemCost),
        shippingChargedToBuyer: n(inputs.shippingChargedToBuyer),
        shippingPaidBySeller: n(inputs.shippingPaidBySeller),
      },
      activeCurrency
    );
  }, [showCompare, mode, inputs, activeCurrency]);

  // ─── Debounced history save ────────────────────────────────────────────────
  const historyIdRef = useRef<string>(`${tab}-${mode}-${Date.now()}`);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // New history entry when platform or mode changes
  useEffect(() => {
    historyIdRef.current = `${tab}-${mode}-${Date.now()}`;
  }, [tab, mode]);

  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    if (mode === "normal") {
      if (!result || n(inputs.salePrice) <= 0 || n(inputs.itemCost) <= 0) return;
      const captured: HistoryEntry = {
        id: historyIdRef.current,
        platform: tab,
        mode: "normal",
        salePrice: n(inputs.salePrice),
        itemCost: n(inputs.itemCost),
        netProfit: result.profit,
        marginPercent: result.profitMargin,
        timestamp: Date.now(),
      };
      saveTimerRef.current = setTimeout(() => saveToHistory(captured), 1000);
    } else {
      if (reversePrice === null) return;
      const sp = reversePrice;
      const tp = n(inputs.targetProfit);
      const ic = n(inputs.itemCost);
      if (ic <= 0 && tp <= 0) return;
      const captured: HistoryEntry = {
        id: historyIdRef.current,
        platform: tab,
        mode: "reverse",
        salePrice: sp,
        itemCost: ic,
        netProfit: tp,
        marginPercent: sp > 0 ? (tp / sp) * 100 : 0,
        timestamp: Date.now(),
      };
      saveTimerRef.current = setTimeout(() => saveToHistory(captured), 1000);
    }

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [mode, result, reversePrice, tab, inputs.salePrice, inputs.itemCost, inputs.targetProfit]);

  // ─── Shipping field hint text ──────────────────────────────────────────────
  const shippingChargedHint =
    tab === "poshmark"
      ? `Leave ${sym}0 — Poshmark charges buyer ${sym}7.97 directly`
      : tab === "vinted"
      ? `Leave ${sym}0 — buyer pays Vinted shipping label directly`
      : `Enter ${sym}0 if you offer free shipping`;

  // ─── Platform-specific info banners ───────────────────────────────────────
  const platformNote: Record<string, React.ReactNode> = {
    poshmark: (
      <>
        <strong className="text-indigo-300">Poshmark fees:</strong> Flat $2.95 under $15,
        20% at $15+. Buyer pays $7.97 shipping directly — use $0 in shipping fields
        unless you offer free shipping.
      </>
    ),
    depop: (
      <>
        <strong className="text-indigo-300">Depop fees:</strong> 10% selling fee + 2.9% +
        $0.30 payment processing. Verify current rates at{" "}
        <span className="text-slate-400">depop.com/en/terms</span> — fees change
        periodically.
      </>
    ),
    mercari: (
      <>
        <strong className="text-indigo-300">Mercari fees:</strong> 10% selling fee on item
        price + 2.9% + $0.30 payment processing on total. No listing fees.
      </>
    ),
    vinted: (
      <>
        <strong className="text-indigo-300">Vinted:</strong> You pay zero commission.
        The buyer pays a protection fee (5% + €0.70) on top of your price — it&apos;s
        shown informationally in results. Vinted provides prepaid shipping labels paid by
        the buyer; enter €0 for shipping unless you arrange your own.
      </>
    ),
    shopee_br: (
      <>
        <strong className="text-indigo-300">Shopee Brasil:</strong> Commission varies by
        category (Electronics 12%, Fashion 16%, General 14%) + 2.49% + R$0.49 payment
        processing. All amounts in BRL.
      </>
    ),
    subito: (
      <>
        <strong className="text-indigo-300">Subito.it:</strong> Standard listings are
        free with no commission. The optional Vetrina promotion is a one-time cost that
        boosts visibility — toggle it on/off below to see the impact on your profit. All
        amounts in EUR.
      </>
    ),
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="glass-strong rounded-2xl p-5 sm:p-7 shadow-2xl shadow-black/30">

        {/* ── Top bar: mode toggle + currency selector ── */}
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          {/* Mode toggle */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-white/4 border border-white/8">
            {(["normal", "reverse"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-150 ${
                  mode === m
                    ? "bg-indigo-600 text-white shadow shadow-indigo-500/30"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Currency selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600">Currency</span>
            <div className="flex gap-1">
              {CURRENCIES.map((c) => {
                const isActive = activeCurrency === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleCurrencyClick(c)}
                    title={`Switch to ${c} platforms`}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all duration-150 ${
                      isActive
                        ? "bg-indigo-600 text-white shadow shadow-indigo-500/30"
                        : "text-slate-500 bg-white/4 hover:bg-white/8 hover:text-slate-300"
                    }`}
                  >
                    {CURRENCY_SYMBOL[c]} {c}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mb-6">
          <MarketplaceTabs active={tab} onChange={handleTabChange} />
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* ── Left: inputs ── */}
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest -mb-1">
              {mode === "reverse" ? "Your Target" : "Your Numbers"}
            </p>

            {mode === "normal" ? (
              <InputField
                id="salePrice"
                label="Sale price"
                value={inputs.salePrice}
                onChange={set("salePrice")}
                prefix={sym}
                helpText="The price your buyer pays for the item"
              />
            ) : (
              <InputField
                id="targetProfit"
                label="Target net profit"
                value={inputs.targetProfit}
                onChange={set("targetProfit")}
                prefix={sym}
                helpText="How much you want to keep after all fees and costs"
              />
            )}

            <InputField
              id="itemCost"
              label="Item cost"
              value={inputs.itemCost}
              onChange={set("itemCost")}
              prefix={sym}
              helpText="What you paid to source or make this item"
            />

            {mode === "normal" && (
              <InputField
                id="shippingChargedToBuyer"
                label="Shipping charged to buyer"
                value={inputs.shippingChargedToBuyer}
                onChange={set("shippingChargedToBuyer")}
                prefix={sym}
                helpText={shippingChargedHint}
              />
            )}

            <InputField
              id="shippingPaidBySeller"
              label="Shipping you pay"
              value={inputs.shippingPaidBySeller}
              onChange={set("shippingPaidBySeller")}
              prefix={sym}
              helpText="Your actual cost to ship the package"
            />

            {/* Platform-specific options — normal mode only */}
            {mode === "normal" && (
              <>
                {/* ── Etsy options ── */}
                {tab === "etsy" && (
                  <>
                    <div className="border-t border-white/8 pt-3 -mb-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                        Etsy Options
                      </p>
                    </div>
                    <InputField
                      id="etsyListingFee"
                      label="Listing fee"
                      value={inputs.etsyListingFee}
                      onChange={set("etsyListingFee")}
                      prefix="$"
                      helpText="$0.20 per item (renewed on each sale)"
                    />
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-slate-400">Offsite Ads fee</label>
                      <select
                        value={inputs.etsyOffsiteAds}
                        onChange={(e) =>
                          setInputs((p) => ({
                            ...p,
                            etsyOffsiteAds: e.target.value as "0" | "12" | "15",
                          }))
                        }
                        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                      >
                        <option value="0" className="bg-slate-900">Not applicable (0%)</option>
                        <option value="15" className="bg-slate-900">15% — under $10k/yr revenue</option>
                        <option value="12" className="bg-slate-900">12% — over $10k/yr revenue</option>
                      </select>
                      <p className="text-xs text-slate-600">Only if buyer found you via an Offsite Ad</p>
                    </div>
                  </>
                )}

                {/* ── eBay options ── */}
                {tab === "ebay" && (
                  <>
                    <div className="border-t border-white/8 pt-3 -mb-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                        eBay Options
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-slate-400">Category</label>
                      <select
                        value={inputs.ebayCategory}
                        onChange={(e) => handleEbayCategoryChange(parseInt(e.target.value))}
                        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                      >
                        {EBAY_CATEGORY_RATES.map((c, i) => (
                          <option key={i} value={i} className="bg-slate-900">
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <InputField
                      id="ebayFeeRate"
                      label="Final value fee rate"
                      value={inputs.ebayFeeRate}
                      onChange={set("ebayFeeRate")}
                      suffix="%"
                      step={0.01}
                      disabled={!isLastEbayOption}
                      helpText={isLastEbayOption ? "Enter a custom rate" : "Auto-set by category"}
                    />
                    <InputField
                      id="ebayInsertionFee"
                      label="Insertion fee"
                      value={inputs.ebayInsertionFee}
                      onChange={set("ebayInsertionFee")}
                      prefix="$"
                      helpText="$0 for first 250 listings/month; $0.35 after"
                    />
                  </>
                )}

                {/* ── Shopee BR options ── */}
                {tab === "shopee_br" && (
                  <>
                    <div className="border-t border-white/8 pt-3 -mb-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                        Shopee Options
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-slate-400">Product category</label>
                      <select
                        value={inputs.shopeeCategory}
                        onChange={(e) =>
                          setInputs((p) => ({ ...p, shopeeCategory: parseInt(e.target.value) }))
                        }
                        className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                      >
                        {SHOPEE_BR_CATEGORIES.map((c, i) => (
                          <option key={i} value={i} className="bg-slate-900">
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-slate-600">Sets the commission rate</p>
                    </div>
                  </>
                )}

                {/* ── Subito options ── */}
                {tab === "subito" && (
                  <>
                    <div className="border-t border-white/8 pt-3 -mb-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                        Subito Options
                      </p>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-slate-400">
                        Vetrina promotion
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {SUBITO_VETRINA_OPTIONS.map((opt, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setInputs((p) => ({ ...p, subitoVetrina: i }))}
                            className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all duration-100 ${
                              inputs.subitoVetrina === i
                                ? "bg-indigo-600/30 border-indigo-500/50 text-white"
                                : "bg-white/4 border-white/8 text-slate-400 hover:bg-white/8 hover:text-slate-300"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-slate-600">
                        One-time promotion cost — see how it impacts your break-even
                      </p>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Platform note banner (normal mode only) */}
            {mode === "normal" && platformNote[tab] && (
              <div className="rounded-xl bg-indigo-500/8 border border-indigo-500/20 px-3 py-2.5 text-xs text-slate-400 leading-relaxed">
                {platformNote[tab]}
              </div>
            )}

            {/* Reverse mode note */}
            {mode === "reverse" && (
              <div className="rounded-xl bg-indigo-500/8 border border-indigo-500/20 px-3 py-2.5 text-xs text-slate-400 leading-relaxed">
                <strong className="text-indigo-300">Reverse calculator:</strong> Uses standard
                platform rates to find the minimum price you must list at. Shipping charged to
                buyer is assumed $0.
              </div>
            )}

            {/* Exchange rate disclaimer for non-USD platforms */}
            {activeCurrency !== "USD" && (
              <div className="rounded-xl bg-white/4 border border-white/8 px-3 py-2 text-xs text-slate-600 leading-relaxed">
                Rates approximate: 1 USD = €{EXCHANGE_RATES.EUR} / R${EXCHANGE_RATES.BRL}.
                {mode === "normal" && " Used for Compare All normalisation only — your inputs are in " + activeCurrency + "."}
              </div>
            )}
          </div>

          {/* ── Right: results ── */}
          <div className="flex flex-col gap-3">
            {mode === "normal" ? (
              result ? (
                <ResultsPanel result={result} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[240px] rounded-2xl border border-dashed border-white/10 bg-white/2 text-center px-6">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-3">
                    <svg
                      className="w-5 h-5 text-indigo-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-slate-500">Enter a sale price to see your profit</p>
                  <p className="text-xs text-slate-700 mt-1">Results update instantly as you type</p>
                </div>
              )
            ) : (
              /* Reverse mode output */
              <div className="flex flex-col gap-3 animate-fade-in">
                <div className="glass rounded-2xl p-5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                    Minimum Sale Price
                  </p>
                  {reversePrice !== null ? (
                    <>
                      <div className="flex items-center gap-3 flex-wrap mb-3">
                        <span className="text-4xl font-bold font-mono text-white tracking-tight">
                          {formatCurrency(reversePrice, activeCurrency)}
                        </span>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 font-medium">
                          To hit your goal
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">
                        List at this price or above to hit your profit goal.
                      </p>
                      <div className="mt-4 pt-4 border-t border-white/8 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">Your item cost</span>
                          <span className="text-xs font-mono text-slate-300">
                            {formatCurrency(n(inputs.itemCost), activeCurrency)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">Shipping you pay</span>
                          <span className="text-xs font-mono text-slate-300">
                            {formatCurrency(n(inputs.shippingPaidBySeller), activeCurrency)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">Target net profit</span>
                          <span className="text-xs font-mono text-emerald-400">
                            {formatCurrency(n(inputs.targetProfit), activeCurrency)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-white/8 pt-2 mt-1">
                          <span className="text-xs text-slate-500">Platform fees (est.)</span>
                          <span className="text-xs font-mono text-red-400">
                            −{formatCurrency(
                              Math.max(0, reversePrice - n(inputs.itemCost) - n(inputs.shippingPaidBySeller) - n(inputs.targetProfit)),
                              activeCurrency
                            )}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center min-h-[160px] text-center">
                      <p className="text-sm text-slate-500">Enter your item cost or target profit</p>
                      <p className="text-xs text-slate-700 mt-1">We&apos;ll calculate the minimum listing price</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom action bar ── */}
        <div className="mt-5 pt-5 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600 text-center sm:text-left">
            {mode === "normal"
              ? "Compare profit across all 8 platforms · Share results via URL"
              : "Switch to Normal mode to compare all platforms"}
          </p>
          <div className="flex items-center gap-2">
            {/* Copy link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className={`
                inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                border transition-all duration-150
                ${
                  linkCopied
                    ? "bg-emerald-600/20 border-emerald-500/40 text-emerald-400"
                    : "bg-white/4 border-white/8 text-slate-500 hover:bg-white/8 hover:text-slate-300 hover:border-white/15"
                }
              `}
            >
              {linkCopied ? (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
                    />
                  </svg>
                  Copy link
                </>
              )}
            </button>

            {/* Compare all — normal mode only */}
            {mode === "normal" && (
              <button
                type="button"
                onClick={() => setShowCompare((v) => !v)}
                disabled={!hasData(inputs)}
                className={`
                  inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                  transition-all duration-150 border whitespace-nowrap
                  ${
                    hasData(inputs)
                      ? showCompare
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20 hover:text-white"
                      : "bg-white/3 border-white/5 text-slate-700 cursor-not-allowed"
                  }
                `}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
                  />
                </svg>
                {showCompare ? "Hide comparison" : "Compare all platforms"}
              </button>
            )}
          </div>
        </div>

        {/* Compare panel */}
        {mode === "normal" && showCompare && <CompareAll results={compareResults} />}
      </div>
    </div>
  );
}
