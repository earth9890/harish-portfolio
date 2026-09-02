import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Serif, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider, themeInitScript } from "@/lib/theme";
import SmoothScroll from "@/components/SmoothScroll";
import Cursor from "@/components/Cursor";
import Grain from "@/components/Grain";
import Nav from "@/components/Nav";
import CommandPalette from "@/components/CommandPalette";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", axes: ["wdth", "opsz"], display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["italic", "normal"], variable: "--font-serif", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://harishsugandhi.dev"),
  title: { default: "Harish Sugandhi — Frontend & Full-Stack Engineer", template: "%s — Harish Sugandhi" },
  description: "Interfaces that hold up at scale. React, Next.js, WebGL and AI-native product surfaces, built end to end from Pune, India.",
  openGraph: { title: "Harish Sugandhi", description: "Frontend & full-stack engineer. Interfaces that hold up at scale.", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${serif.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <SmoothScroll />
          <Cursor />
          <Grain />
          <Nav />
          <CommandPalette />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
