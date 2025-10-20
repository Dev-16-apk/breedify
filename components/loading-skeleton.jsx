"use client"

export function LoadingSkeleton({ count = 3, type = "card" }) {
  if (type === "card") {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-stone-200 rounded-lg h-24 animate-pulse" />
        ))}
      </div>
    )
  }

  if (type === "table") {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="bg-stone-200 rounded h-12 flex-1 animate-pulse" />
            <div className="bg-stone-200 rounded h-12 w-24 animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  if (type === "chart") {
    return <div className="bg-stone-200 rounded-lg h-80 animate-pulse" />
  }

  return <div className="bg-stone-200 rounded-lg h-12 animate-pulse" />
}
