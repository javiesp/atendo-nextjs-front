"use client"

import type React from "react"
import { useState } from "react"
import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import { AuthGuard } from "@/components/auth-guard"

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)

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
