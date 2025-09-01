// app/layout.tsx
import type { Metadata } from "next";
import { Space_Grotesk, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Script from "next/script";

// --- Fonts (unchanged) ---
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// --- Helpers ---
function absoluteUrl(path = "") {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://stackcount.io";
  return new URL(path, base).toString();
}

// --- SEO: Metadata API ---
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://stackcount.io"),
  title: {
    default: "stackCount — Free AI accountant (donation-supported)",
    template: "%s | stackCount",
  },
  description:
    "Free, donation-supported AI accountant to track profit, expenses, and estimated taxes. Built by a teen developer as a portfolio project to earn a CS internship.",
  applicationName: "stackCount",
  keywords: [
    "AI accountant",
    "free bookkeeping",
    "profit tracker",
    "expense tracker",
    "tax estimator",
    "donation supported software",
    "portfolio project",
  ],
  authors: [{ name: "Kiril (Creator)" }],
  creator: "Kiril",
  publisher: "stackCount",
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/"),
    siteName: "stackCount",
    title: "stackCount — Free AI accountant (donation-supported)",
    description:
      "Track profit, expenses, and estimated taxes — free forever. If it helps, consider donating. Built by a teen dev aiming for a CS internship.",
    
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // JSON-LD: SoftwareApplication + WebApplication + Person
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["SoftwareApplication", "WebApplication"],
        name: "stackCount",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        url: absoluteUrl("/"),
        description:
          "Free, donation-supported AI accountant for tracking profit, expenses, and estimated taxes.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          description: "Free forever. If it helps, consider donating.",
          url: absoluteUrl("/donate"),
        },
        creator: { "@id": "#creator" },
      },
      {
        "@type": "Person",
        "@id": "#creator",
        name: "Kiril",
        url: absoluteUrl("/about"),
        description:
          "Teen developer building stackCount as a portfolio project and seeking a CS internship.",
      },
    ],
  };

  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${geistMono.variable} ${inter.variable} font-primary antialiased`}
      >
        {/* JSON-LD for rich results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <Providers>{children}</Providers>

        {/* Google Analytics (kept) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-5D7FTSF6HT"
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-5D7FTSF6HT');
          `}
        </Script>
      </body>
    </html>
  );
}
