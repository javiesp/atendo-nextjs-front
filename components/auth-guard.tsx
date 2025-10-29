"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthManager } from "@/lib/auth"
import { Spinner } from "@/components/ui/spinner"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = AuthManager.isAuthenticated()

      if (!authenticated) {
        router.push("/login")
        return
      }

      if (AuthManager.isTokenExpired()) {
        const refreshed = await AuthManager.refreshAccessToken()
        if (!refreshed) {
          router.push("/login")
        }
      }
    }

    checkAuth()
  }, [router])

  if (!AuthManager.isAuthenticated()) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return <>{children}</>
}