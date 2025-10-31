"use client"

import { useEffect, useState } from "react"
import { PermissionManager } from "@/lib/permissions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, UserPlus, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { PermissionGuard } from "@/components/permission-guard"
import { usePermissions } from "@/contexts/permissions-context"

export default function ContactsPage() {
  const [canRead, setCanRead] = useState(false)
  const { canCreate, canUpdate, canDelete } = usePermissions()

  useEffect(() => {
    // Load permissions
    setCanRead(PermissionManager.canNavigate("contacts_tab"))
  }, [])

  if (!canRead) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to view contacts.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <PermissionGuard tab="contacts_tab">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Contacts</h1>
            <p className="text-muted-foreground">Manage your organization contacts</p>
          </div>
          {canCreate("contacts_tab") && (
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contact List</CardTitle>
            <CardDescription>Search and manage your contacts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search contacts..." className="pl-10" />
              </div>
            </div>

            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <div className="text-center">
                <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg font-medium">Contacts feature coming soon</p>
                <p className="text-sm">This is a placeholder for the contacts management system</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  )
}