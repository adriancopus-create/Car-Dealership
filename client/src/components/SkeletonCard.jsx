export default function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-bg-card">
      <div className="aspect-[16/9] w-full animate-pulseSoft bg-bg-card-hover" />
      <div className="space-y-2 p-3">
        <div className="h-4 w-3/4 animate-pulseSoft rounded bg-bg-card-hover" />
        <div className="h-3 w-1/2 animate-pulseSoft rounded bg-bg-card-hover" />
        <div className="flex justify-between pt-2">
          <div className="h-3 w-16 animate-pulseSoft rounded bg-bg-card-hover" />
          <div className="h-3 w-20 animate-pulseSoft rounded bg-bg-card-hover" />
        </div>
      </div>
    </div>
  );
}
