const platforms = [
  {
    name: "Etsy",
    icon: "🛍",
    color: "from-orange-500/20 to-orange-600/5",
    border: "border-orange-500/20",
    fees: [
      { label: "Listing fee", value: "$0.20", note: "per item, charged on posting and on each sale renewal" },
      { label: "Transaction fee", value: "6.5%", note: "of sale price + shipping charged to buyer" },
      { label: "Payment processing", value: "3% + $0.25", note: "via Etsy Payments (per transaction)" },
      { label: "Offsite Ads", value: "12–15%", note: "only when buyer found you via an Etsy ad (optional program)" },
    ],
    tip: "Etsy's fees stack on the total (item + shipping), so offering high-priced shipping can raise your fee base. Build the listing fee into your item price — it's easy to forget.",
  },
  {
    name: "Poshmark",
    icon: "👗",
    color: "from-red-500/20 to-red-600/5",
    border: "border-red-500/20",
    fees: [
      { label: "Sales under $15", value: "$2.95", note: "flat fee regardless of exact price" },
      { label: "Sales $15 and over", value: "20%", note: "of the sale price — no extra payment processing fee" },
      { label: "Buyer shipping", value: "$7.97", note: "paid by buyer directly; Poshmark provides the prepaid label" },
    ],
    tip: "The jump from $2.95 to 20% at $14.99 → $15.00 is significant. A $14.50 item keeps $11.55 profit; at $15.00 you keep $12.00 — so pricing just over $15 can be counterproductive if your margin is thin.",
  },
  {
    name: "Mercari",
    icon: "📦",
    color: "from-red-400/20 to-red-500/5",
    border: "border-red-400/20",
    fees: [
      { label: "Selling fee", value: "10%", note: "of the item listing price" },
      { label: "Payment processing", value: "2.9% + $0.30", note: "applied to the total transaction (item + shipping)" },
      { label: "Listing fee", value: "$0", note: "free to list — no listing renewal fees" },
    ],
    tip: "Mercari's combined fee rate is ~12.9% plus $0.30 fixed — lower than Poshmark for high-value items. Mercari also allows sellers to set their own shipping price, so factoring in accurate shipping costs is crucial.",
  },
  {
    name: "Depop",
    icon: "✨",
    color: "from-pink-500/20 to-pink-600/5",
    border: "border-pink-500/20",
    fees: [
      { label: "Selling fee", value: "10%", note: "of item price" },
      { label: "Payment processing", value: "2.9% + $0.30", note: "via Depop Payments (Stripe)" },
      { label: "Listing fee", value: "$0", note: "free to list" },
    ],
    tip: "Depop's fee structure mirrors Mercari. Their buyer demographic skews Gen Z and secondhand fashion, so styling your photos and using aesthetic-forward titles can dramatically improve conversion rates.",
  },
  {
    name: "eBay",
    icon: "🔖",
    color: "from-blue-500/20 to-blue-600/5",
    border: "border-blue-500/20",
    fees: [
      { label: "Final value fee", value: "13.25%", note: "most categories, on item + shipping (includes payment processing)" },
      { label: "Clothing & accessories", value: "15%", note: "up to $2,000; 9% on amount over $2,000" },
      { label: "Insertion fee", value: "$0", note: "for the first 250 listings/month; $0.35 per listing after" },
      { label: "Promoted listings", value: "varies", note: "optional; typical sellers pay 2–5% additional" },
    ],
    tip: "eBay's final value fee already includes payment processing (Managed Payments), so there's no separate PayPal or Stripe charge. For low-cost items, the $0.30 payment processing you see on other platforms is replaced by eBay's percentage — which can be cheaper on items under ~$10.",
  },
];

export default function HowFeesWork() {
  return (
    <section className="px-4 py-20 sm:py-28" id="how-fees-work">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">
            Fee structures explained
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
            How selling fees work on each platform
          </h2>
          <p className="text-slate-400 mt-3 max-w-2xl mx-auto text-sm leading-relaxed">
            Every platform takes a different cut. Understanding the structure —
            not just the headline rate — is how experienced resellers price for
            profit.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl border ${p.border} bg-gradient-to-b ${p.color} p-5 flex flex-col gap-4`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl leading-none">{p.icon}</span>
                <h3 className="text-white font-semibold text-lg">{p.name}</h3>
              </div>

              <div className="flex flex-col gap-2">
                {p.fees.map((f) => (
                  <div key={f.label} className="flex flex-col gap-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">{f.label}</span>
                      <span className="text-xs font-mono font-semibold text-white bg-white/8 px-2 py-0.5 rounded-md">
                        {f.value}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">{f.note}</p>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-3 border-t border-white/8">
                <p className="text-xs text-slate-400 leading-relaxed">
                  <span className="text-slate-300 font-medium">💡 Tip: </span>
                  {p.tip}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-slate-700 mt-8">
          Fee rates last verified May 2025. Platforms update their fee schedules periodically —
          always check the official seller help center before pricing your items.
        </p>
      </div>
    </section>
  );
}
