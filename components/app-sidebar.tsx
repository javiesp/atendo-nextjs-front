"use client"

import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  Home,
  Settings,
  Users,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Building2,
  UserCircle,
  Plug,
  MessageSquare,
  Contact,
} from "lucide-react"
import { useEffect, useState } from "react"
import { usePermissions } from "@/contexts/permissions-context"
import type { NavigationPermissions } from "@/types/api"

const navigationItems = [
  { name: "Dashboard", href: "", icon: LayoutDashboard, permissionTab: "home_tab" as keyof NavigationPermissions },
  { name: "Home", href: "/home", icon: Home, permissionTab: "home_tab" as keyof NavigationPermissions },
  { name: "Contacts", href: "/contacts", icon: Contact, permissionTab: "contacts_tab" as keyof NavigationPermissions },
  { name: "Users", href: "/users", icon: Users, permissionTab: "users_tab" as keyof NavigationPermissions },
  {
    name: "Organization",
    href: "/organization",
    icon: Building2,
    permissionTab: "organization_tab" as keyof NavigationPermissions,
  },
  { name: "Profile", href: "/profile", icon: UserCircle, permissionTab: "profile_tab" as keyof NavigationPermissions },
  {
    name: "Integrations",
    href: "/integrations",
    icon: Plug,
    permissionTab: "integrations_tab" as keyof NavigationPermissions,
  },
  {
    name: "WhatsApp",
    href: "/whatsapp",
    icon: MessageSquare,
    permissionTab: "whatsapp" as keyof NavigationPermissions,
  },
  { name: "Settings", href: "/settings", icon: Settings, permissionTab: "home_tab" as keyof NavigationPermissions },
]

interface AppSidebarProps {
  mobileOpen?: boolean
  onMobileClose?: () => void
  isExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
}

function SidebarContent({ isExpanded, onToggle }: { isExpanded: boolean; onToggle: () => void }) {
  const params = useParams()
  const pathname = usePathname()
  const tenantId = params.tenant as string
  const { canNavigate, permissions } = usePermissions()
  const [visibleNavigation, setVisibleNavigation] = useState(navigationItems)

  useEffect(() => {
    console.log("[v0] Permissions loaded:", permissions)

    if (!permissions) {
      console.log("[v0] No permissions available, hiding all navigation")
      setVisibleNavigation([])
      return
    }

    console.log("[v0] Available permission tabs:", Object.keys(permissions))

    const filtered = navigationItems.filter((item) => {
      const hasAccess = canNavigate(item.permissionTab)
      console.log(`[v0] Checking ${item.name} (${item.permissionTab}):`, hasAccess)
      return hasAccess
    })

    console.log(
      "[v0] Visible navigation items:",
      filtered.map((item) => item.name),
    )
    setVisibleNavigation(filtered)
  }, [canNavigate, permissions])

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-1 p-2">
        {visibleNavigation.length === 0 && permissions && (
          <div className="p-4 text-center text-sm text-muted-foreground">No navigation items available</div>
        )}
        {visibleNavigation.map((item) => {
          const href = `/${tenantId}${item.href}`
          const isActive = pathname === href
          const Icon = item.icon

          return (
            <Link key={item.name} href={href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn("w-full justify-start", !isExpanded && "justify-center px-2")}
              >
                <Icon className={cn("h-5 w-5", isExpanded && "mr-3")} />
                {isExpanded && <span>{item.name}</span>}
              </Button>
            </Link>
          )
        })}
      </div>

      <div className="border-t border-border p-2">
        <Button
          variant="ghost"
          size="sm"
          className={cn("w-full", !isExpanded && "justify-center px-2")}
          onClick={onToggle}
        >
          {isExpanded ? (
            <>
              <ChevronLeft className="mr-2 h-4 w-4" />
              <span>Collapse</span>
            </>
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
}

export function AppSidebar({ mobileOpen, onMobileClose, isExpanded = false, onExpandedChange }: AppSidebarProps) {
  const handleToggle = () => {
    onExpandedChange?.(!isExpanded)
  }

  return (
    <>
      <aside
        className={cn(
          "fixed left-0 top-14 z-40 hidden h-[calc(100vh-3.5rem)] border-r border-border bg-background transition-all duration-300 md:block",
          isExpanded ? "w-64" : "w-16",
        )}
      >
        <SidebarContent isExpanded={isExpanded} onToggle={handleToggle} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={onMobileClose}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="h-full pt-14">
            <SidebarContent isExpanded={true} onToggle={() => {}} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}