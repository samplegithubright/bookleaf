import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BookLeaf Publishing - Author Support & Communication Portal",
  description: "AI-Powered Author Support & Operations Communication Portal for BookLeaf Publishing",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 selection:bg-teal-500 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 pb-16">{children}</main>
          <footer className="bg-white border-t border-slate-200/80 py-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800">BookLeaf Publishing</span>
                <span>• Author Operations Center (Delhi & Repro India)</span>
              </div>
              <div className="text-slate-400">
                80/20 Author Royalty Guarantee • 48-Hour Priority SLA
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
