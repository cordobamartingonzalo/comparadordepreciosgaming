import type { Metadata, Viewport } from "next";
import { Share_Tech_Mono, Rajdhani } from "next/font/google";
import "./globals.css";

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  variable: "--font-share-tech-mono",
  subsets: ["latin"],
});

const rajdhani = Rajdhani({
  weight: ["400", "500", "600", "700"],
  variable: "--font-rajdhani",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "COMPARADOR GAMING AR | Precios de Hardware Gaming Argentina",
  description:
    "Compara precios de hardware gaming en las mejores tiendas de Argentina. Compragamer, Mexx, Fullhard y Maximus Gaming.",
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
        className={`${shareTechMono.variable} ${rajdhani.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
