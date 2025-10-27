import { authAPI, type AuthResponse } from "@/api/auth"

const TOKEN_KEY = "atendo_token"
const REFRESH_TOKEN_KEY = "atendo_refresh_token"
const TOKEN_EXPIRY_KEY = "atendo_token_expiry"

export class AuthManager {
  /**
   * Save authentication tokens to localStorage
   */
  static saveTokens({ idToken, refreshToken, expiresIn }: AuthResponse) {
    localStorage.setItem("idToken", idToken);
    localStorage.setItem("refreshToken", refreshToken);
  
    // Guardar cookie para el middleware
    const maxAge = parseInt(expiresIn, 10); // expiresIn viene en segundos
    document.cookie = `atendo_token=${idToken}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  }
  

  /**
   * Get the current access token
   */
  static getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(TOKEN_KEY)
  }

  /**
   * Get the refresh token
   */
  static getRefreshToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(): boolean {
    if (typeof window === "undefined") return true

    const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY)
    if (!expiryTime) return true

    // Check if token expires in the next 5 minutes
    return Date.now() >= Number.parseInt(expiryTime) - 5 * 60 * 1000
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = this.getToken()
    return !!token && !this.isTokenExpired()
  }

  /**
   * Refresh the access token
   */
  static async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) return false

    try {
      const response = await authAPI.refreshToken(refreshToken)
      this.saveTokens(response)
      return true
    } catch (error) {
      console.error("[v0] Failed to refresh token:", error)
      this.clearTokens()
      return false
    }
  }

  /**
   * Clear all authentication tokens
   */
  static clearTokens(): void {
    if (typeof window === "undefined") return

    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(TOKEN_EXPIRY_KEY)
  }

  /**
   * Logout user
   */
  static logout(): void {
    this.clearTokens()
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
  }

  /**
   * Get token with automatic refresh
   */
  static async getValidToken(): Promise<string | null> {
    if (this.isTokenExpired()) {
      const refreshed = await this.refreshAccessToken()
      if (!refreshed) return null
    }
    return this.getToken()
  }
}