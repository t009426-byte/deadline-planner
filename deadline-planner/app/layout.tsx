import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Work_Sans, Tajawal } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./lib/i18n";
import { FamilyProvider } from "./lib/family";

const headingFont = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const bodyFont = Work_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const arabicFont = Tajawal({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  title: "Family Hub",
  description: "Family calendar, homework, tests and daily tasks for a busy studying mom.",
  applicationName: "Family Hub",
  appleWebApp: { capable: true, title: "Family Hub", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  other: { "apple-mobile-web-app-capable": "yes" },
};

export const viewport: Viewport = {
  themeColor: "#005764",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${headingFont.variable} ${bodyFont.variable} ${arabicFont.variable} h-full antialiased`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-background font-body">
        <LanguageProvider>
          <FamilyProvider>{children}</FamilyProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
