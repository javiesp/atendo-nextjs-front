"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { AuthManager } from "@/lib/auth"
import { userAPI } from "@/api/user"
import type { UserData } from "@/types/api"

export default function ProfilePage() {
  const params = useParams()
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const token = AuthManager.getToken()
      const userId = AuthManager.getUserId()
      const orgId = params.tenant as string

      if (!token || !orgId || !userId) {
        setError("Authentication required")

        console.log('----debug----')
        console.log(token)
        console.log(orgId)
        console.log(userId)
        
        setIsLoading(false)
        return
      }

      try {
        const userData = await userAPI.getUserById(orgId, userId, token)
        setUser(userData)
      } catch (err) {
        console.error("[v0] Failed to fetch user:", err)
        setError(err instanceof Error ? err.message : "Failed to load user profile")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [params.tenant])

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-8">
        <div className="mb-8">
          <Skeleton className="mb-2 h-9 w-48" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="mb-2 h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="container max-w-2xl py-8">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
            <CardDescription>{error || "Failed to load user profile"}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Make sure you're logged in and have set your user ID. You can set it after login.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatDate = (timestamp: { _seconds: number; _nanoseconds: number }) => {
    return new Date(timestamp._seconds * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
        <p className="text-muted-foreground">Your personal information and account details</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={user.name} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user-id">User ID</Label>
              <Input id="user-id" value={user.uid} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={user.role_id} disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
            <CardDescription>Current account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Email Verified</span>
              <Badge variant={user.is_verified ? "default" : "secondary"}>
                {user.is_verified ? "Verified" : "Not Verified"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Auth Source</span>
              <Badge variant="outline">{user.auth_source}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Activity</CardTitle>
            <CardDescription>Important dates and timestamps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Account Created</span>
              <span className="font-medium">{formatDate(user.created_at)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Last Updated</span>
              <span className="font-medium">{formatDate(user.updated_at)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Last Login</span>
              <span className="font-medium">{formatDate(user.last_login_at)}</span>
            </div>
          </CardContent>
        </Card>

        {user.assigned_whatsapp_numbers && user.assigned_whatsapp_numbers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Assigned WhatsApp Numbers</CardTitle>
              <CardDescription>Numbers you have access to</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {user.assigned_whatsapp_numbers.map((number, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="outline">{number}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}