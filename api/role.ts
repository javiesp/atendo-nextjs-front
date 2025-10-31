import dotenv from "dotenv"
import type { RoleData, CreateRolePayload } from "@/types/api"

dotenv.config()

const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_ATENDO && process.env.NEXT_PUBLIC_API_ATENDO !== ""
    ? process.env.NEXT_PUBLIC_API_ATENDO
    : "http://localhost:3004"

class RoleAPI {
  /**
   * Get all roles for an organization
   */
  async getRoles(orgId: string, token: string): Promise<RoleData[]> {
    const response = await fetch(`${API_BASE_URL}/roles/${orgId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch roles")
    }

    return response.json()
  }

  /**
   * Create a new role
   */
  async createRole(token: string, data: CreateRolePayload): Promise<RoleData> {
    const response = await fetch(`${API_BASE_URL}/roles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to create role" }))
      throw new Error(error.message || "Failed to create role")
    }

    return response.json()
  }
}

export const roleAPI: RoleAPI = new RoleAPI()