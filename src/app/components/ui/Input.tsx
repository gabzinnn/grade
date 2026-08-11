import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`h-10 px-3 rounded-control bg-raised border border-hairline text-body-sm text-ink placeholder:text-ink-3 outline-none focus:ring-2 focus:ring-primary ${className}`}
      {...props}
    />
  );
}
