import dotenv from "dotenv"
dotenv.config()

const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_ATENDO && process.env.NEXT_PUBLIC_API_ATENDO !== ""
    ? process.env.NEXT_PUBLIC_API_ATENDO
    : "http://localhost:3004"

export interface Tenant {
  id: string
  name: string
}

class TenantAPI {
  /**
   * Get tenant by ID
   */
  async getTenantById(tenantId: string, token: string): Promise<Tenant> {
    const response = await fetch(`${API_BASE_URL}/tenants/fetch/${tenantId}/tenantId`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch tenant")
    }

    return response.json()
  }
}

export const tenantAPI: TenantAPI = new TenantAPI()