import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Analytics } from "@vercel/analytics/next";

const dmSans = DM_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lexi ❤️ Book Lover",
  description: "Lexi protects the value of books and promotes reading.",
  icons: {
    icon: [
      {
        url: "/icons/icons8-story-book-pulsar-gradient-16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/icons/icons8-story-book-pulsar-gradient-32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/icons/icons8-story-book-pulsar-gradient-96.png",
        sizes: "96x96",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/icons/icons8-story-book-pulsar-gradient-96.png",
        sizes: "96x96",
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.className} antialiased`}>
        <NuqsAdapter>
          <Analytics />
          <TRPCReactProvider>
            {children}
            <Toaster />
          </TRPCReactProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
