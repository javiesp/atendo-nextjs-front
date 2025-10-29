"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { AuthManager } from "@/lib/auth"
import { tenantAPI, type Tenant } from "@/api/tenant"

export default function OrganizationPage() {
  const params = useParams()
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTenant = async () => {
      const token = AuthManager.getToken()
      const tenantId = params.tenant as string

      if (!token || !tenantId) {
        setIsLoading(false)
        return
      }

      try {
        const tenantData = await tenantAPI.getTenantById(tenantId, token)
        setTenant(tenantData)
      } catch (error) {
        console.error("[v0] Failed to fetch tenant:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTenant()
  }, [params.tenant])

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Organization</h1>
        <p className="text-muted-foreground">Manage your organization settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>Update your organization information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-id">Organization ID</Label>
            <Input id="org-id" value={params.tenant as string} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input id="org-name" placeholder="Enter organization name" defaultValue={tenant?.name || ""} />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  )
}