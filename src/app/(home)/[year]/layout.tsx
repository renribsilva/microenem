'use client'

import { NineteenProvider } from "../../../context/nineteen_context"
import styles from "./layout.module.css"

export default function NineteenLayout({
  children,
}: {
  children: React.ReactNode
}) {  
  return (
    <NineteenProvider>
      <main>
        {children}
      </main>
      <div className={styles.table_footer}>
        Aviso: a análise dos microdados do ENEM aqui apresentada está circunscrita aos dados dos que participaram de ao menos um dia da aplicação regular do exame (incluindo treineiros) – não inclui reaplicações.
      </div>
    </NineteenProvider>
  )
}