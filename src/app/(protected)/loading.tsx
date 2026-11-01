// Shown while a page inside the app loads, so it never looks frozen.
export default function Loading() {
  return (
    <div className="space-y-6" role="status" aria-live="polite">
      <span className="sr-only">Wird geladen …</span>
      <div className="h-40 animate-pulse bg-navy-950/90" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="space-y-3 border border-slate-200 bg-white p-4">
            <div className="h-4 w-2/3 animate-pulse bg-slate-200" />
            <div className="h-28 animate-pulse bg-slate-100" />
            <div className="h-4 w-1/2 animate-pulse bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
