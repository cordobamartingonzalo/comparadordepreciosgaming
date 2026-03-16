import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter, Share_Tech_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
  themeColor: "#F5F0E8",
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
        className={`${instrumentSerif.variable} ${inter.variable} ${shareTechMono.variable} font-sans antialiased`}
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
