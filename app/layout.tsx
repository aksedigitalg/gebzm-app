import type { Metadata, Viewport } from "next";
import { Google_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { SearchProvider } from "@/components/SearchProvider";
import { AppShell } from "@/components/AppShell";
import { ZoomLock } from "@/components/ZoomLock";
import { TopProgressBar } from "@/components/TopProgressBar";

const googleSans = Google_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Gebzem — Gebze Şehir Rehberi",
    template: "%s · Gebzem",
  },
  description:
    "Gebze'nin keşfedilmeyi bekleyen yerleri, etkinlikleri, ulaşım bilgileri ve acil numaraları tek bir uygulamada.",
  applicationName: "Gebzem",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon-192.svg" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Gebzem",
  },
  formatDetection: { telephone: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0e7490" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${googleSans.variable} h-full antialiased`}>
      {/* Hydration flash önleme: ilk render'da opacity-0, JS yüklenince kaldır */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            try {
              var s = localStorage.getItem('gebzem_theme');
              if (s === 'dark') document.documentElement.classList.add('dark');
              else if (s === 'light') document.documentElement.classList.remove('dark');
            } catch(e) {}
          })();
        ` }} />
      </head>
      <body className="min-h-[100dvh] flex flex-col">
        <TopProgressBar />
        <ZoomLock />
        <AuthProvider>
          <SearchProvider>
            <AppShell>{children}</AppShell>
          </SearchProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
