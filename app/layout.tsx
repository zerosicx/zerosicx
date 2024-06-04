import type { Metadata } from "next";
import { Roboto_Flex as FontSans } from "next/font/google";
import "./globals.css";

import { cn } from "@/lib/utils";
import ConvexClientProvider from "./ConvexClientProvider";

const fontSans = FontSans({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "ZEROSICX",
  description: "Hannah Carino's Personal Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ConvexClientProvider>
        <body
          className={cn(
            "min-h-screen bg-background font-sans antialiased lg:mx-40",
            fontSans.className
          )}
        >
          {children}
        </body>
      </ConvexClientProvider>
    </html>
  );
}
