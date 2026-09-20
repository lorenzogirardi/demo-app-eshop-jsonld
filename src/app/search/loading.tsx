export default function SearchLoading() {
  return (
    <div aria-busy="true">
      <p role="status" className="mb-4 flex items-center gap-2 text-sm opacity-70">
        <span className="loading loading-dots loading-sm" aria-hidden="true" />
        Searching the catalog. AI searches can take around ten seconds.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="card w-full animate-pulse bg-base-100">
            <div className="h-48 rounded-t-xl bg-base-300" />
            <div className="card-body gap-3">
              <div className="h-5 w-2/3 rounded bg-base-300" />
              <div className="h-4 w-full rounded bg-base-300" />
              <div className="h-4 w-4/5 rounded bg-base-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
