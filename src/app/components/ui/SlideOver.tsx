"use client";

import { ReactNode, useEffect, useRef } from "react";

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function SlideOver({ open, onClose, children }: SlideOverProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-0 ml-auto h-dvh max-h-dvh w-full max-w-md rounded-none shadow-floating bg-surface p-6 backdrop:bg-ink/40"
    >
      {children}
    </dialog>
  );
}
