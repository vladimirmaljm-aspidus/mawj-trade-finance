import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CBI Mobile Banking",
    short_name: "CBI",
    description:
      "CBI Mobile Banking — corporate banking & trade finance for authorized signatories. Manage liquidity, transfers, FX and cross-border payments.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#FFFFFF",
    theme_color: "#000F32",
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
        name: "Transfers",
        short_name: "Transfers",
        description: "Start a new SEPA / SWIFT / local transfer",
        url: "/?tab=payments",
      },
      {
        name: "Cards",
        short_name: "Cards",
        description: "View and manage corporate cards",
        url: "/?tab=cards",
      },
      {
        name: "FX Rates",
        short_name: "FX",
        description: "Live FX rates and conversions",
        url: "/?tab=fx",
      },
    ],
  };
}
