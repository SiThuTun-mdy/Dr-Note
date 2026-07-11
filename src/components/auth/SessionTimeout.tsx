"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface SessionTimeoutProps {
  /** Minutes before session expires to show warning */
  warningMinutes?: number
  /** Show warning dialog */
  onShowWarning?: () => void
  /** Session expired callback */
  onExpired?: () => void
}

/**
 * Session timeout component that monitors session expiry
 * and shows a warning before the session expires.
 *
 * Usage:
 * <SessionTimeout warningMinutes={5} />
 */
export function SessionTimeout({
  warningMinutes = 5,
  onShowWarning,
  onExpired,
}: SessionTimeoutProps) {
  const [showWarning, setShowWarning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const router = useRouter()
  const supabase = createClient()
  const mountedRef = useRef(false)

  const checkSession = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      if (mountedRef.current) {
        onExpired?.()
        router.push("/login")
      }
      return
    }

    // Calculate time left until session expires
    const expiresAt = session.expires_at ?? 0
    const now = Math.floor(Date.now() / 1000)
    const timeLeftSeconds = expiresAt - now
    const timeLeftMinutes = Math.floor(timeLeftSeconds / 60)

    if (mountedRef.current) {
      setTimeLeft(timeLeftMinutes)

      // Show warning if within warning window
      if (timeLeftMinutes <= warningMinutes && timeLeftMinutes > 0) {
        setShowWarning(true)
        onShowWarning?.()
      }

      // Session expired
      if (timeLeftSeconds <= 0) {
        onExpired?.()
        router.push("/login")
      }
    }
  }, [warningMinutes, onShowWarning, onExpired, router, supabase])

  // Extend session by refreshing the token
  const extendSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session) {
      // Refresh the session to extend expiry
      await supabase.auth.refreshSession()
      setShowWarning(false)
      // Recheck session after extension
      await checkSession()
    }
  }

  // Logout immediately
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  // Check session every minute
  useEffect(() => {
    mountedRef.current = true

    // Initial check - use setTimeout to avoid synchronous setState
    const timer = setTimeout(() => {
      checkSession()
    }, 0)

    // Check every 60 seconds
    const interval = setInterval(checkSession, 60 * 1000)

    return () => {
      mountedRef.current = false
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [checkSession])

  // Don't render anything if no warning needed
  if (!showWarning || timeLeft <= 0) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
            <svg
              className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Session Expiring Soon
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your session will expire in {timeLeft} minute{timeLeft !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
          For your security, you will be automatically logged out when your
          session expires. Any unsaved work may be lost.
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleLogout}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Logout Now
          </button>
          <button
            onClick={extendSession}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Extend Session
          </button>
        </div>
      </div>
    </div>
  )
}
