"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare, Send, Phone } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PermissionGuard } from "@/components/permission-guard"
import { usePermissions } from "@/contexts/permissions-context"

export default function WhatsAppPage() {
  const { canCreate } = usePermissions()

  return (
    <PermissionGuard tab="whatsapp_tab">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">WhatsApp Integration</h1>
            <p className="text-muted-foreground">Manage your WhatsApp Business integration</p>
          </div>
          {canCreate("whatsapp_tab") && (
            <Button>
              <Send className="mr-2 h-4 w-4" />
              Send Message
            </Button>
          )}
        </div>

        <Tabs defaultValue="messages" className="space-y-4">
          <TabsList>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>WhatsApp Messages</CardTitle>
                <CardDescription>View and manage your WhatsApp conversations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">WhatsApp integration coming soon</p>
                    <p className="text-sm">This is a placeholder for the WhatsApp messaging system</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Message Templates</CardTitle>
                <CardDescription>Create and manage WhatsApp message templates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <div className="text-center">
                    <Phone className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p className="text-lg font-medium">Templates feature coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>WhatsApp Settings</CardTitle>
                <CardDescription>Configure your WhatsApp Business API settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <div className="text-center">
                    <p className="text-lg font-medium">Settings coming soon</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PermissionGuard>
  )
}
