import { type Marketplace } from "@/lib/fees";

const BRAND_COLORS: Record<Marketplace, string> = {
  etsy: "#F16521",
  poshmark: "#BC2028",
  mercari: "#EB4D27",
  depop: "#FF4040",
  ebay: "",
  vinted: "#09B1BA",
  shopee_br: "#EE4D2D",
  subito: "#E37B00",
};

const BRAND_LETTERS: Record<Marketplace, string> = {
  etsy: "E",
  poshmark: "P",
  mercari: "M",
  depop: "D",
  ebay: "e",
  vinted: "V",
  shopee_br: "S",
  subito: "Su",
};

interface Props {
  platform: Marketplace;
  size?: number;
  muted?: boolean;
}

export default function PlatformIcon({ platform, size = 20, muted = false }: Props) {
  const letter = BRAND_LETTERS[platform];
  const fontSize = size * 0.5;

  if (platform === "ebay") {
    return (
      <div
        className={`relative flex-shrink-0 rounded-sm overflow-hidden transition-opacity ${muted ? "opacity-60" : "opacity-100"}`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          <div style={{ backgroundColor: "#E53238" }} />
          <div style={{ backgroundColor: "#0064D2" }} />
          <div style={{ backgroundColor: "#F5AF02" }} />
          <div style={{ backgroundColor: "#86B817" }} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-white font-bold leading-none"
            style={{ fontSize }}
          >
            {letter}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex-shrink-0 rounded-sm flex items-center justify-center transition-opacity ${muted ? "opacity-60" : "opacity-100"}`}
      style={{ width: size, height: size, backgroundColor: BRAND_COLORS[platform] }}
      aria-hidden="true"
    >
      <span
        className="text-white font-bold leading-none"
        style={{ fontSize }}
      >
        {letter}
      </span>
    </div>
  );
}
