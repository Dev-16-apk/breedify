"use client"

import { useState, useCallback, useEffect } from "react"

export function useAsync(asyncFunction, immediate = true) {
  const [status, setStatus] = useState("idle")
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const execute = useCallback(async () => {
    setStatus("pending")
    setData(null)
    setError(null)

    try {
      const response = await asyncFunction()
      setData(response)
      setStatus("success")
      return response
    } catch (err) {
      setError(err)
      setStatus("error")
      throw err
    }
  }, [asyncFunction])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return { execute, status, data, error, isLoading: status === "pending" }
}
