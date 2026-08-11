import { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className = "", ...props }: SelectProps) {
  return (
    <select
      className={`h-10 px-3 rounded-control bg-raised border border-hairline text-body-sm text-ink outline-none focus:ring-2 focus:ring-primary ${className}`}
      {...props}
    />
  );
}
