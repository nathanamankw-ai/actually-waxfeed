export default function MessagesLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="h-8 w-32 bg-gray-200 animate-pulse mb-6" />
      
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-gray-50 border border-gray-200 p-4 flex gap-3">
            <div className="w-12 h-12 bg-gray-200  animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-gray-200 animate-pulse" />
              <div className="h-3 w-48 bg-gray-200 animate-pulse" />
            </div>
            <div className="h-3 w-12 bg-gray-200 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
