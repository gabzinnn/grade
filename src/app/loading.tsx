import { AppShell } from "@/app/components/AppShell";
import { SkeletonCard } from "@/app/components/ui/Skeleton";

export default function InicioLoading() {
  return (
    <AppShell title="Início">
      <div className="flex flex-col gap-5">
        <SkeletonCard className="h-[140px]" />
        <div className="flex flex-col gap-5 lg:flex-row">
          <SkeletonCard className="h-[340px] lg:w-[62%]" />
          <div className="flex flex-col gap-5 lg:w-[38%]">
            <SkeletonCard className="h-[120px]" />
            <SkeletonCard className="h-[200px]" />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
