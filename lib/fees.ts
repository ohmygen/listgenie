// Fee structures last verified May 2025 — always cross-check with each platform's
// seller help center before quoting specific numbers to customers.

export type Marketplace =
  | "etsy"
  | "poshmark"
  | "mercari"
  | "depop"
  | "ebay"
  | "vinted"
  | "shopee_br"
  | "subito";

export type Currency = "USD" | "EUR" | "BRL";

export const MARKETPLACE_LABELS: Record<Marketplace, string> = {
  etsy: "Etsy",
  poshmark: "Poshmark",
  mercari: "Mercari",
  depop: "Depop",
  ebay: "eBay",
  vinted: "Vinted",
  shopee_br: "Shopee BR",
  subito: "Subito.it",
};

export const MARKETPLACE_CURRENCY: Record<Marketplace, Currency> = {
  etsy: "USD",
  poshmark: "USD",
  mercari: "USD",
  depop: "USD",
  ebay: "USD",
  vinted: "EUR",
  shopee_br: "BRL",
  subito: "EUR",
};

export const CURRENCY_SYMBOL: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  BRL: "R$",
};

// Static rates: 1 USD = X units of currency
export const EXCHANGE_RATES: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  BRL: 5.10,
};

export function toUSD(amount: number, currency: Currency): number {
  return amount / EXCHANGE_RATES[currency];
}

export function formatCurrency(amount: number, currency: Currency): string {
  const sym = CURRENCY_SYMBOL[currency];
  const abs = Math.abs(amount);
  const str = abs.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount < 0 ? `-${sym}${str}` : `${sym}${str}`;
}

export interface FeeLineItem {
  label: string;
  amount: number;
  paidByBuyer?: boolean; // informational only — not deducted from seller net
}

export interface CalcResult {
  platform: Marketplace;
  currency: Currency;
  feeLineItems: FeeLineItem[];
  totalFees: number;
  grossRevenue: number;
  profit: number;
  profitMargin: number; // e.g. 42.5 means 42.5%
  breakEvenPrice: number;
}

export interface CompareResult extends CalcResult {
  profitUSD: number;
  totalFeesUSD: number;
}

// ─── Etsy ─────────────────────────────────────────────────────────────────────
// • Listing fee $0.20 (renewed on sale)
// • Transaction 6.5% of (item + shipping charged)
// • Payment processing 3% of (item + shipping) + $0.25
// • Offsite Ads 12–15% optional

export interface EtsyParams {
  salePrice: number;
  itemCost: number;
  shippingChargedToBuyer: number;
  shippingPaidBySeller: number;
  listingFee: number;
  offsiteAdsRate: number; // 0 | 0.12 | 0.15
}

export function calcEtsy(p: EtsyParams): CalcResult {
  const gross = p.salePrice + p.shippingChargedToBuyer;
  const transactionFee = gross * 0.065;
  const paymentFee = gross * 0.03 + 0.25;
  const offsiteAdsFee = gross * p.offsiteAdsRate;

  const feeLineItems: FeeLineItem[] = [
    { label: "Listing fee", amount: p.listingFee },
    { label: "Transaction fee (6.5%)", amount: transactionFee },
    { label: "Payment processing (3% + $0.25)", amount: paymentFee },
  ];
  if (p.offsiteAdsRate > 0) {
    feeLineItems.push({
      label: `Offsite Ads (${p.offsiteAdsRate * 100}%)`,
      amount: offsiteAdsFee,
    });
  }

  const totalFees = p.listingFee + transactionFee + paymentFee + offsiteAdsFee;
  const profit = gross - totalFees - p.itemCost - p.shippingPaidBySeller;
  const profitMargin = p.salePrice > 0 ? (profit / p.salePrice) * 100 : 0;
  const combinedRate = 0.065 + 0.03 + p.offsiteAdsRate;
  const beGross =
    (0.25 + p.listingFee + p.itemCost + p.shippingPaidBySeller) /
    (1 - combinedRate);
  const breakEvenPrice = Math.max(0, beGross - p.shippingChargedToBuyer);

  return { platform: "etsy", currency: "USD", feeLineItems, totalFees, grossRevenue: gross, profit, profitMargin, breakEvenPrice };
}

