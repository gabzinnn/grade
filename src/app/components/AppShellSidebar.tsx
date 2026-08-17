"use client";

import { useAppShellNav } from "@/app/components/AppShellNavContext";
import { SidebarNav } from "@/app/components/SidebarNav";
import { Avatar } from "@/app/components/ui/Avatar";
import { IconCalendar, IconLogOut, IconPanelLeft } from "@/app/components/ui/icons";
import { LogoutButton } from "@/app/components/LogoutButton";

interface AppShellSidebarProps {
  planoNome?: string;
  usuarioNome?: string;
}

export function AppShellSidebar({ planoNome, usuarioNome }: AppShellSidebarProps) {
  const { open, setOpen, desktopOpen, setDesktopOpen } = useAppShellNav();

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-ink/40 md:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[232px] shrink-0 flex-col overflow-hidden bg-surface p-4 transition-[transform,width] duration-200 md:static md:z-auto md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } ${desktopOpen ? "md:w-[232px]" : "md:w-[72px] md:px-3"}`}
      >
        <div className={`flex items-center py-3 ${desktopOpen ? "justify-between px-2" : "justify-center px-0"}`}>
          {desktopOpen && (
            <div className="flex items-center gap-2">
              <IconCalendar className="text-primary" />
              <span className="font-wordmark text-[20px] text-primary">Grade</span>
            </div>
          )}
          <button
            onClick={() => setDesktopOpen(!desktopOpen)}
            title={desktopOpen ? "Recolher menu" : "Expandir menu"}
            aria-label={desktopOpen ? "Recolher menu" : "Expandir menu"}
            className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-control text-ink-2 hover:bg-recess md:flex"
          >
            <IconPanelLeft />
          </button>
        </div>

        <div className="mt-4 flex-1 overflow-y-auto" onClick={() => setOpen(false)}>
          <SidebarNav collapsed={!desktopOpen} />
        </div>

        <div className="flex flex-col gap-2">
          <button
            title={desktopOpen ? undefined : planoNome}
            className={`flex h-11 items-center rounded-control bg-raised text-left text-body-sm text-ink shadow-resting ${
              desktopOpen ? "px-3" : "justify-center px-0"
            }`}
          >
            {planoNome ? (
              desktopOpen ? planoNome : planoNome.charAt(0)
            ) : (
              <span className={`h-3 animate-pulse rounded-chip bg-recess ${desktopOpen ? "w-28" : "w-4"}`} />
            )}
          </button>
          <div className={`flex items-center gap-2 py-2 ${desktopOpen ? "px-1" : "justify-center px-0"}`}>
            {usuarioNome ? <Avatar nome={usuarioNome} /> : <span className="h-8 w-8 animate-pulse rounded-full bg-recess" />}
            {desktopOpen &&
              (usuarioNome ? (
                <>
                  <span className="flex-1 text-body-sm text-ink">{usuarioNome}</span>
                  <LogoutButton title="Sair" className="flex text-ink-2 hover:text-ink">
                    <IconLogOut />
                  </LogoutButton>
                </>
              ) : (
                <span className="h-3 w-20 animate-pulse rounded-chip bg-recess" />
              ))}
          </div>
        </div>
      </aside>
    </>
  );
}
