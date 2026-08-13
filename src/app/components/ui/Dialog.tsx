"use client";

import { ReactNode, useEffect, useRef } from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  className?: string;
  children: ReactNode;
}

export function Dialog({ open, onClose, className = "max-w-lg", children }: DialogProps) {
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
      className={`fixed inset-0 m-auto max-h-[88vh] w-full overflow-y-auto rounded-dialog bg-surface p-6 shadow-floating backdrop:bg-ink/40 ${className}`}
    >
      {children}
    </dialog>
  );
}
