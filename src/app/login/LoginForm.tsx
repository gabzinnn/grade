"use client";

import { useState, useTransition } from "react";
import { loginAction } from "@/actions/auth";
import { IconCalendar } from "@/app/components/ui/icons";

interface Perfil {
  id: string;
  nome: string;
  apelido: string | null;
}

interface Props {
  perfis: Perfil[];
}

function iniciais(nome: string) {
  return nome
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");
}

// Gera uma cor de avatar baseada no nome (usa a paleta do design system)
const CORES = [
  "var(--color-cat-1)",
  "var(--color-cat-2)",
  "var(--color-cat-3)",
  "var(--color-cat-4)",
  "var(--color-cat-5)",
  "var(--color-primary)",
];
function corAvatar(nome: string) {
  let hash = 0;
  for (const c of nome) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return CORES[hash % CORES.length];
}

export function LoginForm({ perfis }: Props) {
  const [selecionado, setSelecionado] = useState<Perfil | null>(null);
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function selecionar(p: Perfil) {
    setSelecionado(p);
    setSenha("");
    setErro(null);
  }

  function voltar() {
    setSelecionado(null);
    setSenha("");
    setErro(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selecionado) return;

    const fd = new FormData();
    fd.set("perfilId", selecionado.id);
    fd.set("senha", senha);

    startTransition(async () => {
      const resultado = await loginAction(fd);
      if (resultado?.erro) {
        setErro(resultado.erro);
        return;
      }
      // Reload completo (não router.push): garante que o QueryClient e todo
      // estado em memória do usuário anterior sejam descartados.
      window.location.href = "/";
    });
  }

  const apelido = selecionado ? (selecionado.apelido ?? selecionado.nome.split(" ")[0]) : null;

  return (
    <div className="login-bg">
      <div className="login-card">
        {/* Wordmark */}
        <div className="login-wordmark">
          <div className="login-icon-wrap">
            <IconCalendar width={22} height={22} style={{ color: "var(--color-primary)" }} />
          </div>
          <span className="login-brand">Grade</span>
        </div>

        {!selecionado ? (
          /* ── Passo 1: selecione o usuário ── */
          <>
            <h1 className="login-title">Quem é você?</h1>
            <p className="login-sub">Selecione seu perfil para continuar.</p>

            <div className="login-perfil-list">
              {perfis.map((p) => (
                <button
                  key={p.id}
                  id={`perfil-${p.id}`}
                  className="login-perfil-btn"
                  onClick={() => selecionar(p)}
                >
                  <span
                    className="login-avatar"
                    style={{ background: corAvatar(p.nome) }}
                  >
                    {iniciais(p.nome)}
                  </span>
                  <span className="login-perfil-nome">
                    {p.apelido ?? p.nome.split(" ")[0]}
                    <span className="login-perfil-nome-full">{p.nome}</span>
                  </span>
                  <svg
                    className="login-chevron"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                </button>
              ))}
            </div>
          </>
        ) : (
          /* ── Passo 2: senha ── */
          <form onSubmit={handleSubmit} className="login-senha-form">
            <button type="button" className="login-back" onClick={voltar}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                width={16}
                height={16}
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
              Voltar
            </button>

            <div className="login-senha-header">
              <span
                className="login-avatar login-avatar-lg"
                style={{ background: corAvatar(selecionado.nome) }}
              >
                {iniciais(selecionado.nome)}
              </span>
              <h1 className="login-title" style={{ marginTop: "0.75rem" }}>
                Olá, {apelido}!
              </h1>
              <p className="login-sub">Digite sua senha para entrar.</p>
            </div>

            <div className="login-input-wrap">
              <input
                id="login-senha"
                type="password"
                className="login-input"
                placeholder="Senha"
                autoFocus
                autoComplete="current-password"
                value={senha}
                onChange={(e) => {
                  setSenha(e.target.value);
                  setErro(null);
                }}
              />
              {erro && <p className="login-erro">{erro}</p>}
            </div>

            <button
              id="login-entrar"
              type="submit"
              className="login-submit"
              disabled={pending}
            >
              {pending ? "Entrando…" : "Entrar"}
            </button>
          </form>
        )}
      </div>

      <style>{`
        .login-bg {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-canvas);
          padding: 1.5rem;
        }

        .login-card {
          width: 100%;
          max-width: 400px;
          background: var(--color-surface);
          border: 1px solid var(--color-hairline);
          border-radius: var(--radius-dialog);
          padding: 2.5rem 2rem;
          box-shadow: var(--shadow-floating);
          animation: login-in 0.25s ease both;
        }

        @keyframes login-in {
          from { opacity: 0; transform: translateY(12px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── wordmark ── */
        .login-wordmark {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }
        .login-icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-control);
          background: color-mix(in srgb, var(--color-primary) 12%, transparent);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .login-brand {
          font-family: var(--font-wordmark), sans-serif;
          font-size: 22px;
          color: var(--color-primary);
          font-weight: 600;
        }

        /* ── títulos ── */
        .login-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--color-ink);
          margin: 0 0 0.25rem;
        }
        .login-sub {
          font-size: var(--text-body-sm);
          color: var(--color-ink-2);
          margin: 0 0 1.5rem;
        }

        /* ── lista de perfis ── */
        .login-perfil-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .login-perfil-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem 1rem;
          background: var(--color-raised);
          border: 1px solid var(--color-hairline);
          border-radius: var(--radius-control);
          text-align: left;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, box-shadow 0.15s, transform 0.1s;
          box-shadow: var(--shadow-resting);
        }
        .login-perfil-btn:hover {
          background: var(--color-recess);
          border-color: color-mix(in srgb, var(--color-primary) 30%, transparent);
          box-shadow: 0 2px 8px color-mix(in srgb, var(--color-primary) 15%, transparent);
          transform: translateY(-1px);
        }
        .login-perfil-btn:active {
          transform: translateY(0);
        }

        /* ── avatar ── */
        .login-avatar {
          width: 36px;
          height: 36px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
          letter-spacing: 0.02em;
        }
        .login-avatar-lg {
          width: 56px;
          height: 56px;
          font-size: 20px;
        }

        /* ── nome do perfil ── */
        .login-perfil-nome {
          flex: 1;
          font-size: var(--text-body-sm);
          font-weight: 600;
          color: var(--color-ink);
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .login-perfil-nome-full {
          font-size: var(--text-label);
          font-weight: 400;
          color: var(--color-ink-2);
        }

        .login-chevron {
          width: 16px;
          height: 16px;
          color: var(--color-ink-3);
          flex-shrink: 0;
        }

        /* ── tela de senha ── */
        .login-senha-form {
          display: flex;
          flex-direction: column;
        }
        .login-back {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          background: none;
          border: none;
          padding: 0;
          font-size: var(--text-label);
          color: var(--color-ink-2);
          cursor: pointer;
          margin-bottom: 1.5rem;
          width: fit-content;
          transition: color 0.15s;
        }
        .login-back:hover {
          color: var(--color-ink);
        }

        .login-senha-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .login-input-wrap {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }
        .login-input {
          width: 100%;
          height: 44px;
          padding: 0 1rem;
          background: var(--color-raised);
          border: 1px solid var(--color-hairline);
          border-radius: var(--radius-control);
          font-size: var(--text-body-sm);
          color: var(--color-ink);
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
        }
        .login-input::placeholder {
          color: var(--color-ink-3);
        }
        .login-input:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 15%, transparent);
        }

        .login-erro {
          font-size: var(--text-label);
          color: var(--color-danger);
          margin: 0;
          animation: login-shake 0.25s ease;
        }
        @keyframes login-shake {
          0%, 100% { transform: translateX(0); }
          25%       { transform: translateX(-4px); }
          75%       { transform: translateX(4px); }
        }

        .login-submit {
          width: 100%;
          height: 44px;
          background: var(--color-primary);
          color: #fff;
          border: none;
          border-radius: var(--radius-control);
          font-size: var(--text-body-sm);
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.1s;
        }
        .login-submit:hover:not(:disabled) {
          opacity: 0.9;
        }
        .login-submit:active:not(:disabled) {
          transform: scale(0.98);
        }
        .login-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