// ─── Poshmark ─────────────────────────────────────────────────────────────────
// • < $15: flat $2.95   |   ≥ $15: 20%

export interface PoshmarkParams {
  salePrice: number;
  itemCost: number;
  shippingChargedToBuyer: number;
  shippingPaidBySeller: number;
}

export function calcPoshmark(p: PoshmarkParams): CalcResult {
  const isFlat = p.salePrice < 15;
  const platformFee = isFlat ? 2.95 : p.salePrice * 0.20;
  const feeLineItems: FeeLineItem[] = [
    { label: isFlat ? "Platform fee (flat $2.95)" : "Commission (20%)", amount: platformFee },
  ];
  const totalFees = platformFee;
  const gross = p.salePrice + p.shippingChargedToBuyer;
  const profit = gross - totalFees - p.itemCost - p.shippingPaidBySeller;
  const profitMargin = p.salePrice > 0 ? (profit / p.salePrice) * 100 : 0;

  const base = p.itemCost + p.shippingPaidBySeller - p.shippingChargedToBuyer;
  const flatBE = base + 2.95;
  const pctBE = base / 0.80;
  const breakEvenPrice = Math.max(
    0,
    flatBE < 15 ? flatBE : pctBE >= 15 ? pctBE : 15
  );

  return { platform: "poshmark", currency: "USD", feeLineItems, totalFees, grossRevenue: gross, profit, profitMargin, breakEvenPrice };
}

// ─── Mercari ──────────────────────────────────────────────────────────────────
// • Selling fee 10% of item   |   Payment processing 2.9% of total + $0.30

export interface MercariParams {
  salePrice: number;
  itemCost: number;
  shippingChargedToBuyer: number;
  shippingPaidBySeller: number;
}

export function calcMercari(p: MercariParams): CalcResult {
  const gross = p.salePrice + p.shippingChargedToBuyer;
  const sellingFee = p.salePrice * 0.10;
  const paymentFee = gross * 0.029 + 0.30;
  const feeLineItems: FeeLineItem[] = [
    { label: "Selling fee (10%)", amount: sellingFee },
    { label: "Payment processing (2.9% + $0.30)", amount: paymentFee },
  ];
  const totalFees = sellingFee + paymentFee;
  const profit = gross - totalFees - p.itemCost - p.shippingPaidBySeller;
  const profitMargin = p.salePrice > 0 ? (profit / p.salePrice) * 100 : 0;
  const numerator =
    0.30 + p.itemCost + p.shippingPaidBySeller -
    p.shippingChargedToBuyer * (1 - 0.029);
  const breakEvenPrice = Math.max(0, numerator / (1 - 0.10 - 0.029));

  return { platform: "mercari", currency: "USD", feeLineItems, totalFees, grossRevenue: gross, profit, profitMargin, breakEvenPrice };
}

// ─── Depop ────────────────────────────────────────────────────────────────────
// • Selling fee 10%   |   Payment processing 2.9% of total + $0.30

export interface DepopParams {
  salePrice: number;
  itemCost: number;
  shippingChargedToBuyer: number;
  shippingPaidBySeller: number;
}

