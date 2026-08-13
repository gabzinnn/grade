export default function PlanejadorLoading() {
  return (
    <div className="animate-pulse space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="h-16 w-64 rounded-card bg-recess" />
        <div className="h-5 w-40 rounded-control bg-recess" />
      </div>
      <div className="flex flex-col gap-5 lg:flex-row">
        <div className="min-w-0 flex-1 space-y-5">
          <div className="h-[600px] rounded-card border border-hairline bg-recess" />
          <div className="h-24 rounded-card border border-hairline bg-recess" />
        </div>
        <div className="h-[400px] w-full shrink-0 rounded-card border border-hairline bg-recess lg:w-[320px]" />
      </div>
    </div>
  );
}
