import Link from "next/link";
import { IconCalendar } from "@/app/components/ui/icons";
import { logoutAction } from "@/actions/auth";

export default function NotFound() {
  return (
    <div className="nf-bg">
      <div className="nf-card">
        <div className="nf-wordmark">
          <div className="nf-icon-wrap">
            <IconCalendar width={22} height={22} style={{ color: "var(--color-primary)" }} />
          </div>
          <span className="nf-brand">Grade</span>
        </div>

        <h1 className="nf-title">Nada por aqui</h1>
        <p className="nf-sub">
          Essa página não existe, ou ainda não há dados cadastrados para a sua conta — por exemplo, nenhum plano de
          grade criado ainda.
        </p>

        <div className="nf-actions">
          <Link href="/" className="nf-btn nf-btn-primary">
            Ir para o início
          </Link>
          <form action={logoutAction}>
            <button type="submit" className="nf-btn">
              Trocar de conta
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .nf-bg {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-canvas);
          padding: 1.5rem;
        }
        .nf-card {
          width: 100%;
          max-width: 400px;
          background: var(--color-surface);
          border: 1px solid var(--color-hairline);
          border-radius: var(--radius-dialog);
          padding: 2.5rem 2rem;
          box-shadow: var(--shadow-floating);
          text-align: center;
        }
        .nf-wordmark {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 2rem;
        }
        .nf-icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-control);
          background: color-mix(in srgb, var(--color-primary) 12%, transparent);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .nf-brand {
          font-family: var(--font-wordmark), sans-serif;
          font-size: 22px;
          color: var(--color-primary);
          font-weight: 600;
        }
        .nf-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--color-ink);
          margin: 0 0 0.5rem;
        }
        .nf-sub {
          font-size: var(--text-body-sm);
          color: var(--color-ink-2);
          margin: 0 0 1.5rem;
        }
        .nf-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .nf-btn {
          width: 100%;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-control);
          font-size: var(--text-body-sm);
          font-weight: 600;
          cursor: pointer;
          border: 1px solid var(--color-hairline);
          background: var(--color-raised);
          color: var(--color-ink);
          transition: opacity 0.15s;
        }
        .nf-btn:hover {
          opacity: 0.85;
        }
        .nf-btn-primary {
          background: var(--color-primary);
          color: #fff;
          border: none;
        }
      `}</style>
    </div>
  );
}
