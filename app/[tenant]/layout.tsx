"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { AuthManager } from "@/lib/auth"
import { usePermissions } from "@/contexts/permissions-context"

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const { permissions, setPermissions, isLoading } = usePermissions()
  const [hasInitialized, setHasInitialized] = useState(false)

  useEffect(() => {
    if (!hasInitialized) {
      console.log("[TenantLayout] Setting up permissions callback")
      AuthManager.setPermissionsCallback((perms) => {
        console.log("[TenantLayout] Callback received, setting permissions:", Object.keys(perms))
        setPermissions(perms)
      })

      console.log("[TenantLayout] Initializing permissions...")
      AuthManager.initializePermissions()
      setHasInitialized(true)
    }
  }, [hasInitialized, setPermissions])

  return (
    <AuthGuard>
      <div className="min-h-screen">
        <AppHeader onMenuClick={() => setMobileMenuOpen(true)} />
        <div className="flex pt-14">
          <AppSidebar
            mobileOpen={mobileMenuOpen}
            onMobileClose={() => setMobileMenuOpen(false)}
            isExpanded={sidebarExpanded}
            onExpandedChange={setSidebarExpanded}
          />
          <main className={`flex-1 p-4 transition-all duration-300 ${sidebarExpanded ? "md:ml-64" : "md:ml-16"}`}>
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}