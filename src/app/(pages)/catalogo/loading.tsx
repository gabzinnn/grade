import { AppShell } from "@/app/components/AppShell";
import { Skeleton, SkeletonCard } from "@/app/components/ui/Skeleton";

export default function CatalogoLoading() {
  return (
    <AppShell title="Catálogo">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <SkeletonCard className="h-[560px]" />
      </div>
    </AppShell>
  );
}