export function calcDepop(p: DepopParams): CalcResult {
  const gross = p.salePrice + p.shippingChargedToBuyer;
  const sellingFee = p.salePrice * 0.10;
  const paymentFee = gross * 0.029 + 0.30;
  const feeLineItems: FeeLineItem[] = [
    { label: "Selling fee (10%)", amount: sellingFee },
    { label: "Payment processing (2.9% + $0.30)", amount: paymentFee },
  ];
  const totalFees = sellingFee + paymentFee;
  const profit = gross - totalFees - p.itemCost - p.shippingPaidBySeller;
  const profitMargin = p.salePrice > 0 ? (profit / p.salePrice) * 100 : 0;
  const numerator =
    0.30 + p.itemCost + p.shippingPaidBySeller -
    p.shippingChargedToBuyer * (1 - 0.029);
  const breakEvenPrice = Math.max(0, numerator / (1 - 0.10 - 0.029));

  return { platform: "depop", currency: "USD", feeLineItems, totalFees, grossRevenue: gross, profit, profitMargin, breakEvenPrice };
}

// ─── eBay ─────────────────────────────────────────────────────────────────────
// • Final value fee (incl. managed payments) — varies by category
// • Insertion fee $0 for first 250/month, $0.35 after

export const EBAY_CATEGORY_RATES: { label: string; rate: number }[] = [
  { label: "Most categories (13.25%)", rate: 13.25 },
  { label: "Clothing & Accessories (15%)", rate: 15 },
  { label: "Books / Music / DVDs (14.95%)", rate: 14.95 },
  { label: "Jewelry & Watches (15%)", rate: 15 },
  { label: "Sporting Goods (13.25%)", rate: 13.25 },
  { label: "Musical Instruments (6.35%)", rate: 6.35 },
  { label: "Custom rate", rate: 13.25 },
];

export interface EbayParams {
  salePrice: number;
  itemCost: number;
  shippingChargedToBuyer: number;
  shippingPaidBySeller: number;
  fvfRate: number;
  insertionFee: number;
}

export function calcEbay(p: EbayParams): CalcResult {
  const gross = p.salePrice + p.shippingChargedToBuyer;
  const fvf = gross * (p.fvfRate / 100);
  const feeLineItems: FeeLineItem[] = [
    { label: `Final value fee (${p.fvfRate}%)`, amount: fvf },
  ];
  if (p.insertionFee > 0) {
    feeLineItems.push({ label: "Insertion fee", amount: p.insertionFee });
  }
  const totalFees = fvf + p.insertionFee;
  const profit = gross - totalFees - p.itemCost - p.shippingPaidBySeller;
  const profitMargin = p.salePrice > 0 ? (profit / p.salePrice) * 100 : 0;
  const rate = p.fvfRate / 100;
  const beGross = (p.insertionFee + p.itemCost + p.shippingPaidBySeller) / (1 - rate);
  const breakEvenPrice = Math.max(0, beGross - p.shippingChargedToBuyer);

  return { platform: "ebay", currency: "USD", feeLineItems, totalFees, grossRevenue: gross, profit, profitMargin, breakEvenPrice };
}

// ─── Vinted ───────────────────────────────────────────────────────────────────
// • Seller commission: 0%
// • Buyer pays protection fee: 5% + €0.70 (shown informational, not deducted)
// • Shipping: Vinted provides label paid by buyer — seller shipping cost usually €0

export interface VintedParams {
  salePrice: number;
  itemCost: number;
  shippingChargedToBuyer: number; // typically 0 — buyer pays Vinted shipping label
  shippingPaidBySeller: number;   // 0 when using Vinted labels; non-zero for own labels
}

export function calcVinted(p: VintedParams): CalcResult {
  const buyerProtectionFee = p.salePrice * 0.05 + 0.70;
  const feeLineItems: FeeLineItem[] = [
    { label: "Seller commission", amount: 0 },
    { label: `Buyer protection fee (5% + €0.70)`, amount: buyerProtectionFee, paidByBuyer: true },
  ];
  const totalFees = 0;
  const gross = p.salePrice + p.shippingChargedToBuyer;
  const profit = gross - p.itemCost - p.shippingPaidBySeller;
  const profitMargin = p.salePrice > 0 ? (profit / p.salePrice) * 100 : 0;
  const breakEvenPrice = Math.max(0, p.itemCost + p.shippingPaidBySeller - p.shippingChargedToBuyer);

  return { platform: "vinted", currency: "EUR", feeLineItems, totalFees, grossRevenue: gross, profit, profitMargin, breakEvenPrice };
}

