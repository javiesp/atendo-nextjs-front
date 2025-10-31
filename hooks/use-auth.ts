"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthManager } from "@/lib/auth"
import { authAPI, type LoginData, type RegisterData } from "@/api/auth"
import { usePermissions } from "@/contexts/permissions-context"

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { setPermissions, clearPermissions } = usePermissions()

  useEffect(() => {
    AuthManager.setPermissionsCallback(setPermissions)
    checkAuth()
  }, [setPermissions])

  const checkAuth = async () => {
    const authenticated = AuthManager.isAuthenticated()

    if (authenticated && AuthManager.isTokenExpired()) {
      const refreshed = await AuthManager.refreshAccessToken()
      setIsAuthenticated(refreshed)
    } else {
      setIsAuthenticated(authenticated)
    }

    setIsLoading(false)
  }

  const login = async (data: LoginData) => {
    try {
      const response = await authAPI.login(data)
      console.log("[v0] Login response received:", response.uid)

      AuthManager.saveTokens(response)
      setIsAuthenticated(true)

      const orgId = response.org_id || AuthManager.getOrgId()

      if (!orgId) {
        console.error("[v0] No org_id found in response")
        return {
          success: false,
          error: "Organization ID not found",
        }
      }

      console.log("[v0] Initializing permissions...")
      const permissionsLoaded = await AuthManager.initializePermissions()

      if (!permissionsLoaded) {
        console.error("[v0] Failed to load permissions")
        return {
          success: false,
          error: "Failed to load user permissions",
        }
      }

      console.log("[v0] Permissions loaded successfully, redirecting to:", `/${orgId}`)

      setTimeout(() => {
        router.replace(`/${orgId}`)
        window.location.href = `/${orgId}`
      }, 100)

      return { success: true }
    } catch (error) {
      console.error("[v0] Login error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      }
    }
  }

  const register = async (data: RegisterData) => {
    try {
      await authAPI.register(data)

      const loginResponse = await authAPI.login({
        email: data.email,
        password: data.password,
      })

      AuthManager.saveTokens(loginResponse)
      setIsAuthenticated(true)

      const orgId = loginResponse.org_id || AuthManager.getOrgId()

      if (!orgId) {
        router.push("/")
        return { success: true }
      }

      console.log("[v0] Initializing permissions after registration...")
      const permissionsLoaded = await AuthManager.initializePermissions()

      if (!permissionsLoaded) {
        console.error("[v0] Failed to load permissions after registration")
      }

      router.push(`/${orgId}`)

      return { success: true }
    } catch (error) {
      console.error("[v0] Registration error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Registration failed",
      }
    }
  }

  const logout = () => {
    clearPermissions()
    AuthManager.logout()
    setIsAuthenticated(false)
  }

  return {
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  }
}