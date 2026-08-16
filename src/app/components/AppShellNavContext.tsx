"use client";

import { createContext, ReactNode, useContext, useState } from "react";

interface AppShellNavState {
  open: boolean;
  setOpen: (open: boolean) => void;
  desktopOpen: boolean;
  setDesktopOpen: (open: boolean) => void;
}

const AppShellNavContext = createContext<AppShellNavState | null>(null);

export function AppShellNavProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);
  return (
    <AppShellNavContext.Provider value={{ open, setOpen, desktopOpen, setDesktopOpen }}>
      {children}
    </AppShellNavContext.Provider>
  );
}

export function useAppShellNav(): AppShellNavState {
  const ctx = useContext(AppShellNavContext);
  if (!ctx) throw new Error("useAppShellNav precisa estar dentro de AppShellNavProvider");
  return ctx;
}
