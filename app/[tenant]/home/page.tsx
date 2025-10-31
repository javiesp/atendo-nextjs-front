"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AuthManager } from "@/lib/auth"
import { tenantAPI } from "@/api/tenant"
import type { TenantData } from "@/types/api"
import { Badge } from "@/components/ui/badge"

export default function HomePage() {
  const params = useParams()
  const [tenant, setTenant] = useState<TenantData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTenant = async () => {
      const token = AuthManager.getToken()
      const tenantId = params.tenant as string

      if (!token || !tenantId) {
        setError("Authentication required")
        setIsLoading(false)
        return
      }

      try {
        const tenantData = await tenantAPI.getTenantById(tenantId, token)
        setTenant(tenantData)
      } catch (err) {
        console.error("[v0] Failed to fetch tenant:", err)
        setError(err instanceof Error ? err.message : "Failed to load organization data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTenant()
  }, [params.tenant])

  if (isLoading) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="mb-8">
          <Skeleton className="mb-2 h-9 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="mb-2 h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="mb-2 h-8 w-24" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error || !tenant) {
    return (
      <div className="container max-w-6xl py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error || "Failed to load organization data"}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{tenant.tenant_name}</h1>
        <p className="text-muted-foreground">Organization Overview</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Plan Information</CardTitle>
            <CardDescription>Current subscription plan</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Plan {tenant.plan_id}</p>
            <p className="text-sm text-muted-foreground">Active plan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Organization members</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{tenant.current_users_count >= 0 ? tenant.current_users_count : "N/A"}</p>
            <p className="text-sm text-muted-foreground">
              {tenant.max_users_limit === -1 ? "Unlimited" : `Max: ${tenant.max_users_limit}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>WhatsApp</CardTitle>
            <CardDescription>Connected number</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">{tenant.whatsapp_number || "Not configured"}</p>
            <p className="text-sm text-muted-foreground">Primary channel</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Access</CardTitle>
            <CardDescription>Integration status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant={tenant.is_api_enabled ? "default" : "secondary"}>
                {tenant.is_api_enabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            {tenant.is_api_enabled && tenant.api_key && (
              <p className="text-xs font-mono text-muted-foreground">Key: {tenant.api_key.substring(0, 8)}...</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Features</CardTitle>
            <CardDescription>Enabled capabilities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {tenant.features?.analytics !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Analytics</span>
                <Badge variant={tenant.features.analytics ? "default" : "secondary"}>
                  {tenant.features.analytics ? "On" : "Off"}
                </Badge>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm">Chat Supervision</span>
              <Badge variant={tenant.chat_supervision_enabled ? "default" : "secondary"}>
                {tenant.chat_supervision_enabled ? "On" : "Off"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meta Integration</CardTitle>
            <CardDescription>WhatsApp Business API</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              <span className="font-medium">App ID:</span> {tenant.meta_app_id}
            </p>
            <p className="text-sm">
              <span className="font-medium">WABA ID:</span> {tenant.waba_id}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}