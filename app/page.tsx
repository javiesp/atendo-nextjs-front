"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AuthManager } from "@/lib/auth"
import { Spinner } from "@/components/ui/spinner"

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    const orgId = AuthManager.getOrgId()
    const isAuthenticated = AuthManager.isAuthenticated()

    if (isAuthenticated && orgId) {
      router.replace(`/${orgId}`)
    } else {
      router.replace("/login")
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  )
}