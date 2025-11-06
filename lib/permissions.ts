import type { NavigationPermissions, TabPermissions } from "@/types/api"

const PERMISSIONS_KEY = "atendo_permissions"

/**
 * PermissionManager - Manages user permissions in a read-only, secure way
 *
 * SECURITY RULES:
 * 1. Permissions are IMMUTABLE once loaded - no modification allowed
 * 2. All permission checks return false if permission is null/undefined
 * 3. No direct access to modify permissions from outside this class
 */
export class PermissionManager {
  /**
   * Save permissions to localStorage (INTERNAL USE ONLY - called during login)
   */
  static savePermissions(permissions: NavigationPermissions): void {
    console.warn("[PermissionManager] This method is deprecated. Permissions are now stored in memory via context.")
  }

  /**
   * Get all permissions (READ-ONLY)
   */
  static getPermissions(): Readonly<NavigationPermissions> | null {
    console.warn("[PermissionManager] This method is deprecated. Use usePermissions hook instead.")
    return null
  }

  /**
   * Check if user has permission for a specific tab and action
   */
  static hasPermission(tab: keyof NavigationPermissions, action: keyof TabPermissions): boolean {
    console.warn("[PermissionManager] This method is deprecated. Use usePermissions hook instead.")
    return false
  }

  /**
   * Check if user can navigate to a specific tab
   */
  static canNavigate(tab: keyof NavigationPermissions): boolean {
    console.warn("[PermissionManager] This method is deprecated. Use usePermissions hook instead.")
    return false
  }

  /**
   * Check if user can create in a specific tab
   */
  static canCreate(tab: keyof NavigationPermissions): boolean {
    console.warn("[PermissionManager] This method is deprecated. Use usePermissions hook instead.")
    return false
  }

  /**
   * Check if user can update in a specific tab
   */
  static canUpdate(tab: keyof NavigationPermissions): boolean {
    console.warn("[PermissionManager] This method is deprecated. Use usePermissions hook instead.")
    return false
  }

  /**
   * Check if user can delete in a specific tab
   */
  static canDelete(tab: keyof NavigationPermissions): boolean {
    console.warn("[PermissionManager] This method is deprecated. Use usePermissions hook instead.")
    return false
  }

  /**
   * Get all permissions for a specific tab
   */
  static getTabPermissions(tab: keyof NavigationPermissions): Readonly<TabPermissions> | null {
    console.warn("[PermissionManager] This method is deprecated. Use usePermissions hook instead.")
    return null
  }

  /**
   * Clear all permissions (called during logout)
   */
  static clearPermissions(): void {
    // No-op
  }

  /**
   * Get list of tabs user can navigate to
   */
  static getNavigableTabs(): Array<keyof NavigationPermissions> {
    console.warn("[PermissionManager] This method is deprecated. Use usePermissions hook instead.")
    return []
  }
}
