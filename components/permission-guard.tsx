"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { usePermissions } from "@/contexts/permissions-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import type { NavigationPermissions } from "@/types/api"

interface PermissionGuardProps {
  children: React.ReactNode
  tab: keyof NavigationPermissions
  fallbackPath?: string
}

export function PermissionGuard({ children, tab, fallbackPath }: PermissionGuardProps) {
  const router = useRouter()
  const { canNavigate, isLoading } = usePermissions()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)

  useEffect(() => {
    if (!isLoading) {
      const access = canNavigate(tab)
      setHasAccess(access)

      if (!access && fallbackPath) {
        router.replace(fallbackPath)
      }
    }
  }, [canNavigate, tab, isLoading, fallbackPath, router])

  if (isLoading || hasAccess === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don&apos;t have permission to view this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Contact your administrator if you believe you should have access to this resource.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
