// Affiliate link section — replace each href="#" with your tracked affiliate URL.
// Each tool card has a data-affiliate-id attribute for easy identification.

const tools = [
  {
    id: "erank",
    name: "eRank",
    tagline: "Etsy SEO & keyword research",
    description:
      "Find high-traffic, low-competition keywords for Etsy. See what's trending, track your shop's rank, and spy on competitors' best-selling tags.",
    icon: "📈",
    iconBg: "bg-orange-500/20 border-orange-500/30",
    iconColor: "text-orange-400",
    // ↓ Replace with your eRank affiliate link
    href: "#",
    cta: "Try eRank free →",
  },
  {
    id: "pirateship",
    name: "Pirateship",
    tagline: "Discounted USPS & UPS labels",
    description:
      "Get up to 89% off USPS and UPS shipping rates. No monthly fees — pay only for the labels you buy. The #1 shipping tool for Poshmark and Mercari sellers.",
    icon: "🚢",
    iconBg: "bg-blue-500/20 border-blue-500/30",
    iconColor: "text-blue-400",
    // ↓ Replace with your Pirateship affiliate link
    href: "#",
    cta: "Save on shipping →",
  },
  {
    id: "canva",
    name: "Canva",
    tagline: "Product photos & listing graphics",
    description:
      "Remove backgrounds, create collage listing photos, add branded overlays, and design cohesive shop banners. Canva Pro's background remover alone is worth it.",
    icon: "🎨",
    iconBg: "bg-violet-500/20 border-violet-500/30",
    iconColor: "text-violet-400",
    // ↓ Replace with your Canva affiliate link
    href: "#",
    cta: "Start designing free →",
  },
  {
    id: "notion",
    name: "Notion",
    tagline: "Inventory & profit tracking",
    description:
      "Build a custom reseller dashboard to track sourcing costs, listing inventory, profit per item, and monthly P&L. Free templates available for reseller workflows.",
    icon: "📋",
    iconBg: "bg-slate-400/20 border-slate-400/30",
    iconColor: "text-slate-400",
    // ↓ Replace with your Notion affiliate link
    href: "#",
    cta: "Get Notion free →",
  },
];

export default function AffiliateLinks() {
  return (
    <section className="px-4 py-20 sm:py-24" id="recommended-tools">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">
            Tools we recommend
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
            Run a tighter reselling operation
          </h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto text-sm">
            The tools serious resellers use to source smarter, ship cheaper, and
            list faster.{" "}
            <span className="text-slate-600">
              Some links are affiliate links — we earn a small commission at no
              extra cost to you.
            </span>
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((tool) => (
            <a
              key={tool.id}
              href={tool.href}
              data-affiliate-id={tool.id}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="glass rounded-2xl p-5 flex flex-col gap-3 hover:bg-white/7 hover:border-white/15 transition-all duration-150 group"
            >
              <div
                className={`w-10 h-10 rounded-xl ${tool.iconBg} border flex items-center justify-center text-xl`}
              >
                {tool.icon}
              </div>

              <div>
                <h3 className="text-white font-semibold text-sm mb-0.5">
                  {tool.name}
                </h3>
                <p className="text-xs text-indigo-400 font-medium mb-2">
                  {tool.tagline}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="mt-auto pt-2">
                <span
                  className={`text-xs font-semibold ${tool.iconColor} group-hover:underline`}
                >
                  {tool.cta}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
