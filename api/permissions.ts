import dotenv from "dotenv"
import type { PermissionData } from "@/types/api"

dotenv.config()

const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_ATENDO && process.env.NEXT_PUBLIC_API_ATENDO !== ""
    ? process.env.NEXT_PUBLIC_API_ATENDO
    : "http://localhost:3004"

class PermissionAPI {
  /**
   * Get a specific permission by ID
   */
  async getPermissionById(permissionId: string, token: string): Promise<PermissionData> {
    const response = await fetch(`${API_BASE_URL}/permissions/${permissionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch permission")
    }

    return response.json()
  }

  /**
   * Get all permissions
   */
  async getAllPermissions(token: string): Promise<PermissionData[]> {
    const response = await fetch(`${API_BASE_URL}/permissions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch permissions")
    }

    return response.json()
  }
}

export const permissionAPI: PermissionAPI = new PermissionAPI()