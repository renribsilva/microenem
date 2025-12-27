'use client'

import { ThemeProvider } from '../components/tsx/theme_provider';
import './globals.css';
import { Ubuntu } from "next/font/google"
import { SidebarProvider } from '../context/sidebar_context';

const roboto = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400"],
});


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