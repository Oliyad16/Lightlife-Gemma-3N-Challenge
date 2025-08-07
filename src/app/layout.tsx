import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNavigation, FloatingActionButton } from "@/components/ui";
import { ErrorBoundary } from "@/components/error-boundary";
import { ClientLayout } from "@/components/client-layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LifeLight Gemma 3N - Your AI Health Assistant",
  description: "AI-powered medication and health tracking app with offline Gemma 3N integration for elderly users",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
  keywords: [
    "healthcare", "ai", "gemma3n", "medication tracking", "elderly care", 
    "accessibility", "offline ai", "barcode scanner", "drug interactions"
  ],
  authors: [{ name: "LifeLight Team" }],
  creator: "LifeLight Gemma 3N Challenge",
  publisher: "LifeLight",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#FBD24D',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta httpEquiv="Cross-Origin-Embedder-Policy" content="require-corp" />
        <meta httpEquiv="Cross-Origin-Opener-Policy" content="same-origin" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}
      >
        <ClientLayout>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Main content area with bottom padding for navigation */}
            <main className="flex-1 pb-20 safe-area-top overflow-auto">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </main>
            
            {/* Fixed bottom navigation */}
            <BottomNavigation />
            
            {/* Floating action button for quick scanning */}
            <FloatingActionButton />
          </div>
        </ClientLayout>
      </body>
    </html>
  );
}