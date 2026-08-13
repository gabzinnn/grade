"use client";

import { useLinkStatus } from "next/link";

/** Usar como filho direto de um <Link>; mostra um spinner enquanto a navegação carrega. */
export function LinkPendingOverlay() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <span className="absolute inset-0 z-20 flex items-center justify-center rounded-[inherit] bg-surface/70">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </span>
  );
}
