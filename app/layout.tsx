import type { Metadata, Viewport } from "next";
import { Share_Tech_Mono, Rajdhani } from "next/font/google";
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
  title: "Comparador Gaming Argentina",
  description:
    "Compara precios de hardware gaming en las mejores tiendas de Argentina.",
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
      </body>
    </html>
  );
}
