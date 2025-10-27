"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthManager } from "@/lib/auth"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      if (!AuthManager.isAuthenticated()) {
        // Try to refresh token
        if (AuthManager.getRefreshToken()) {
          const refreshed = await AuthManager.refreshAccessToken()
          if (!refreshed) {
            router.push("/login")
          }
        } else {
          router.push("/login")
        }
      }
    }

    checkAuth()
  }, [router]);

  return <>{children}</>;
}
