import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

import { Providers } from "@/components/providers";
import "./globals.css";

// Old Mutual primary typeface (CI). Montserrat Bold/Medium/Regular for digital.
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Programme Control Platform",
    template: "%s | Programme Control",
  },
  description:
    "Enterprise programme management platform for delivery, governance, RAID, approvals, and executive reporting.",
  icons: {
    icon: [{ url: "/brand/om-anchor-tick.svg", type: "image/svg+xml" }],
    apple: "/brand/om-anchor-tick.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
