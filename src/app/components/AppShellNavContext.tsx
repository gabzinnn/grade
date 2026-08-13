"use client";

import { createContext, ReactNode, useContext, useState } from "react";

interface AppShellNavState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AppShellNavContext = createContext<AppShellNavState | null>(null);

export function AppShellNavProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <AppShellNavContext.Provider value={{ open, setOpen }}>{children}</AppShellNavContext.Provider>;
}

export function useAppShellNav(): AppShellNavState {
  const ctx = useContext(AppShellNavContext);
  if (!ctx) throw new Error("useAppShellNav precisa estar dentro de AppShellNavProvider");
  return ctx;
}
