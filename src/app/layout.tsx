import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { CartUIProvider } from "@/components/storefront/CartUIProvider";
import { AuthModals } from "@/components/storefront/AuthModals";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Cerrá",
  description: "Fine fragrance, curated.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const instant = false;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-black text-white antialiased">
        <CartUIProvider>
          {children}
          <Suspense fallback={null}>
            <AuthModals />
          </Suspense>
        </CartUIProvider>
      </body>
    </html>
  );
}