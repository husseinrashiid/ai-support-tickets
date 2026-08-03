import type { Metadata } from "next";
import localFont from "next/font/local";
import { Nav } from "@/components/Nav";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = localFont({
  src: "../node_modules/next/dist/next-devtools/server/font/geist-latin.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../node_modules/next/dist/next-devtools/server/font/geist-mono-latin.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
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
