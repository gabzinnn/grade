"use client";

import { useAppShellNav } from "@/app/components/AppShellNavContext";
import { IconMenu } from "@/app/components/ui/icons";

export function AppShellMenuButton() {
  const { setOpen } = useAppShellNav();
  return (
    <button
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control text-ink-2 hover:bg-recess md:hidden"
      onClick={() => setOpen(true)}
      aria-label="Abrir menu"
    >
      <IconMenu />
    </button>
  );
}
