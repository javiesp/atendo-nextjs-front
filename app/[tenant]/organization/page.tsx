"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { AuthManager } from "@/lib/auth"
import { tenantAPI } from "@/api/tenant"
import { userAPI } from "@/api/user"
import { roleAPI } from "@/api/role"
import type { TenantData, UserData, RoleData, CreateUserPayload, CreateRolePayload } from "@/types/api"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ColorPicker,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerFormat,
  ColorPickerHue,
  ColorPickerOutput,
  ColorPickerSelection,
} from '@/components/ui/shadcn-io/color-picker';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function OrganizationPage() {
  const params = useParams()
  const [tenant, setTenant] = useState<TenantData | null>(null)
  const [users, setUsers] = useState<UserData[]>([])
  const [roles, setRoles] = useState<RoleData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [isLoadingRoles, setIsLoadingRoles] = useState(false)
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false)
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false)

  // Form states
  const [settingsForm, setSettingsForm] = useState({
    tenant_name: "",
    whatsapp_number: "",
    api_key: "",
    is_api_enabled: false,
    chat_supervision_enabled: false,
  })

  const [featuresForm, setFeaturesForm] = useState({
    analytics: false,
    apis: "",
  })

  const [assetsForm, setAssetsForm] = useState({
    primary: "",
    secondary: "",
    tertiary: "",
  })

  const [newUserForm, setNewUserForm] = useState<CreateUserPayload>({
    org_id: params.tenant as string,
    name: "",
    email: "",
    password: "",
    role_id: "role_user",
  })

  const [newRoleForm, setNewRoleForm] = useState<CreateRolePayload>({
    org_id: params.tenant as string,
    name: "",
    is_default: false,
    permission_ids: [],
  })

  useEffect(() => {
    fetchTenant()
  }, [params.tenant])

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

      // Populate forms with current data
      setSettingsForm({
        tenant_name: tenantData.tenant_name || "",
        whatsapp_number: tenantData.whatsapp_number || "",
        api_key: tenantData.api_key || "",
        is_api_enabled: tenantData.is_api_enabled || false,
        chat_supervision_enabled: tenantData.chat_supervision_enabled || false,
      })

      setFeaturesForm({
        analytics: tenantData.features?.analytics || false,
        apis: tenantData.features?.apis || "",
      })

      setAssetsForm({
        primary: (tenantData.features?.assets as any)?.primary || "",
        secondary: (tenantData.features?.assets as any)?.secondary || "",
        tertiary: (tenantData.features?.assets as any)?.tertiary || "",
      })
    } catch (error) {
      console.error("[v0] Failed to fetch tenant:", error)
      toast.error("Failed to load organization data")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUsers = async () => {
    const token = AuthManager.getToken()
    const tenantId = params.tenant as string

    if (!token || !tenantId) return

    setIsLoadingUsers(true)
    try {
      const response = await userAPI.getUsers(tenantId, token, 1, 50)
      setUsers(response.users || (response as any))
    } catch (error) {
      console.error("[v0] Failed to fetch users:", error)
      toast.error("Failed to load users")
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const fetchRoles = async () => {
    const token = AuthManager.getToken()
    const tenantId = params.tenant as string

    if (!token || !tenantId) return

    setIsLoadingRoles(true)
    try {
      const rolesData = await roleAPI.getRoles(tenantId, token)
      setRoles(rolesData)
    } catch (error) {
      console.error("[v0] Failed to fetch roles:", error)
      toast.error("Failed to load roles")
    } finally {
      setIsLoadingRoles(false)
    }
  }

  const handleUpdateSettings = async () => {
    const token = AuthManager.getToken()
    const tenantId = params.tenant as string

    if (!token || !tenantId) return

    setIsSaving(true)
    try {
      await tenantAPI.updateSettings(tenantId, token, settingsForm)
      toast.success("Settings updated successfully")
      await fetchTenant()
    } catch (error) {
      console.error("[v0] Failed to update settings:", error)
      toast.error("Failed to update settings")
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateFeatures = async () => {
    const token = AuthManager.getToken()
    const tenantId = params.tenant as string

    if (!token || !tenantId) return

    setIsSaving(true)
    try {
      await tenantAPI.updateFeatures(tenantId, token, featuresForm)
      toast.success("Features updated successfully")
      await fetchTenant()
    } catch (error) {
      console.error("[v0] Failed to update features:", error)
      toast.error("Failed to update features")
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateAssets = async () => {
    const token = AuthManager.getToken()
    const tenantId = params.tenant as string

    if (!token || !tenantId) return

    setIsSaving(true)
    try {
      await tenantAPI.updateAssets(tenantId, token, assetsForm)
      toast.success("Assets updated successfully")
      await fetchTenant()
    } catch (error) {
      console.error("[v0] Failed to update assets:", error)
      toast.error("Failed to update assets")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateUser = async () => {
    setIsSaving(true)
    try {
      await userAPI.createUser(newUserForm)
      toast.success("User created successfully")
      setIsCreateUserOpen(false)
      setNewUserForm({
        org_id: params.tenant as string,
        name: "",
        email: "",
        password: "",
        role_id: "role_user",
      })
      await fetchUsers()
    } catch (error) {
      console.error("[v0] Failed to create user:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create user")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateRole = async () => {
    const token = AuthManager.getToken()

    if (!token) return

    setIsSaving(true)
    try {
      await roleAPI.createRole(token, newRoleForm)
      toast.success("Role created successfully")
      setIsCreateRoleOpen(false)
      setNewRoleForm({
        org_id: params.tenant as string,
        name: "",
        is_default: false,
        permission_ids: [],
      })
      await fetchRoles()
    } catch (error) {
      console.error("[v0] Failed to create role:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create role")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8">
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
            {[1, 2, 3].map((i) => (
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

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Organization Settings</h1>
        <p className="text-muted-foreground">Manage your organization configuration</p>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="users" onClick={() => users.length === 0 && fetchUsers()}>
            Users
          </TabsTrigger>
          <TabsTrigger value="roles" onClick={() => roles.length === 0 && fetchRoles()}>
            Roles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Update your organization basic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tenant-name">Organization Name</Label>
                <Input
                  id="tenant-name"
                  value={settingsForm.tenant_name}
                  onChange={(e) => setSettingsForm({ ...settingsForm, tenant_name: e.target.value })}
                  placeholder="Enter organization name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  value={settingsForm.whatsapp_number}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_number: e.target.value })}
                  placeholder="+1234567890"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  value={settingsForm.api_key}
                  onChange={(e) => setSettingsForm({ ...settingsForm, api_key: e.target.value })}
                  placeholder="Enter API key"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="api-enabled">API Access</Label>
                  <p className="text-sm text-muted-foreground">Enable API integration</p>
                </div>
                <Switch
                  id="api-enabled"
                  checked={settingsForm.is_api_enabled}
                  onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, is_api_enabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="chat-supervision">Chat Supervision</Label>
                  <p className="text-sm text-muted-foreground">Enable chat monitoring</p>
                </div>
                <Switch
                  id="chat-supervision"
                  checked={settingsForm.chat_supervision_enabled}
                  onCheckedChange={(checked) => setSettingsForm({ ...settingsForm, chat_supervision_enabled: checked })}
                />
              </div>
              <Button onClick={handleUpdateSettings} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Features Configuration</CardTitle>
              <CardDescription>Manage enabled features for your organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="analytics">Analytics</Label>
                  <p className="text-sm text-muted-foreground">Enable analytics tracking</p>
                </div>
                <Switch
                  id="analytics"
                  checked={featuresForm.analytics}
                  onCheckedChange={(checked) => setFeaturesForm({ ...featuresForm, analytics: checked })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apis">APIs Configuration</Label>
                <Input
                  id="apis"
                  value={featuresForm.apis}
                  onChange={(e) => setFeaturesForm({ ...featuresForm, apis: e.target.value })}
                  placeholder="API configuration string"
                />
              </div>
              <Button onClick={handleUpdateFeatures} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Features"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets">
          <Card>
            <CardHeader>
              <CardTitle>Assets Management</CardTitle>
              <CardDescription>Configure asset URLs for your organization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primary-asset">Primary Asset</Label>
                <ColorPicker className="max-w-sm rounded-md border bg-background p-4 shadow-sm">
                  <ColorPickerSelection />
                  <div className="flex items-center gap-4">
                    <ColorPickerEyeDropper />
                    <div className="grid w-full gap-1">
                      <ColorPickerHue />
                      <ColorPickerAlpha />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ColorPickerOutput />
                    <ColorPickerFormat />
                  </div>
                </ColorPicker>
                <Input
                  id="primary-asset"
                  value={assetsForm.primary}
                  onChange={(e) => setAssetsForm({ ...assetsForm, primary: e.target.value })}
                  placeholder="Primary asset URL or identifier"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary-asset">Secondary Asset</Label>
                <Input
                  id="secondary-asset"
                  value={assetsForm.secondary}
                  onChange={(e) => setAssetsForm({ ...assetsForm, secondary: e.target.value })}
                  placeholder="Secondary asset URL or identifier"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tertiary-asset">Tertiary Asset</Label>
                <Input
                  id="tertiary-asset"
                  value={assetsForm.tertiary}
                  onChange={(e) => setAssetsForm({ ...assetsForm, tertiary: e.target.value })}
                  placeholder="Tertiary asset URL or identifier"
                />
              </div>
              <Button onClick={handleUpdateAssets} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Assets"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Users Management</CardTitle>
                  <CardDescription>Manage organization members</CardDescription>
                </div>
                <Dialog open={isCreateUserOpen} onOpenChange={setIsCreateUserOpen}>
                  <DialogTrigger asChild>
                    <Button>Create User</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New User</DialogTitle>
                      <DialogDescription>Add a new member to your organization</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-user-name">Name</Label>
                        <Input
                          id="new-user-name"
                          value={newUserForm.name}
                          onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-user-email">Email</Label>
                        <Input
                          id="new-user-email"
                          type="email"
                          value={newUserForm.email}
                          onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                          placeholder="john@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-user-password">Password</Label>
                        <Input
                          id="new-user-password"
                          type="password"
                          value={newUserForm.password}
                          onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-user-role">Role ID</Label>
                        <Input
                          id="new-user-role"
                          value={newUserForm.role_id}
                          onChange={(e) => setNewUserForm({ ...newUserForm, role_id: e.target.value })}
                          placeholder="role_user"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateUserOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateUser} disabled={isSaving}>
                        {isSaving ? "Creating..." : "Create User"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingUsers ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : users.length === 0 ? (
                <p className="text-center text-muted-foreground">No users found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.uid}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role_id}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Roles Management</CardTitle>
                  <CardDescription>Manage user roles and permissions</CardDescription>
                </div>
                <Dialog open={isCreateRoleOpen} onOpenChange={setIsCreateRoleOpen}>
                  <DialogTrigger asChild>
                    <Button>Create Role</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Role</DialogTitle>
                      <DialogDescription>Define a new role for your organization</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-role-name">Role Name</Label>
                        <Input
                          id="new-role-name"
                          value={newRoleForm.name}
                          onChange={(e) => setNewRoleForm({ ...newRoleForm, name: e.target.value })}
                          placeholder="Manager"
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <Label htmlFor="is-default">Default Role</Label>
                          <p className="text-sm text-muted-foreground">Assign to new users automatically</p>
                        </div>
                        <Switch
                          id="is-default"
                          checked={newRoleForm.is_default}
                          onCheckedChange={(checked) => setNewRoleForm({ ...newRoleForm, is_default: checked })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="permission-ids">Permission IDs (comma-separated)</Label>
                        <Input
                          id="permission-ids"
                          value={newRoleForm.permission_ids.join(", ")}
                          onChange={(e) =>
                            setNewRoleForm({
                              ...newRoleForm,
                              permission_ids: e.target.value.split(",").map((id) => id.trim()),
                            })
                          }
                          placeholder="perm_1, perm_2, perm_3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateRoleOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateRole} disabled={isSaving}>
                        {isSaving ? "Creating..." : "Create Role"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingRoles ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : roles.length === 0 ? (
                <p className="text-center text-muted-foreground">No roles found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Default</TableHead>
                      <TableHead>Permissions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((role) => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell>
                          <Badge variant={role.is_default ? "default" : "secondary"}>
                            {role.is_default ? "Yes" : "No"}
                          </Badge>
                        </TableCell>
                        <TableCell>{role.permission_ids.length} permissions</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
