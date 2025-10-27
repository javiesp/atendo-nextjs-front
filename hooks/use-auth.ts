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
      const response = await authAPI.login(data);
      AuthManager.saveTokens(response);
      setIsAuthenticated(true);
  
      // Esperamos un tick del event loop para que React actualice estado
      setTimeout(() => {
        router.replace("/");
        // fuerza recarga completa para limpiar el estado previo
        window.location.href = "/";
      }, 100);
  
      return { success: true };
    } catch (error) {
      console.error("[v0] Login error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      };
    }
  };
  
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
      router.push("/")
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