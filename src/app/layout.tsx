import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryClientProviders from "@/lib/providers/query-client-provider";
import { UserStoreProvider } from "@/lib/providers/user-provider";
import { Toaster } from "@/components/ui/sonner";
import { AgentStoreProvider } from "@/lib/providers/agent-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  fallback: ["sans-serif"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Managemnt App",
  description: "A simple management app built with Next.js and React Query",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [{ url: "/favicon.svg", type: "image/svg" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased h-screen w-screen`}
        suppressHydrationWarning={true}
      >
        <UserStoreProvider>
          <AgentStoreProvider>
            <QueryClientProviders>{children}</QueryClientProviders>
          </AgentStoreProvider>
        </UserStoreProvider>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
