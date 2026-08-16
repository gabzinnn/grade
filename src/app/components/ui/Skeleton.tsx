/** Bloco cinza pulsante pros loading.tsx das rotas. `h`/`w` são classes Tailwind
 * (h-10, w-full...) porque cada rota tem uma silhueta diferente. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-card bg-recess ${className}`} />;
}

/** Moldura padrão: o conteúdo da página inteira em estado de carregamento. */
export function SkeletonCard({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-card border border-hairline bg-recess ${className}`} />;
}
