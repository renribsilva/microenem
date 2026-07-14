import ThemeProvider from "../components/tsx/theme_provider";
import "./globals.css";
import { Ubuntu } from "next/font/google";
import { SidebarProvider } from "../context/sidebar_context";
import { Metadata } from "next";

const roboto = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400"],
});

type Props = {
  params: Promise<Record<string, string | string[]>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const path = Object.values(resolvedParams).flat().join("/");
  const dynamicUrl = `https://microenem.vercel.app/${path}`;

  return {
    metadataBase: new URL("https://microenem.vercel.app"),
    title: "ENEMmicro",
    description: "Visualização gráfica dos microdados do ENEM",
    twitter: {
      card: "summary_large_image",
      title: "ENEMmicro",
      description: "Visualização gráfica dos microdados do ENEM",
      siteId: "1467726470533754880",
      creator: "@renribsilva",
    },
    openGraph: {
      title: "ENEMmicro",
      description: "Visualização gráfica dos microdados do ENEM",
      type: "website",
      url: dynamicUrl,
      siteName: "ENEMmicro",
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
          enableSystem={true}
          disableTransitionOnChange
        >
          <SidebarProvider>{children}</SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