// ─── Shopee Brazil ────────────────────────────────────────────────────────────
// • Commission: varies by category (Electronics 12%, Fashion 16%, General 14%)
// • Payment processing: 2.49% of total + R$0.49

export const SHOPEE_BR_CATEGORIES: { label: string; rate: number }[] = [
  { label: "General (14%)", rate: 14 },
  { label: "Electronics (12%)", rate: 12 },
  { label: "Fashion (16%)", rate: 16 },
];

export interface ShopeeBRParams {
  salePrice: number;
  itemCost: number;
  shippingChargedToBuyer: number;
  shippingPaidBySeller: number;
  categoryRate: number; // percentage, e.g. 14
}

export function calcShopeeBR(p: ShopeeBRParams): CalcResult {
  const gross = p.salePrice + p.shippingChargedToBuyer;
  const commissionFee = p.salePrice * (p.categoryRate / 100);
  const paymentFee = gross * 0.0249 + 0.49;
  const feeLineItems: FeeLineItem[] = [
    { label: `Commission (${p.categoryRate}%)`, amount: commissionFee },
    { label: "Payment processing (2.49% + R$0.49)", amount: paymentFee },
  ];
  const totalFees = commissionFee + paymentFee;
  const profit = gross - totalFees - p.itemCost - p.shippingPaidBySeller;
  const profitMargin = p.salePrice > 0 ? (profit / p.salePrice) * 100 : 0;
  const rateOnSale = p.categoryRate / 100 + 0.0249;
  const numerator =
    0.49 + p.itemCost + p.shippingPaidBySeller -
    p.shippingChargedToBuyer * (1 - 0.0249);
  const breakEvenPrice = Math.max(0, numerator / (1 - rateOnSale));

  return { platform: "shopee_br", currency: "BRL", feeLineItems, totalFees, grossRevenue: gross, profit, profitMargin, breakEvenPrice };
}

// ─── Subito.it ────────────────────────────────────────────────────────────────
// • Standard listing: free, no commission on sale price
// • Optional "Vetrina" promoted listing: €1.99 / €3.99 / €5.99 (one-off cost)

export const SUBITO_VETRINA_OPTIONS: { label: string; fee: number }[] = [
  { label: "No promotion (€0.00)", fee: 0 },
  { label: "Vetrina Base (€1.99)", fee: 1.99 },
  { label: "Vetrina Plus (€3.99)", fee: 3.99 },
  { label: "Vetrina Top (€5.99)", fee: 5.99 },
];

export interface SubitoParams {
  salePrice: number;
  itemCost: number;
  shippingChargedToBuyer: number;
  shippingPaidBySeller: number;
  vetrinaFee: number; // 0 | 1.99 | 3.99 | 5.99
}

export function calcSubito(p: SubitoParams): CalcResult {
  const gross = p.salePrice + p.shippingChargedToBuyer;
  const feeLineItems: FeeLineItem[] = [
    { label: "Seller commission", amount: 0 },
  ];
  if (p.vetrinaFee > 0) {
    feeLineItems.push({
      label: `Vetrina promotion (€${p.vetrinaFee.toFixed(2)})`,
      amount: p.vetrinaFee,
    });
  }
  const totalFees = p.vetrinaFee;
  const profit = gross - totalFees - p.itemCost - p.shippingPaidBySeller;
  const profitMargin = p.salePrice > 0 ? (profit / p.salePrice) * 100 : 0;
  const breakEvenPrice = Math.max(
    0,
    p.vetrinaFee + p.itemCost + p.shippingPaidBySeller - p.shippingChargedToBuyer
  );

  return { platform: "subito", currency: "EUR", feeLineItems, totalFees, grossRevenue: gross, profit, profitMargin, breakEvenPrice };
}

