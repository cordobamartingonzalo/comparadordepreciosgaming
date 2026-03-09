import type { Metadata, Viewport } from "next";
import { Share_Tech_Mono, Rajdhani } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const shareTechMono = Share_Tech_Mono({
  variable: "--font-share-tech-mono",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Precios GG | Comparador de precios gaming en Argentina",
  description:
    "Compará precios de placas de video, procesadores, memorias RAM y más en las principales tiendas gaming de Argentina. Encontrá la mejor oferta en Compragamer, Mexx, Fullhard, Maximus y Venex.",
  keywords:
    "comparador precios gaming argentina, placas de video precio, procesadores precio argentina, rtx 4060 precio argentina",
  openGraph: {
    title: "Precios GG | Comparador de precios gaming en Argentina",
    description:
      "Compará precios de placas de video, procesadores, memorias RAM y más en las principales tiendas gaming de Argentina. Encontrá la mejor oferta en Compragamer, Mexx, Fullhard, Maximus y Venex.",
    url: "https://preciosgg.com.ar",
    type: "website",
  },
  alternates: {
    canonical: "https://preciosgg.com.ar",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: 'rE5IGxSzqduz5zeNoqGccfp2-F0MWJHtHZL_lnbnGw0',
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${rajdhani.variable} ${shareTechMono.variable} font-sans antialiased`}
      >
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-V5DJZ6MEF1"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-V5DJZ6MEF1');
          `}
        </Script>
      </body>
    </html>
  );
}
