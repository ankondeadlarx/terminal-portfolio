import type { Metadata } from "next";
import { JetBrains_Mono, Noto_Sans_Symbols_2 } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "700"],
});

const notoSymbols = Noto_Sans_Symbols_2({
  subsets: ["symbols"],
  variable: "--font-symbols",
  display: "swap",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Fatin Abrar Ankon's Terminal Portfolio",
  description: "Interactive terminal portfolio for Fatin Abrar Ankon",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} ${notoSymbols.variable}`}>
      <body>
        {children}
      </body>
    </html>
  );
}
