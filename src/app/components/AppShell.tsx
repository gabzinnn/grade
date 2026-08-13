import { ReactNode } from "react";
import { AppShellNavProvider } from "@/app/components/AppShellNavContext";
import { AppShellMenuButton } from "@/app/components/AppShellMenuButton";
import { AppShellSidebar } from "@/app/components/AppShellSidebar";

interface AppShellProps {
  title: string;
  subtitulo?: string;
  topBarRight?: ReactNode;
  planoNome?: string;
  usuarioNome?: string;
  children: ReactNode;
}

export function AppShell({
  title,
  subtitulo,
  topBarRight,
  planoNome = "Plano principal",
  usuarioNome = "Gabriel",
  children,
}: AppShellProps) {
  return (
    <AppShellNavProvider>
      <div className="flex h-screen overflow-hidden bg-canvas">
        <AppShellSidebar planoNome={planoNome} usuarioNome={usuarioNome} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-[60px] shrink-0 items-center justify-between gap-3 px-4 md:h-[68px] md:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <AppShellMenuButton />
              <div className="min-w-0">
                <h1 className="truncate text-title font-semibold text-ink">{title}</h1>
                {subtitulo && <p className="truncate text-label text-ink-2">{subtitulo}</p>}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 md:gap-3">{topBarRight}</div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="mx-auto max-w-[1200px]">{children}</div>
          </main>
        </div>
      </div>
    </AppShellNavProvider>
  );
}
