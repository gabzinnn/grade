interface AvatarProps {
  nome: string;
  size?: number;
  className?: string;
}

export function Avatar({ nome, size = 28, className = "" }: AvatarProps) {
  const inicial = nome.trim().charAt(0).toUpperCase();
  return (
    <span
      className={`inline-flex items-center justify-center rounded-chip bg-primary text-raised text-caps font-medium ${className}`}
      style={{ width: size, height: size }}
    >
      {inicial}
    </span>
  );
}
