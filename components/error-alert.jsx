"use client"

import { AlertCircle, X } from "lucide-react"
import { useState } from "react"

export function ErrorAlert({ message, onDismiss, type = "error" }) {
  const [isVisible, setIsVisible] = useState(true)

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  if (!isVisible) return null

  const bgColor = type === "error" ? "bg-red-50" : type === "warning" ? "bg-amber-50" : "bg-blue-50"
  const borderColor = type === "error" ? "border-red-200" : type === "warning" ? "border-amber-200" : "border-blue-200"
  const textColor = type === "error" ? "text-red-800" : type === "warning" ? "text-amber-800" : "text-blue-800"
  const iconColor = type === "error" ? "text-red-600" : type === "warning" ? "text-amber-600" : "text-blue-600"

  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-4 flex items-start gap-3`}>
      <AlertCircle className={`h-5 w-5 ${iconColor} flex-shrink-0 mt-0.5`} />
      <div className="flex-1">
        <p className={`${textColor} text-sm font-medium`}>{message}</p>
      </div>
      <button onClick={handleDismiss} className={`${textColor} hover:opacity-70 transition-opacity flex-shrink-0`}>
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
