//cat src/app/loading.tsx

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-ocean-950 h-32" />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <div className="h-40 bg-gray-200 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}