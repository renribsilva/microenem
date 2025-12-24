import { ThemeProvider } from '../components/tsx/theme_provider';
import './globals.css';
import { Ubuntu } from "next/font/google"
import styles from "./layout.module.css"
import AppHeader from '../components/tsx/header';
import AppSidebar from '../components/tsx/sidebar';

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
          <div className={styles.home_layout}>
            <div className={styles.app_sidebar}>
              <AppSidebar />  
            </div>
            <div className={styles.app_main}>
              <div className={styles.app_header}>
                <AppHeader />
              </div>
              <div>{children}</div>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}