import { AppShell } from "@/app/components/AppShell";
import { Skeleton, SkeletonCard } from "@/app/components/ui/Skeleton";

export default function NossaSemanaLoading() {
  return (
    <AppShell title="Nossa semana">
      <div className="flex flex-col gap-5 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-9 w-64" />
          <SkeletonCard className="h-[600px]" />
        </div>
        <div className="flex w-full shrink-0 flex-col gap-5 lg:w-[320px]">
          <SkeletonCard className="h-[240px]" />
          <SkeletonCard className="h-[140px]" />
        </div>
      </div>
    </AppShell>
  );
}
