"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plug, Database, Mail, CreditCard, Bell } from "lucide-react"

const integrations = [
  {
    name: "Database",
    description: "Connect your database for data storage",
    icon: Database,
    status: "Not connected",
  },
  {
    name: "Email Service",
    description: "Send transactional emails to users",
    icon: Mail,
    status: "Not connected",
  },
  {
    name: "Payment Gateway",
    description: "Accept payments from customers",
    icon: CreditCard,
    status: "Not connected",
  },
  {
    name: "Notifications",
    description: "Send push notifications to users",
    icon: Bell,
    status: "Not connected",
  },
]

export default function IntegrationsPage() {
  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">Connect your favorite tools and services to enhance your workflow</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {integrations.map((integration) => {
          const Icon = integration.icon
          return (
            <Card key={integration.name}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <CardDescription className="text-sm">{integration.description}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{integration.status}</span>
                  <Button variant="outline" size="sm">
                    <Plug className="mr-2 h-4 w-4" />
                    Connect
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
