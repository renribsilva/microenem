"use client";

import { TabsCard } from "../../../../components/tsx/tab_card";

export default function QuestoesPage() {
  const listaDeQuestoes = [
    {
      id: 'LC',
      label: 'Linguagens',
      content: (
        <div>
          conteúdo
        </div>
      )
    },
    {
      id: 'CH',
      label: 'Humanas',
      content: (
        <div>
          conteúdo
        </div>
      )
    },
    {
      id: 'CN',
      label: 'Natureza',
      content: (
        <div>
          conteúdo
        </div>
      )
    },
    {
      id: 'MT',
      label: 'Matemática',
      content: (
        <div>
          conteúdo
        </div>
      )
    },
  ];

  return (
    <main style={{ padding: '10px'}}>      
      <TabsCard items={listaDeQuestoes} width={'500px'}/>      
    </main>
  );
}