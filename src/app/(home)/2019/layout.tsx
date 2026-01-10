'use client'

import { NineteenProvider } from "../../../context/nineteen_context"

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
    </NineteenProvider>
  )
}