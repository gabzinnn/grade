"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconHome,
  IconGrid,
  IconPath,
  IconBook,
  IconUsers,
  IconLayers,
  IconUser,
} from "@/app/components/ui/icons";

const ITENS = [
  { href: "/", label: "Início", Icon: IconHome },
  { href: "/planejador", label: "Planejador", Icon: IconGrid },
  { href: "/trilha", label: "Trilha", Icon: IconPath },
  { href: "/catalogo", label: "Catálogo", Icon: IconBook },
  { href: "/nossa-semana", label: "Nossa semana", Icon: IconUsers },
  { divider: true },
  { href: "/cenarios", label: "Cenários", Icon: IconLayers },
  { href: "/perfil", label: "Perfil", Icon: IconUser },
] as const;

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {ITENS.map((item, i) => {
        if ("divider" in item) {
          return <div key={i} className="my-5 border-t border-hairline" />;
        }
        const ativo = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex items-center gap-3 h-10 px-3 rounded-[12px] text-body-sm transition-colors ${
              ativo ? "bg-primary/12 text-ink" : "text-ink-2 hover:bg-recess"
            }`}
          >
            {ativo && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-chip bg-primary" />
            )}
            <item.Icon className={ativo ? "text-primary" : "text-ink-2"} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
