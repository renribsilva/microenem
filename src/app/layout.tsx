"use client";

import ThemeProvider from "../components/tsx/theme_provider";
import "./globals.css";
import { Ubuntu } from "next/font/google";
import { SidebarProvider } from "../context/sidebar_context";
import { useHomeData } from "../context/home_context";

const roboto = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { pathName } = useHomeData();
  const targetUrl = `https://microenem.vercel.app${pathName}`;
  const ogImageUrl = `https://microenem.vercel.app/api/og?path=${encodeURIComponent(pathName)}`;

  return (
    <html lang="pt-br" suppressHydrationWarning>
      <head>
        <title>ENEMmicro</title>
        <meta
          name="description"
          content="Visualização gráfica dos microdados do ENEM"
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={targetUrl} />
        <meta property="og:title" content="ENEMmicro" />
        <meta
          property="og:description"
          content="Visualização gráfica dos microdados do ENEM"
        />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="site_name" content="ENEMmicro" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={targetUrl} />
        <meta name="twitter:title" content="ENEMmicro" />
        <meta
          name="twitter:description"
          content="Visualização gráfica dos microdados do ENEM"
        />
        <meta name="twitter:image" content={ogImageUrl} />
      </head>
      <body className={roboto.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange
        >
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
