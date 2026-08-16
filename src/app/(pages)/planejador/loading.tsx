import { AppShell } from "@/app/components/AppShell";
import { Skeleton, SkeletonCard } from "@/app/components/ui/Skeleton";

export default function PlanejadorLoading() {
  return (
    <AppShell title="Planejador">
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Skeleton className="h-16 w-64" />
          <Skeleton className="h-5 w-40 rounded-control" />
        </div>
        <div className="flex flex-col gap-5 lg:flex-row">
          <div className="min-w-0 flex-1 space-y-5">
            <SkeletonCard className="h-[600px]" />
            <SkeletonCard className="h-24" />
          </div>
          <SkeletonCard className="h-[400px] w-full shrink-0 lg:w-[320px]" />
        </div>
      </div>
    </AppShell>
  );
}
