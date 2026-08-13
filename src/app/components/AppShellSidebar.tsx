"use client";

import { useAppShellNav } from "@/app/components/AppShellNavContext";
import { SidebarNav } from "@/app/components/SidebarNav";
import { Avatar } from "@/app/components/ui/Avatar";
import { IconCalendar, IconGear } from "@/app/components/ui/icons";

interface AppShellSidebarProps {
  planoNome: string;
  usuarioNome: string;
}

export function AppShellSidebar({ planoNome, usuarioNome }: AppShellSidebarProps) {
  const { open, setOpen } = useAppShellNav();

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-ink/40 md:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[232px] shrink-0 flex-col bg-surface p-4 transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 px-2 py-3">
          <IconCalendar className="text-primary" />
          <span className="font-wordmark text-[20px] text-primary">Grade</span>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto" onClick={() => setOpen(false)}>
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
    </>
  );
}
