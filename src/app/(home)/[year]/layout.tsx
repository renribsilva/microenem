'use client'

import { usePathname } from "next/navigation"
import { NineteenProvider } from "../../../context/nineteen_context"
import styles from "./layout.module.css"

export default function NineteenLayout({
  children,
}: {
  children: React.ReactNode
}) { 

  const path = usePathname()
  const showAviso = path.endsWith("visao-geral")

  return (
    <NineteenProvider>
      <main>
        {children}
      </main>
      {!showAviso && (
        <div className={styles.table_footer}>
          Aviso: a análise dos microdados do ENEM aqui apresentada está circunscrita aos dados dos que participaram de ao menos um dia da aplicação regular do exame (incluindo treineiros) – não inclui reaplicações nem versões digitais do exame. O motivo dessa exclusão consiste no fato de que alguns microdados apresentam essas informações e outros não, de modo que excluí-los estabelece uma normalização para possíveis comparações.
        </div>
      )}
    </NineteenProvider>
  )
}