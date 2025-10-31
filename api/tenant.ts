import dotenv from "dotenv"
import type { TenantData, UpdateSettingsPayload, UpdateFeaturesPayload, UpdateAssetsPayload } from "@/types/api"

dotenv.config()

const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_ATENDO && process.env.NEXT_PUBLIC_API_ATENDO !== ""
    ? process.env.NEXT_PUBLIC_API_ATENDO
    : "http://localhost:3004"

class TenantAPI {
  /**
   * Get tenant by ID
   */
  async getTenantById(tenantId: string, token: string): Promise<TenantData> {
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

  async updateSettings(tenantId: string, token: string, data: UpdateSettingsPayload): Promise<TenantData> {
    console.log("---DEBUG----")
    const response = await fetch(`${API_BASE_URL}/tenants/${tenantId}/settings`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to update settings" }))
      throw new Error(error.message || "Failed to update settings")
    }

    return response.json()
  }

  async updateFeatures(tenantId: string, token: string, data: UpdateFeaturesPayload): Promise<TenantData> {
    const response = await fetch(`${API_BASE_URL}/tenants/${tenantId}/features`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to update features" }))
      throw new Error(error.message || "Failed to update features")
    }

    return response.json()
  }

  async updateAssets(tenantId: string, token: string, data: UpdateAssetsPayload): Promise<TenantData> {
    const response = await fetch(`${API_BASE_URL}/tenants/${tenantId}/assets`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to update assets" }))
      throw new Error(error.message || "Failed to update assets")
    }

    return response.json()
  }
}

export const tenantAPI: TenantAPI = new TenantAPI()