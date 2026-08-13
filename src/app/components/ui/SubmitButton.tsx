"use client";

import { ButtonHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  /** Botão só de ícone: enquanto pendente, troca o conteúdo inteiro por um spinner. */
  spinnerOnly?: boolean;
}

const BASE = "h-10 px-4 rounded-control text-body-sm font-medium transition-opacity disabled:opacity-40";
const VARIANTS = {
  primary: "bg-primary text-raised hover:opacity-90",
  secondary: "bg-surface border border-hairline text-ink-2 hover:bg-recess",
};

export function SubmitButton({ children, variant, spinnerOnly, className = "", ...props }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const classes = variant ? `${BASE} ${VARIANTS[variant]} ${className}` : className;

  return (
    <button type="submit" disabled={pending} className={classes} {...props}>
      {pending ? (
        spinnerOnly ? (
          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <span className="inline-flex items-center justify-center gap-2">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {children}
          </span>
        )
      ) : (
        children
      )}
    </button>
  );
}
