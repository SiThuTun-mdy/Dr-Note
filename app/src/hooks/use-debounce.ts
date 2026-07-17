"use client"

import { useState, useEffect } from "react"

/**
 * Debounce a value by `delay` ms. Returns the stale value until `delay` ms
 * after the last change, then returns the latest value.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
