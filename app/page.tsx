"use client"

import { useEffect, useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { AuthManager } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { useRouter } from "next/navigation"

function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string } | null>(null)

  useEffect(() => {
    // You can decode the JWT token here to get user info
    const token = AuthManager.getToken()
    if (token) {
      // For now, just show that user is authenticated
      setUser({ email: "User" })
    }
  }, [])

  const handleLogout = () => {
    AuthManager.logout()
    router.push("/login")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="/logos/logo-black.webp"
            alt="Atendo Logo"
            width={150}
            height={50}
            className="dark:hidden"
            priority
          />
          <Image
            src="/logos/logo-white.webp"
            alt="Atendo Logo"
            width={150}
            height={50}
            className="hidden dark:block"
            priority
          />
        </div>

        {/* Welcome Card */}
        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold tracking-tight">Welcome to Atendo</CardTitle>
            <CardDescription className="text-lg">You're successfully authenticated</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground">Logged in as</p>
              <p className="font-medium">{user?.email}</p>
            </div>

            <Button onClick={handleLogout} variant="outline" className="w-full bg-transparent">
              Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <AuthGuard>
      <HomePage />
    </AuthGuard>
  )
}
