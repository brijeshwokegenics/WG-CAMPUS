
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";
import { NextTopLoader } from "@/components/ui/NextTopLoader";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WG Campus - School ERP",
  description: "A comprehensive ERP solution for modern educational institutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <NextTopLoader />
            {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
