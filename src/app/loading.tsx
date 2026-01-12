export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero skeleton */}
      <div className="mb-8">
        <div className="h-8 w-48 bg-[#222] rounded animate-pulse mb-4" />
        <div className="h-4 w-96 bg-[#1a1a1a] rounded animate-pulse" />
      </div>
      
      {/* Grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="aspect-square bg-[#1a1a1a] rounded animate-pulse" />
            <div className="h-3 w-3/4 bg-[#1a1a1a] rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-[#1a1a1a] rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
