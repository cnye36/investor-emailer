import type React from "react";
import type { Metadata } from "next";

import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { DashboardNav } from "@/components/dashboard-nav";

export const metadata: Metadata = {
  title: "Investor Outreach",
  description: "Investor Outreach",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <DashboardNav />
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
