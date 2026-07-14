import ThemeProvider from "../components/tsx/theme_provider";
import "./globals.css";
import { Ubuntu } from "next/font/google";
import { SidebarProvider } from "../context/sidebar_context";
import { Metadata } from "next";

const roboto = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400"],
});

// Removemos o export const metadata estático e criamos a função dinâmica:
export async function generateMetadata(): Promise<Metadata> {
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
      images: ["/api/og"],
    },
    openGraph: {
      title: "ENEMmicro",
      description: "Vizualização gráfica dos microdados do ENEM",
      type: "website",
      url: "https://microenem.vercel.app",
      siteName: "ENEMmicro",
      images: [
        {
          url: "/api/og",
          width: 1200,
          height: 630,
          alt: "ENEMmicro: No bullshit, just data.",
        },
      ],
    },
  };
}

function RootLayout({ children }: { children: React.ReactNode }) {
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

export default RootLayout;
