import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { db } from "./db";

const COOKIE = "agenda_sessao";
const DIAS = 7;

export type Papel = "CIDADAO" | "SECRETARIA";
export type Sessao = { uid: string; role: Papel; nome: string };

function chave() {
  const segredo = process.env.AUTH_SECRET;
  if (!segredo || segredo.length < 16) {
    throw new Error(
      "AUTH_SECRET ausente ou curto demais. Copie .env.example para .env e defina uma chave."
    );
  }
  return new TextEncoder().encode(segredo);
}

export async function criarSessao(sessao: Sessao) {
  const token = await new SignJWT(sessao as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DIAS}d`)
    .sign(chave());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DIAS * 24 * 60 * 60,
  });
}

export async function encerrarSessao() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function sessaoAtual(): Promise<Sessao | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, chave());
    if (!payload.uid || !payload.role) return null;
    return {
      uid: String(payload.uid),
      role: payload.role as Papel,
      nome: String(payload.nome ?? ""),
    };
  } catch {
    return null;
  }
}

export async function usuarioAtual() {
  const sessao = await sessaoAtual();
  if (!sessao) return null;
  return db.usuario.findUnique({ where: { id: sessao.uid } });
}

/** Exige alguém logado com um dos papéis; caso contrário manda para o login. */
export async function exigirPapel(papeis: Papel[], voltarPara?: string) {
  const usuario = await usuarioAtual();
  if (!usuario) {
    const destino = voltarPara ? `/entrar?proximo=${encodeURIComponent(voltarPara)}` : "/entrar";
    redirect(destino);
  }
  if (!papeis.includes(usuario.role as Papel)) redirect("/");
  return usuario;
}
