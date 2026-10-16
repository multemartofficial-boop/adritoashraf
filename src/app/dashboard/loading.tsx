export default function DashboardLoading() {
  return (
    <div className="pt-4" aria-busy>
      <div className="h-7 w-28 animate-pulse rounded-full bg-white/[0.08]" />
      <div className="mt-4 h-12 w-64 max-w-full animate-pulse rounded-2xl bg-white/[0.08]" />
      <div className="mt-3 h-4 w-80 max-w-[80%] animate-pulse rounded-lg bg-white/[0.06]" />
      <ul
        className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
        aria-hidden
      >
        {[0, 1, 2].map((i) => (
          <li key={i}>
            <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04]">
              <div className="aspect-[16/10] animate-pulse bg-white/[0.06]" />
              <div className="space-y-2.5 p-5">
                <div className="h-5 w-3/4 animate-pulse rounded-lg bg-white/[0.08]" />
                <div className="h-3.5 w-1/2 animate-pulse rounded-lg bg-white/[0.06]" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
