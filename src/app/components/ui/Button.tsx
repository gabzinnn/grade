import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const base = "h-10 px-4 rounded-control text-body-sm font-medium transition-opacity disabled:opacity-40";
  const variants = {
    primary: "bg-primary text-raised hover:opacity-90",
    secondary: "bg-surface border border-hairline text-ink-2 hover:bg-recess",
  };
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
