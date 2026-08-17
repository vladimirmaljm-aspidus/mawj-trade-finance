import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mawj Trade Finance Bank DMCC",
    short_name: "Mawj",
    description:
      "Corporate treasury & trade finance for authorized signatories. Manage liquidity, letters of credit, FX and cross-border payments.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a1628",
    theme_color: "#0a1628",
    categories: ["finance", "business", "productivity"],
    lang: "en",
    dir: "ltr",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Send Payment",
        short_name: "Send",
        description: "Start a new SEPA / SWIFT / local transfer",
        url: "/?tab=payments",
      },
      {
        name: "Corporate Cards",
        short_name: "Cards",
        description: "View and manage corporate cards",
        url: "/?tab=cards",
      },
      {
        name: "Treasury FX",
        short_name: "FX",
        description: "Live FX rates and conversions",
        url: "/?tab=fx",
      },
    ],
  };
}
