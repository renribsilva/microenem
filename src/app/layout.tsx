import "./globals.css";
import { Ubuntu } from "next/font/google";
import { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { SidebarProvider } from "../context/sidebar_context";

const roboto = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400"],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<Record<string, string | string[]>>;
}): Promise<Metadata> {
  const resolvedParams = await params;

  const path = Object.values(resolvedParams).flat().join("/");

  const url = `https://microenem.vercel.app/${path}`;

  return {
    metadataBase: new URL("https://microenem.vercel.app"),

    title: "ENEMmicro",
    description: "Vizualização gráfica dos microdados do ENEM",

    twitter: {
      card: "summary_large_image",
      title: "ENEMmicro",
      description: "Vizualização gráfica dos microdados do ENEM",
      siteId: "1467726470533754880",
      creator: "@renribsilva",
    },

    openGraph: {
      title: "ENEMmicro",
      siteName: "ENEMmicro",
      description: "Vizualização gráfica dos microdados do ENEM",
      type: "website",
      url,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body className={roboto.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
