"use client";

import styles from "./privacy.module.css";
import { useSidebar } from "../../context/sidebar_context";
import AppSidebar from "../../components/tsx/sidebar";
import AppHeader from "../../components/tsx/header";
import Card from "../../components/tsx/card";

export default function PrivacyLayout() {
  const { isMobileOpen, toggleMobileSidebar, isMobile } = useSidebar();

  return (
    <div className={styles.layout_container}>
      {isMobile && (
        <div
          className={[
            `${styles.backdrop} `,
            `${isMobileOpen ? styles.backdrop_active : ""}`,
          ].join("")}
          onClick={toggleMobileSidebar}
        />
      )}
      <div className={styles.layout_sidebar}>
        <AppSidebar />
      </div>
      <header className={styles.layout_header}>
        <AppHeader />
      </header>

      <main className={styles.layout_main}>
        <Card className={styles.card_privacy}>
          <h1>Política de Privacidade</h1>
          <p>
            Esta política descreve como tratamos as informações no site{" "}
            <strong>microenem.vercel.app</strong>
          </p>

          <section>
            <h2>1. Coleta de Dados de Usuários</h2>
            <p>Nós não coletamos dados pessoais de nossos visitantes.</p>
            <ul>
              <li>Não solicitamos seu nome, e-mail, telefone ou endereço.</li>
              <li>Não possuímos formulários de cadastro ou áreas de login.</li>
              <li>
                Não realizamos o rastreamento de suas atividades de navegação.
              </li>
            </ul>
          </section>

          <section>
            <h2>2. Uso de Cookies</h2>
            <p>
              Este site não utiliza cookies de marketing, rastreamento ou
              análise. Sua navegação é privada e não criamos perfis de usuário.
            </p>
          </section>

          <section>
            <h2>3. Infraestrutura e Hospedagem (Vercel)</h2>
            <p>
              Este site é hospedado na plataforma Vercel. Para viabilizar a
              entrega do conteúdo e garantir a segurança da navegação, a
              infraestrutura da Vercel pode processar automaticamente certos
              dados técnicos, tais como:
            </p>
            <ul>
              <li>
                Endereço IP (utilizado para segurança e geolocalização
                aproximada para entrega de conteúdo).
              </li>
              <li>
                Logs de solicitações HTTP (tipo de navegador, data e hora do
                acesso).
              </li>
            </ul>
            <p>
              Esses dados são processados pela Vercel estritamente para fins de
              monitoramento de performance, diagnóstico de erros e proteção
              contra acessos maliciosos. Nós não utilizamos esses dados para
              identificar você pessoalmente. Para mais detalhes, você pode
              consultar a Política de Privacidade da Vercel.
            </p>
          </section>

          <section>
            <h2>4. Links de Terceiros</h2>
            <p>
              Caso este site contenha links para serviços externos, lembramos
              que não temos controle sobre as políticas de privacidade desses
              terceiros.
            </p>
          </section>

          <section>
            <h2>5. Alterações nesta Política</h2>
            <p>
              Esta política pode ser atualizada ocasionalmente. O compromisso de
              não coletar dados desnecessários permanece.
            </p>
            <p>
              <strong>Última atualização:</strong> 26 de Janeiro de 2026.
            </p>
          </section>
        </Card>
      </main>
    </div>
  );
}
