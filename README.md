# ListGenie — Reseller Profit & Fee Calculator

A fully static, no-backend profit calculator for resellers covering Etsy, Poshmark, Mercari, Depop, and eBay.

**Live features:**
- Per-platform fee breakdowns with exact line items
- Net profit, profit margin %, and break-even price — updating as you type
- Platform-specific options (Etsy listing fee, Offsite Ads; eBay category selector)
- "Compare all platforms" table that finds your most profitable marketplace
- AdSense placeholder slots (2 positions)
- Affiliate link section (4 tool cards with placeholder hrefs)
- SEO-optimized "How fees work" explainer section
- Footer with email signup placeholder and official fee page links

## Stack

- Next.js 14 (App Router, fully static)
- TypeScript
- Tailwind CSS + Geist font
- Zero backend, zero API keys, zero env vars

---

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No `.env` file needed — this is entirely client-side math.

---

## Deploying to Vercel

### Steps

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial deploy"
   git remote add origin https://github.com/YOUR_USERNAME/listgenie.git
   git push -u origin main
   ```

2. **Import in Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repo
   - Framework: **Next.js** (auto-detected)
   - No environment variables needed

3. **Deploy.** That's it.

Since there are no server routes or API calls, Vercel will export this as a fully static site.

---

## Customization

### Adding AdSense

Find the two `AdBanner` usages in `app/page.tsx`. The component renders a placeholder div. Replace the inner content in `components/AdBanner.tsx` with your actual `<ins>` tag from Google AdSense:

```tsx
// components/AdBanner.tsx — replace the placeholder div with:
<ins
  className="adsbygoogle"
  style={{ display: "block" }}
  data-ad-client="ca-pub-XXXXXXXXXXXXXXXXXX"
  data-ad-slot="XXXXXXXXXX"
  data-ad-format="auto"
  data-full-width-responsive="true"
/>
```

Remember to add the AdSense script to `app/layout.tsx` as well.

### Adding affiliate links

Open `components/AffiliateLinks.tsx`. Each tool card has a `href="#"` — replace with your affiliate URL. The `data-affiliate-id` attribute and `rel="sponsored"` are already in place.

### Updating fee rates

All fee logic lives in `lib/fees.ts`. Each platform has its own clearly labelled function. When a platform changes its rates, update the constants in that function.

### Adding email signup

`components/Footer.tsx` has a form that currently does nothing on submit. Wire it to your email provider (Resend, Mailchimp, ConvertKit, Beehiiv) by replacing the `handleSubmit` function.

---

## Project Structure

```
listgenie/
├── app/
│   ├── globals.css          # Global styles, Tailwind base, glassmorphism
│   ├── layout.tsx           # Root layout, metadata, Geist font
│   └── page.tsx             # Page composition (hero, calculator, sections)
├── components/
│   ├── Calculator.tsx       # Main stateful calculator (all tab logic)
│   ├── MarketplaceTabs.tsx  # Platform tab switcher
│   ├── InputField.tsx       # Reusable labeled number input
│   ├── ResultsPanel.tsx     # Fee breakdown + profit + break-even display
│   ├── CompareAll.tsx       # Cross-platform comparison table
│   ├── HowFeesWork.tsx      # SEO explainer section (static)
│   ├── AffiliateLinks.tsx   # Recommended tools with affiliate hrefs
│   ├── AdBanner.tsx         # AdSense placeholder slots
│   └── Footer.tsx           # Email signup + links
└── lib/
    └── fees.ts              # All fee calculation logic + break-even math
```

---

## Fee Accuracy Disclaimer

Fee rates were hardcoded based on publicly available platform documentation as of May 2025. Platforms update their fee schedules periodically. Always verify with official seller help centers before using these calculations for financial decisions:

- [Etsy Fees](https://www.etsy.com/legal/fees/)
- [Poshmark Fee Schedule](https://poshmark.com/fee-schedule)
- [Mercari Help Center](https://www.mercari.com/us/help_center/)
- [Depop Terms](https://www.depop.com/en/terms/)
- [eBay Selling Fees](https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees)
