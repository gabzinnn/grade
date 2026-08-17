"use client";

import { useTransition } from "react";
import { logoutAction } from "@/actions/auth";

interface LogoutButtonProps {
  className?: string;
  title?: string;
  children: React.ReactNode;
}

// Reload completo após o logout — não router-navigation — pra garantir que
// o QueryClient (e todo o resto do estado em memória) do usuário anterior
// seja descartado antes do próximo login.
export function LogoutButton({ className, title, children }: LogoutButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      title={title}
      disabled={pending}
      className={className}
      onClick={() =>
        startTransition(async () => {
          await logoutAction();
          window.location.href = "/login";
        })
      }
    >
      {children}
    </button>
  );
}
