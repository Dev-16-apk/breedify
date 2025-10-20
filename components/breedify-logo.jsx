import { cn } from "../lib/utils"

export function BreedifyLogo({ className, ...props }) {
  return (
    <div className={cn("relative", className)} {...props}>
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Background Circle */}
        <circle cx="20" cy="20" r="18" fill="currentColor" className="text-amber-600" opacity="0.1" />

        {/* Cattle Silhouette */}
        <path
          d="M8 24c0-2 1-3 2-3h1c1-2 3-3 5-3s4 1 5 3h1c1 0 2 1 2 3v4c0 1-1 2-2 2h-1v2c0 1-1 2-2 2s-2-1-2-2v-2h-4v2c0 1-1 2-2 2s-2-1-2-2v-2H9c-1 0-2-1-2-2v-4z"
          fill="currentColor"
          className="text-amber-600"
        />

        {/* AI Circuit Pattern */}
        <g className="text-amber-500" opacity="0.6">
          <circle cx="12" cy="12" r="1" fill="currentColor" />
          <circle cx="28" cy="12" r="1" fill="currentColor" />
          <circle cx="12" cy="28" r="1" fill="currentColor" />
          <circle cx="28" cy="28" r="1" fill="currentColor" />
          <path
            d="M12 12h4m8 0h4M12 28h4m8 0h4M12 12v4m16-4v4M12 24v4m16-4v4"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.4"
          />
        </g>

        {/* Center Dot */}
        <circle cx="20" cy="20" r="2" fill="currentColor" className="text-amber-700" />
      </svg>
    </div>
  )
}
