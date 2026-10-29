import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { sessaoAtual } from "@/lib/session";

export const metadata: Metadata = {
  title: "Clínica Aberta",
  description: "Cadastre sua clínica, publique sua agenda e receba agendamentos online.",
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
              <span className="mark">✚</span>Clínica Aberta
            </Link>
            <nav className="tabs">
              <Link href="/buscar">Buscar médico</Link>
              {sessao?.role === "MEDICO" && <Link href="/medico">Minha agenda</Link>}
              {sessao?.role === "ADMIN" && <Link href="/admin">Admin</Link>}
              {!sessao && <Link href="/medico/cadastro">Cadastrar clínica</Link>}
              {sessao ? (
                <form action="/sair" method="post">
                  <button type="submit">Sair ({sessao.nome.split(" ")[0]})</button>
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
            Clínica Aberta — projeto de exemplo. Dados cadastrados aqui ficam no banco local do projeto.
          </div>
        </footer>
      </body>
    </html>
  );
}
