import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { sessaoAtual } from "@/lib/session";
import { primeiroNome } from "@/lib/domain";

export const metadata: Metadata = {
  title: "Agenda Saúde",
  description: "Agendamento de consultas nas unidades de saúde do município.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const sessao = await sessaoAtual();

  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
        />
      </head>
      <body>
        <header className="bar">
          <div className="wrap bar-in">
            <Link className="brand" href="/">
              <span className="mark">✚</span>Agenda Saúde
            </Link>
            <nav className="tabs">
              <Link href="/unidades">Unidades</Link>
              {sessao?.role === "CIDADAO" && <Link href="/meus-agendamentos">Meus agendamentos</Link>}
              {sessao?.role === "SECRETARIA" && <Link href="/secretaria">Secretaria</Link>}
              {sessao ? (
                <form action="/sair" method="post">
                  <button type="submit">Sair ({primeiroNome(sessao.nome)})</button>
                </form>
              ) : (
                <Link href="/entrar">Entrar</Link>
              )}
            </nav>
          </div>
        </header>
        <main className="wrap">{children}</main>
        <footer className="pe">
          <div className="wrap">
            Agenda Saúde — agendamento das unidades básicas. Em caso de emergência, procure o pronto
            atendimento ou ligue 192.
          </div>
        </footer>
      </body>
    </html>
  );
}
