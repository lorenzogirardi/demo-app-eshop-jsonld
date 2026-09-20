import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./Navbar/Navbar";
import Footer from "./Footer";
import SessionProvider from "./SessionProvider"
import AssistantChat from "@/components/AssistantChat";
import { isAIEnabled } from "@/lib/ai/config";
import { STORE_NAME, siteUrl } from "@/lib/site";
import { organizationJsonLd, websiteJsonLd, safeJsonLd } from "@/lib/seo/jsonld";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: STORE_NAME, template: `%s` },
  description: "Clothing and accessories: bags, watches, shoes, scarves, sunglasses. Search in natural language with the AI assistant.",
  alternates: { types: { "text/plain": "/llms.txt" } },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
        <Navbar />
        <main className="p-4 max-w-screen-2xl m-auto min-w-[300px]">
          {children}
        </main>
        <Footer />
        {isAIEnabled() && <AssistantChat />}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd([organizationJsonLd(), websiteJsonLd()]) }}
        />
        </SessionProvider>
      </body>
    </html>
  );
}
