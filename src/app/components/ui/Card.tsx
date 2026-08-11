import { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`bg-surface rounded-card shadow-resting p-6 ${className}`}
      {...props}
    />
  );
}
