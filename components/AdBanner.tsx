// AdSense placeholder — swap the inner content with your actual <ins> tag.
// Two slots are used: slot="hero-below" and slot="pre-footer".
// Example replacement:
//   <ins className="adsbygoogle" style={{display:"block"}}
//     data-ad-client="ca-pub-XXXXXXXXXX"
//     data-ad-slot="XXXXXXXXXX"
//     data-ad-format="auto"
//     data-full-width-responsive="true" />

interface Props {
  slot: string;
}

export default function AdBanner({ slot }: Props) {
  return (
    <div
      data-ad-slot={slot}
      className="mx-auto max-w-5xl px-4 my-4"
      aria-label="Advertisement"
    >
      {/* ─── REPLACE THIS DIV WITH YOUR ADSENSE <ins> TAG ─────────────────── */}
      <div className="w-full h-[90px] rounded-xl border border-dashed border-white/8 bg-white/2 flex items-center justify-center">
        <span className="text-xs text-slate-700 font-mono select-none">
          AdSense banner slot · {slot}
        </span>
      </div>
      {/* ─────────────────────────────────────────────────────────────────── */}
    </div>
  );
}
