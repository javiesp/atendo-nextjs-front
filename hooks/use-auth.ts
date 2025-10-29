"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthManager } from "@/lib/auth"
import { authAPI, type LoginData, type RegisterData } from "@/api/auth"

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const authenticated = AuthManager.isAuthenticated()

    if (authenticated && AuthManager.isTokenExpired()) {
      // Try to refresh token
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
      AuthManager.saveTokens(response)
      setIsAuthenticated(true)

      const orgId = response.org_id || AuthManager.getOrgId()

      if (orgId) {
        setTimeout(() => {
          router.replace(`/${orgId}`)
          window.location.href = `/${orgId}`
        }, 100)
      } else {
        console.error("[v0] No org_id found in response")
        return {
          success: false,
          error: "Organization ID not found",
        }
      }

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
      // After registration, automatically login
      const loginResponse = await authAPI.login({
        email: data.email,
        password: data.password,
      })
      AuthManager.saveTokens(loginResponse)
      setIsAuthenticated(true)

      const orgId = loginResponse.org_id || AuthManager.getOrgId()

      if (orgId) {
        router.push(`/${orgId}`)
      } else {
        router.push("/")
      }

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