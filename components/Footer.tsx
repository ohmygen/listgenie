"use client";

import { useState } from "react";

const platformLinks = [
  { label: "Etsy Seller Fees", href: "https://www.etsy.com/legal/fees/" },
  { label: "Poshmark Fees", href: "https://poshmark.com/fee-schedule" },
  { label: "Mercari Help", href: "https://www.mercari.com/us/help_center/" },
  { label: "Depop Terms", href: "https://www.depop.com/en/terms/" },
  { label: "eBay Fees", href: "https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: wire up to your email provider (Resend, Mailchimp, ConvertKit, etc.)
    setSubmitted(true);
  }

  return (
    <footer className="px-4 py-14 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">LG</span>
              </div>
              <span className="text-white font-semibold">ListGenie</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              Free profit and fee calculator for resellers. No signup. No
              tracking. Just math.
            </p>
          </div>

          {/* Official fee pages */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Official fee pages
            </h3>
            <ul className="flex flex-col gap-2">
              {platformLinks.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {l.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Email signup */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
              Fee change alerts
            </h3>
            <p className="text-sm text-slate-500 mb-4 leading-relaxed">
              We email subscribers when a major platform changes its fee
              structure.
            </p>

            {submitted ? (
              <div className="flex items-center gap-2 text-sm text-emerald-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                You&apos;re subscribed!
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors whitespace-nowrap"
                >
                  Alert me
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-8 border-t border-white/5">
          <p className="text-xs text-slate-700">
            © {new Date().getFullYear()} ListGenie. Free to use. Fee data is
            approximate — always verify with official platform pages before
            pricing.
          </p>
          <div className="flex gap-5">
            {["Privacy", "Terms", "Contact"].map((l) => (
              <a
                key={l}
                href="#"
                className="text-xs text-slate-700 hover:text-slate-400 transition-colors"
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
