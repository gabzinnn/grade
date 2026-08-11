import { ReactNode } from "react";
import { SidebarNav } from "@/app/components/SidebarNav";
import { Avatar } from "@/app/components/ui/Avatar";
import { Input } from "@/app/components/ui/Input";
import { IconCalendar, IconBell, IconSearch, IconGear } from "@/app/components/ui/icons";

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
    <div className="flex min-h-full bg-canvas">
      <aside className="flex w-[232px] shrink-0 flex-col bg-surface p-4">
        <div className="flex items-center gap-2 px-2 py-3">
          <IconCalendar className="text-primary" />
          <span className="font-wordmark text-[20px] text-primary">Grade</span>
        </div>

        <div className="mt-4 flex-1">
          <SidebarNav />
        </div>

        <div className="flex flex-col gap-2">
          <button className="flex h-11 items-center rounded-control bg-raised px-3 text-left text-body-sm text-ink shadow-resting">
            {planoNome}
          </button>
          <div className="flex items-center gap-2 px-1 py-2">
            <Avatar nome={usuarioNome} />
            <span className="flex-1 text-body-sm text-ink">{usuarioNome}</span>
            <IconGear className="text-ink-2" />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[68px] items-center justify-between px-8">
          <div>
            <h1 className="text-title font-semibold text-ink">{title}</h1>
            {subtitulo && <p className="text-label text-ink-2">{subtitulo}</p>}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-[320px]">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
              <Input placeholder="Buscar..." className="w-full pl-9" />
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-control hover:bg-recess">
              <IconBell className="text-ink-2" />
            </button>
            {topBarRight}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          <div className="mx-auto max-w-[1200px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
