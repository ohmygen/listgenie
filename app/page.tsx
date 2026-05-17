import Calculator from "@/components/Calculator";
import CalculationHistory from "@/components/CalculationHistory";
import AdBanner from "@/components/AdBanner";
import HowFeesWork from "@/components/HowFeesWork";
import AffiliateLinks from "@/components/AffiliateLinks";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-slate-950 overflow-x-hidden">
      {/* Ambient glow */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-1/3 -left-32 w-[500px] h-[500px] rounded-full bg-violet-700/8 blur-[100px]" />
        <div className="absolute top-2/3 -right-32 w-[400px] h-[400px] rounded-full bg-indigo-500/6 blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* ── Hero + calculator ────────────────────────── */}
        <section className="px-4 pt-16 pb-10 sm:pt-24 sm:pb-16">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-5 tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Free · No signup · Instant results
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[1.1] mb-4">
              Know your profit{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                before you sell.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-400 max-w-xl mx-auto leading-relaxed">
              Exact fee breakdowns and net profit for Etsy, Poshmark, Mercari,
              Depop, and eBay — updated for 2025.
            </p>
          </div>

          <Calculator />
        </section>

        {/* ── ADSENSE SLOT 1 ───────────────────────────── */}
        {/* Replace the AdBanner below with your actual Google AdSense <ins> tag */}
        <AdBanner slot="hero-below" />

        {/* ── Calculation history ──────────────────────── */}
        <section className="px-4 pb-6">
          <CalculationHistory />
        </section>

        {/* ── How fees work (SEO) ──────────────────────── */}
        <HowFeesWork />

        {/* ── Affiliate / recommended tools ───────────── */}
        <AffiliateLinks />

        {/* ── ADSENSE SLOT 2 ───────────────────────────── */}
        {/* Replace the AdBanner below with your actual Google AdSense <ins> tag */}
        <AdBanner slot="pre-footer" />

        {/* ── Footer ──────────────────────────────────── */}
        <Footer />
      </div>
    </main>
  );
}
