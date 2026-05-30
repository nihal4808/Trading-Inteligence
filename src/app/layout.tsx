import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import RootLayoutContent from "@/components/layout/RootLayoutContent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trading Intelligence System",
  description: "Personal trading growth intelligence platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <RootLayoutContent>{children}</RootLayoutContent>
      </body>
    </html>
  );
}
