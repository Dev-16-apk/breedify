"use client"

import { Button } from "./ui/button"
import { RotateCcw, Loader2 } from "lucide-react"

export function RetryButton({ onClick, isLoading = false, children = "Try Again" }) {
  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      variant="outline"
      className="border-stone-300 text-stone-700 hover:bg-stone-50 bg-transparent"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Retrying...
        </>
      ) : (
        <>
          <RotateCcw className="h-4 w-4 mr-2" />
          {children}
        </>
      )}
    </Button>
  )
}
