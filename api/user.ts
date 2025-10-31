import dotenv from "dotenv"
import type { UserData, UsersListResponse, CreateUserPayload } from "@/types/api"

dotenv.config()

const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_ATENDO && process.env.NEXT_PUBLIC_API_ATENDO !== ""
    ? process.env.NEXT_PUBLIC_API_ATENDO
    : "http://localhost:3004"

class UserAPI {
  /**
   * Get all users for an organization with pagination
   */
  async getUsers(orgId: string, token: string, page = 1, limit = 10): Promise<UsersListResponse> {
    const response = await fetch(`${API_BASE_URL}/user/${orgId}?page=${page}&limit=${limit}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    
    if (!response.ok) {
      throw new Error("Failed to fetch users")
    }

    return response.json()
  }

  /**
   * Get a specific user by ID
   */
  async getUserById(orgId: string, userId: string, token: string): Promise<UserData> {
    console.log('-----DEBUG-----')

    const response = await fetch(`${API_BASE_URL}/user/${orgId}/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log('USUARIO')

    console.log(orgId)
    console.log(token)

    if (!response.ok) {
      throw new Error("Failed to fetch user")
    }

    return response.json()
  }

  /**
   * Create a new user
   */
  async createUser(data: CreateUserPayload): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/user/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Failed to create user" }))
      throw new Error(error.message || "Failed to create user")
    }

    return response.json()
  }
}

export const userAPI: UserAPI = new UserAPI()