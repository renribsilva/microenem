"use client";

import ThemeProvider from "../components/tsx/theme_provider";
import "./globals.css";
import { Ubuntu } from "next/font/google";
import { SidebarProvider } from "../context/sidebar_context";
import { usePathname } from "next/navigation";

const roboto = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); // Captura o path exato em tempo de execução
  const targetUrl = `https://microenem.vercel.app${pathname}`;

  // Aponta para a nossa rota de imagem dinâmica passando o path atualizado
  const ogImageUrl = `https://microenem.vercel.app/api/og?path=${encodeURIComponent(pathname)}`;

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