// ─── Reverse calculator ───────────────────────────────────────────────────────
// Returns the minimum sale price to achieve targetProfit after all fees.
// Uses default/standard rates for each platform. Rounds up to nearest $0.01.

export function calcReversePrice(
  platform: Marketplace,
  itemCost: number,
  shippingPaidBySeller: number,
  targetProfit: number
): number {
  const base = itemCost + shippingPaidBySeller + targetProfit;
  let raw: number;
  switch (platform) {
    case "etsy":
      raw = (base + 0.20 + 0.25) / (1 - 0.065 - 0.03);
      break;
    case "poshmark": {
      const flatResult = base + 2.95;
      raw = flatResult < 15 ? flatResult : base / 0.80;
      break;
    }
    case "mercari":
      raw = (base + 0.30) / (1 - 0.10 - 0.029);
      break;
    case "depop":
      raw = (base + 0.30) / (1 - 0.10 - 0.029);
      break;
    case "ebay":
      raw = (base + 0.30) / (1 - 0.1325 - 0.029);
      break;
    case "vinted":
      raw = base;
      break;
    case "shopee_br":
      raw = (base + 0.49) / (1 - 0.14 - 0.0249);
      break;
    case "subito":
      raw = base;
      break;
    default:
      raw = base;
  }
  return Math.ceil(raw * 100) / 100;
}

// ─── Compare-all helper ───────────────────────────────────────────────────────
export interface SharedParams {
  salePrice: number;
  itemCost: number;
  shippingChargedToBuyer: number;
  shippingPaidBySeller: number;
}

// Normalises user's inputs to USD, then re-denominates for each platform's
// native currency so the comparison table is apples-to-apples.
export function calcAllPlatformsForCompare(
  params: SharedParams,
  inputCurrency: Currency
): CompareResult[] {
  const rate = EXCHANGE_RATES[inputCurrency];

  // Normalise to USD
  const usd: SharedParams = {
    salePrice: params.salePrice / rate,
    itemCost: params.itemCost / rate,
    shippingChargedToBuyer: params.shippingChargedToBuyer / rate,
    shippingPaidBySeller: params.shippingPaidBySeller / rate,
  };

  const scaleToUSD = <T extends SharedParams>(base: T): T => ({
    ...base,
    salePrice: usd.salePrice,
    itemCost: usd.itemCost,
    shippingChargedToBuyer: usd.shippingChargedToBuyer,
    shippingPaidBySeller: usd.shippingPaidBySeller,
  });

  const toCurrency = (c: Currency): SharedParams => ({
    salePrice: usd.salePrice * EXCHANGE_RATES[c],
    itemCost: usd.itemCost * EXCHANGE_RATES[c],
    shippingChargedToBuyer: usd.shippingChargedToBuyer * EXCHANGE_RATES[c],
    shippingPaidBySeller: usd.shippingPaidBySeller * EXCHANGE_RATES[c],
  });

  const eur = toCurrency("EUR");
  const brl = toCurrency("BRL");

  const base: CalcResult[] = [
    calcEtsy(scaleToUSD({ ...usd, listingFee: 0.20, offsiteAdsRate: 0 })),
    calcPoshmark(usd),
    calcMercari(usd),
    calcDepop(usd),
    calcEbay(scaleToUSD({ ...usd, fvfRate: 13.25, insertionFee: 0 })),
    calcVinted(eur),
    calcSubito({ ...eur, vetrinaFee: 0 }),
    calcShopeeBR({ ...brl, categoryRate: 14 }),
  ];

  return base.map((r) => ({
    ...r,
    profitUSD: toUSD(r.profit, r.currency),
    totalFeesUSD: toUSD(r.totalFees, r.currency),
  }));
}
