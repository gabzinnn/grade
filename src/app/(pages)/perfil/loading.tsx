import { AppShell } from "@/app/components/AppShell";
import { SkeletonCard } from "@/app/components/ui/Skeleton";

export default function PerfilLoading() {
  return (
    <AppShell title="Meu perfil" subtitulo="Gerencie suas informações e preferências">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <SkeletonCard className="h-[260px]" />
        <SkeletonCard className="h-[260px]" />
        <SkeletonCard className="h-[200px]" />
        <SkeletonCard className="h-[200px]" />
      </div>
    </AppShell>
  );
}
