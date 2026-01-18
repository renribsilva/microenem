import { ThemeProvider } from '../components/tsx/theme_provider';
import './globals.css';
import { Ubuntu } from "next/font/google"
import { SidebarProvider } from '../context/sidebar_context';
import { Metadata } from 'next';

const roboto = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://microenem.vercel.app'),
  title: 'ENEMmicro',
  description: 'Vizualização gráfica dos microdados do ENEM',
  twitter: {
    card: 'summary', // CARD PEQUENO COM IMAGEM AO LADO
    title: 'ENEMmicro',
    description: 'Vizualização gráfica dos microdados do ENEM',
    siteId: '1467726470533754880',
    creator: '@renribsilva',
    // O Next.js injeta automaticamente a imagem gerada pelo arquivo acima
  },
  // Opcional: Adicione openGraph para funcionar no WhatsApp/LinkedIn também
  openGraph: {
    title: 'ENEMmicro',
    description: 'Vizualização gráfica dos microdados do ENEM',
    type: 'website',
  },
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="pt-br">
      <body className={roboto.className}>
        <ThemeProvider
          attribute="class"  
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange
        >
          <SidebarProvider>
            {children} 
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}