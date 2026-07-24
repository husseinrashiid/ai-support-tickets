import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Nav } from "@/components/Nav";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Support Tickets",
  description: "AI-powered customer support ticket assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function () {
              try {
                var stored = localStorage.getItem("theme");
                var isDark =
                  stored === "dark" ||
                  (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
                document.documentElement.classList.toggle("dark", isDark);
              } catch (e) {}
            })();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          <Nav />
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
