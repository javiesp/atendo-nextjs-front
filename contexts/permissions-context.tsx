"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { NavigationPermissions, TabPermissions } from "@/types/api"

interface PermissionsContextType {
  permissions: NavigationPermissions | null
  setPermissions: (permissions: NavigationPermissions) => void
  clearPermissions: () => void
  hasPermission: (tab: keyof NavigationPermissions, action: keyof TabPermissions) => boolean
  canNavigate: (tab: keyof NavigationPermissions) => boolean
  canCreate: (tab: keyof NavigationPermissions) => boolean
  canUpdate: (tab: keyof NavigationPermissions) => boolean
  canDelete: (tab: keyof NavigationPermissions) => boolean
  getTabPermissions: (tab: keyof NavigationPermissions) => Readonly<TabPermissions> | null
  isLoading: boolean
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined)

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissionsState] = useState<NavigationPermissions | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  const setPermissions = (newPermissions: NavigationPermissions) => {
    console.log("[PermissionsContext] Setting permissions with tabs:", Object.keys(newPermissions))
    console.log("[PermissionsContext] Full permissions object:", newPermissions)
    // Freeze to prevent modifications
    const frozen = Object.freeze(JSON.parse(JSON.stringify(newPermissions)))
    setPermissionsState(frozen as NavigationPermissions)
  }

  const clearPermissions = () => {
    console.log("[PermissionsContext] Clearing permissions")
    setPermissionsState(null)
  }

  const hasPermission = (tab: keyof NavigationPermissions, action: keyof TabPermissions): boolean => {
    if (!permissions) {
      console.log(
        `[PermissionsContext] hasPermission(${String(tab)}, ${String(action)}): No permissions loaded, returning false`,
      )
      return false
    }

    const tabPermissions = permissions[tab]
    if (!tabPermissions) {
      console.log(
        `[PermissionsContext] hasPermission(${String(tab)}, ${String(action)}): Tab not found in permissions, available tabs:`,
        Object.keys(permissions),
      )
      return false
    }

    const permission = tabPermissions[action]
    if (permission === undefined || permission === null) {
      console.log(`[PermissionsContext] hasPermission(${String(tab)}, ${String(action)}): Action not found or null`)
      return false
    }

    const result = permission === true
    console.log(`[PermissionsContext] hasPermission(${String(tab)}, ${String(action)}): ${result}`)
    return result
  }

  const canNavigate = (tab: keyof NavigationPermissions): boolean => {
    const result = hasPermission(tab, "p_read")
    console.log(`[PermissionsContext] canNavigate(${String(tab)}): ${result}`)
    return result
  }

  const canCreate = (tab: keyof NavigationPermissions): boolean => {
    return hasPermission(tab, "p_create")
  }

  const canUpdate = (tab: keyof NavigationPermissions): boolean => {
    return hasPermission(tab, "p_update")
  }

  const canDelete = (tab: keyof NavigationPermissions): boolean => {
    return hasPermission(tab, "p_delete")
  }

  const getTabPermissions = (tab: keyof NavigationPermissions): Readonly<TabPermissions> | null => {
    if (!permissions || !permissions[tab]) return null
    return Object.freeze(permissions[tab])
  }

  return (
    <PermissionsContext.Provider
      value={{
        permissions,
        setPermissions,
        clearPermissions,
        hasPermission,
        canNavigate,
        canCreate,
        canUpdate,
        canDelete,
        getTabPermissions,
        isLoading,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  )
}

export function usePermissions() {
  const context = useContext(PermissionsContext)
  if (context === undefined) {
    throw new Error(
      "usePermissions must be used within a PermissionsProvider. " +
        "Make sure PermissionsProvider wraps your component tree in app/layout.tsx",
    )
  }
  return context
}
