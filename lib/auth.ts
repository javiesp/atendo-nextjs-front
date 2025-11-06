import { authAPI, type AuthResponse } from "@/api/auth"
import { userAPI } from "@/api/user"
import { roleAPI } from "@/api/role"
import { permissionAPI } from "@/api/permission"
import type { NavigationPermissions } from "@/types/api"

const TOKEN_KEY = "atendo_token"
const REFRESH_TOKEN_KEY = "atendo_refresh_token"
const TOKEN_EXPIRY_KEY = "atendo_token_expiry"
const ORG_ID_KEY = "atendo_org_id"
const USER_ID_KEY = "atendo_user_id"

let permissionsCallback: ((permissions: NavigationPermissions) => void) | null = null

export class AuthManager {
  static setPermissionsCallback(callback: (permissions: NavigationPermissions) => void) {
    console.log("[AuthManager] Callback registered")
    permissionsCallback = callback
  }

  static saveTokens({ idToken, refreshToken, expiresIn, org_id, uid }: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, idToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
    localStorage.setItem(USER_ID_KEY, uid)

    const expiryTime = Date.now() + Number.parseInt(expiresIn, 10) * 1000
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString())

    if (org_id) {
      localStorage.setItem(ORG_ID_KEY, org_id)
    }

    const maxAge = Number.parseInt(expiresIn, 10)
    document.cookie = `atendo_token=${idToken}; Path=/; Max-Age=${maxAge}; SameSite=Lax`
  }

  static getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(TOKEN_KEY)
  }

  static getRefreshToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  }

  static getOrgId(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(ORG_ID_KEY)
  }

  static getUserId(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem(USER_ID_KEY)
  }

  static setUserId(userId: string): void {
    if (typeof window === "undefined") return
    localStorage.setItem(USER_ID_KEY, userId)
  }

  static isTokenExpired(): boolean {
    if (typeof window === "undefined") return true

    const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY)
    if (!expiryTime) return true

    return Date.now() >= Number.parseInt(expiryTime) - 5 * 60 * 1000
  }

  static isAuthenticated(): boolean {
    const token = this.getToken()
    return !!token && !this.isTokenExpired()
  }

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

  static clearTokens(): void {
    if (typeof window === "undefined") return

    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(TOKEN_EXPIRY_KEY)
    localStorage.removeItem(ORG_ID_KEY)
    localStorage.removeItem(USER_ID_KEY)

    // Clear permissions from context
    if (permissionsCallback) {
      permissionsCallback({
        home_tab: { p_read: false, p_create: false, p_update: false, p_delete: false },
        contacts_tab: { p_read: false, p_create: false, p_update: false, p_delete: false },
        users_tab: { p_read: false, p_create: false, p_update: false, p_delete: false },
        organization_tab: { p_read: false, p_create: false, p_update: false, p_delete: false },
        profile_tab: { p_read: false, p_create: false, p_update: false, p_delete: false },
        integrations_tab: { p_read: false, p_create: false, p_update: false, p_delete: false },
        whatsapp_tab: { p_read: false, p_create: false, p_update: false, p_delete: false },
      })
    }

    document.cookie = "atendo_token=; Path=/; Max-Age=0"
  }

  static logout(): void {
    this.clearTokens()
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
  }

  static async getValidToken(): Promise<string | null> {
    if (this.isTokenExpired()) {
      const refreshed = await this.refreshAccessToken()
      if (!refreshed) return null
    }
    return this.getToken()
  }

  static async initializePermissions(): Promise<boolean> {
    try {
      const token = this.getToken()
      const orgId = this.getOrgId()
      const userId = this.getUserId()

      console.log("[AuthManager] initializePermissions called - callback registered?", !!permissionsCallback)

      if (!token || !orgId || !userId) {
        console.error("[AuthManager] Missing credentials for permission initialization")
        return false
      }

      console.log("[AuthManager] Starting permission initialization...")

      const userData = await userAPI.getUserById(orgId, userId, token)
      console.log("[AuthManager] User data loaded:", userData.email)

      if (!userData.role_id) {
        console.error("[AuthManager] User has no role assigned")
        return false
      }

      const roleData = await roleAPI.getRoleById(orgId, userData.role_id, token)
      console.log("[AuthManager] Role data loaded:", roleData.name)

      if (!roleData.permission_ids || roleData.permission_ids.length === 0) {
        console.error("[AuthManager] Role has no permissions assigned")
        return false
      }

      const permissionPromises = roleData.permission_ids.map((permId) => permissionAPI.getPermissionById(permId, token))
      const permissions = await Promise.all(permissionPromises)
      console.log("[AuthManager] Loaded", permissions.length, "permission(s)")

      if (permissions.length > 0) {
        console.log("[AuthManager] First permission structure:", permissions[0])
      }

      const mergedPermissions = this.mergePermissions(permissions.map((p) => p.navigation))
      console.log("[AuthManager] Merged permissions:", mergedPermissions)

      if (permissionsCallback) {
        console.log("[AuthManager] Calling permissions callback with merged permissions")
        permissionsCallback(mergedPermissions)
      } else {
        console.error("[AuthManager] No callback registered! Permissions will not be saved to context")
      }

      console.log("[AuthManager] Permissions initialized successfully")
      return true
    } catch (error) {
      console.error("[AuthManager] Failed to initialize permissions:", error)
      return false
    }
  }

  private static mergePermissions(permissionSets: NavigationPermissions[]): NavigationPermissions {
    const merged: NavigationPermissions = {
      home_tab: { p_read: false, p_create: false, p_update: false, p_delete: false },
      contacts_tab: { p_read: false, p_create: false, p_update: false, p_delete: false },
      users_tab: { p_read: false, p_create: false, p_update: false, p_delete: false },
      organization_tab: { p_read: false, p_create: false, p_update: false, p_delete: false },
      profile_tab: { p_read: false, p_create: false, p_update: false, p_delete: false },
      integrations_tab: { p_read: false, p_create: false, p_update: false, p_delete: false },
      whatsapp_tab: { p_read: false, p_create: false, p_update: false, p_delete: false },
    }

    for (const permSet of permissionSets) {
      for (const tab in merged) {
        const tabKey = tab as keyof NavigationPermissions
        if (permSet[tabKey]) {
          merged[tabKey].p_read = merged[tabKey].p_read || permSet[tabKey].p_read
          merged[tabKey].p_create = merged[tabKey].p_create || permSet[tabKey].p_create
          merged[tabKey].p_update = merged[tabKey].p_update || permSet[tabKey].p_update
          merged[tabKey].p_delete = merged[tabKey].p_delete || permSet[tabKey].p_delete
        }
      }
    }

    return merged
  }
}