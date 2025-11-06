"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { AuthManager } from "@/lib/auth"
import { tenantAPI } from "@/api/tenant"
import type { TenantData } from "@/types/api"
import { usePermissions } from "@/contexts/permissions-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Building2, User, LogOut, Menu } from "lucide-react"

interface AppHeaderProps {
  onMenuClick?: () => void
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const params = useParams()
  const router = useRouter()
  const [tenant, setTenant] = useState<TenantData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { canNavigate, permissions } = usePermissions()

  useEffect(() => {
    const fetchTenant = async () => {
      const token = AuthManager.getToken()
      const orgId = params.tenant as string

      if (!token || !orgId) {
        setIsLoading(false)
        return
      }

      try {
        const tenantData = await tenantAPI.getTenantById(orgId, token)
        setTenant(tenantData)
      } catch (error) {
        console.error("Failed to fetch tenant:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTenant()
  }, [params.tenant])

  const handleLogout = () => {
    AuthManager.logout()
    router.push("/login")
  }

  const handleUserProfile = () => {
    if (!canNavigate("profile_tab")) {
      return
    }
    router.push(`/${params.tenant}/profile`)
  }

  const handleOrgProfile = () => {
    if (!canNavigate("organization_tab")) {
      return
    }
    router.push(`/${params.tenant}/organization`)
  }

  const showProfileOption = permissions && canNavigate("profile_tab")
  const showOrgOption = permissions && canNavigate("organization_tab")

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        <Button variant="ghost" size="icon" className="mr-2 md:hidden" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <div>
            <h1>Atendo</h1>
          </div>
          {!isLoading && tenant && (
            <>
              <div className="hidden h-4 w-px bg-border sm:block" />
              <span className="hidden text-sm text-muted-foreground sm:inline">{tenant.tenant_name}</span>
            </>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">My Account</p>
                  <p className="text-xs leading-none text-muted-foreground">{tenant?.tenant_name || "Loading..."}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {showProfileOption && (
                <DropdownMenuItem onClick={handleUserProfile}>
                  <User className="mr-2 h-4 w-4" />
                  <span>User Profile</span>
                </DropdownMenuItem>
              )}
              {showOrgOption && (
                <DropdownMenuItem onClick={handleOrgProfile}>
                  <Building2 className="mr-2 h-4 w-4" />
                  <span>Organization</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
