import { AppShell } from "@/app/components/AppShell";
import { Skeleton, SkeletonCard } from "@/app/components/ui/Skeleton";

export default function CenariosLoading() {
  return (
    <AppShell title="Comparar cenários" subtitulo="Análise de impacto no seu plano de estudos">
      <div className="flex flex-col gap-5">
        <Skeleton className="h-10 w-72" />
        <div className="flex flex-col gap-5 lg:flex-row">
          <SkeletonCard className="h-[420px] flex-1" />
          <SkeletonCard className="h-[420px] flex-1" />
        </div>
      </div>
    </AppShell>
  );
}
