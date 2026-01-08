import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import ConvexClerkProvider from "@/providers/ConvexClerkProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PWAProviderClient from "@/components/PWAProviderClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://athonix.life"),
  title: {
    default: "Athonix - AI-Powered Fitness Programs for Free",
    template: "%s | Athonix",
  },
  description: "A modern fitness AI platform to create personalized workout plans and track your progress. Get jacked for free with evidence-based training programs.",
  keywords: ["fitness", "workout", "AI", "personal trainer", "free fitness", "workout plan", "strength training", "muscle building", "athonix","diet plan","diet"],
  creator: "Athonix",
  publisher: "Athonix",
  applicationName: "Athonix",
  authors: [{ name: "Athonix Team" }],
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  alternates: {
    canonical: "https://athonix.life",
    languages: {
      "en-US": "https://athonix.life",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://athonix.life",
    title: "Athonix - AI-Powered Fitness Programs for Free",
    description: "Create personalized workout plans and track your progress with our AI fitness platform. Get jacked for free with evidence-based training programs.",
    siteName: "Athonix",
    images: [
      {
        url: "https://athonix.life/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Athonix - AI Fitness Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Athonix - AI-Powered Fitness Programs for Free",
    description: "Create personalized workout plans and track your progress with our AI fitness platform. Get jacked for free with evidence-based training programs.",
    images: ["https://athonix.life/twitter-image.jpg"],
    creator: "@athonixfitness",
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
  manifest: "/manifest.json",
  verification: {
    google: "google-site-verification-code", // Replace with your verification code
  },
  category: "fitness",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexClerkProvider>
      <html lang="en" className="scroll-smooth">
        <head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
          <Navbar />
          
          {/* GRID BACKGROUND */}
          <div className="fixed inset-0 -z-1">
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background"></div>
            <div className="absolute inset-0 bg-[linear-gradient(var(--cyber-grid-color)_1px,transparent_1px),linear-gradient(90deg,var(--cyber-grid-color)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
          </div>
          
          <main className="pt-24 flex-grow">{children}</main>
          <Footer />
          
          {/* PWA Components */}
          <PWAProviderClient />
          
          {/* Schema.org structured data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Athonix",
                url: "https://athonix.life",
                potentialAction: {
                  "@type": "SearchAction",
                  target: "https://athonix.life/search?q={search_term_string}",
                  "query-input": "required name=search_term_string",
                },
              }),
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "Athonix",
                url: "https://athonix.life",
                logo: "https://athonix.life/logo.png",
                sameAs: [
                  "https://twitter.com/athonixfitness",
                  "https://instagram.com/athonixfitness",
                  "https://facebook.com/athonixfitness",
                ],
              }),
            }}
          />
        </body>
      </html>
    </ConvexClerkProvider>
  );
}