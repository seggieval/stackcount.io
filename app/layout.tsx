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
    default: "stackCount — AI-Powered Finance Tracker",
    template: "%s | stackCount",
  },
  description:
    "Full-stack portfolio project with OpenAI GPT integration. Track income, expenses, profit, and get AI-generated financial insights. Built by Kiril Sierykov.",
  applicationName: "stackCount",
  keywords: [
    "AI finance app",
    "OpenAI GPT integration",
    "expense tracker",
    "profit analytics",
    "Next.js portfolio project",
    "full-stack developer",
    "financial insights API",
    "bookkeeping app",
  ],
  authors: [{ name: "Kiril Sierykov" }],
  creator: "Kiril Sierykov",
  publisher: "stackCount",
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/"),
    siteName: "stackCount",
    title: "stackCount — AI-Powered Finance Tracker",
    description:
      "A full-stack portfolio app with OpenAI GPT integration for automated financial insights. Track profit, expenses, and estimated taxes — free to use.",
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
    icon: [{ url: "/favicon.ico" }],
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
          "Full-stack finance app with OpenAI GPT integration for profit tracking, expense management, and AI-generated business insights.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          description: "Free to use. Optional donations support ongoing development.",
          url: absoluteUrl("/donate"),
        },
        creator: { "@id": "#creator" },
      },
      {
        "@type": "Person",
        "@id": "#creator",
        name: "Kiril Sierykov",
        url: absoluteUrl("/about"),
        description:
          "Full-stack developer who built stackCount as a portfolio project, including his first production OpenAI GPT API integration.",
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
