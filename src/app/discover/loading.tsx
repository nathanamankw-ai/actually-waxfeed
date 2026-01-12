export default function DiscoverLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Section 1 */}
      <div className="mb-10">
        <div className="h-6 w-40 bg-[#222] rounded animate-pulse mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-square bg-[#1a1a1a] rounded animate-pulse" />
              <div className="h-3 w-3/4 bg-[#1a1a1a] rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-[#1a1a1a] rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Section 2 */}
      <div className="mb-10">
        <div className="h-6 w-32 bg-[#222] rounded animate-pulse mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-square bg-[#1a1a1a] rounded animate-pulse" />
              <div className="h-3 w-3/4 bg-[#1a1a1a] rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-[#1a1a1a] rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
