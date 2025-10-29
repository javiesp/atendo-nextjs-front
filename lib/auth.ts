import { authAPI, type AuthResponse } from "@/api/auth"

const TOKEN_KEY = "atendo_token"
const REFRESH_TOKEN_KEY = "atendo_refresh_token"
const TOKEN_EXPIRY_KEY = "atendo_token_expiry"
const ORG_ID_KEY = "atendo_org_id"

export class AuthManager {
  /**
   * Save authentication tokens to localStorage
   */
  static saveTokens({ idToken, refreshToken, expiresIn, org_id }: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, idToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)

    // Calculate expiry time
    const expiryTime = Date.now() + Number.parseInt(expiresIn, 10) * 1000
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString())

    if (org_id) {
      localStorage.setItem(ORG_ID_KEY, org_id)
    }

    // Guardar cookie para el middleware
    const maxAge = Number.parseInt(expiresIn, 10) // expiresIn viene en segundos
    document.cookie = `atendo_token=${idToken}; Path=/; Max-Age=${maxAge}; SameSite=Lax`
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
   * Get the stored org_id
   */
  static getOrgId(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(ORG_ID_KEY)
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
      console.error("Failed to refresh token:", error)
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
    localStorage.removeItem(ORG_ID_KEY)

    document.cookie = "atendo_token=; Path=/; Max-Age=0"
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