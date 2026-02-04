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
  const pathParts = path.split('/').filter(Boolean)
  const rawSecao = pathParts[pathParts.length - 1]
  const secaoFormatada = rawSecao
    .replace(/-/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
  const showAviso = path.endsWith("visao-geral") || 
    path.endsWith("redacao") ||
    path.endsWith("probabilidade-e-info") 

  return (
    <NineteenProvider>
      <main>
        {children}
      </main>
      {!showAviso && (
        <div className={styles.table_footer}>
          Aviso: a análise dos microdados do ENEM apresentada na seção "{secaoFormatada}" está circunscrita aos dados dos que participaram de ao menos um dia da aplicação regular do exame (incluindo treineiros) – não inclui reaplicações, versões digitais ou adaptadas do exame. O motivo dessa exclusão reside no fato de que alguns microdados apresentam essas informações e outros não, além de itens exclusivos que modificam a dificuldade média do exame; de modo que excluí-los estabelece uma normalização para possíveis comparações.
        </div>
      )}
    </NineteenProvider>
  )
}