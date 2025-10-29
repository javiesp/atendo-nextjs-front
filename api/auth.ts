import dotenv from "dotenv"
dotenv.config()

const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_ATENDO && process.env.NEXT_PUBLIC_API_ATENDO !== ""
    ? process.env.NEXT_PUBLIC_API_ATENDO
    : "http://localhost:3004"

export interface RegisterData {
  org_id: string
  name: string
  email: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResponse {
  idToken: string
  refreshToken: string
  expiresIn: string
  org_id: string
}

export interface RegisterResponse {
  uid: string
  email: string
  emailVerified: boolean
  displayName: string
  disabled: boolean
  metadata: {
    lastSignInTime: string | null
    creationTime: string
    lastRefreshTime: string | null
  }
  tokensValidAfterTime: string
  providerData: Array<{
    uid?: string
    displayName?: string
    email?: string
    providerId?: string
  }>
}

class AuthAPI {
  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<RegisterResponse> {
    const response = await fetch(`${API_BASE_URL}/user/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Registration failed" }))
      throw new Error(error.message || "Registration failed")
    }

    return response.json()
  }

  /**
   * Login user
   */
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/user/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    // 🔍 Debug info para saber qué pasa realmente
    console.log("[AuthAPI] status:", response.status)
    console.log("[AuthAPI] headers:", response.headers.get("content-type"))

    const raw = await response.text() // <-- lee texto crudo
    console.log("[AuthAPI] raw:", raw)

    // Si fue 2xx, procesamos
    if (response.status >= 200 && response.status < 300) {
      try {
        // Si hay contenido, parseamos a JSON
        return raw ? JSON.parse(raw) : ({} as AuthResponse)
      } catch (err) {
        console.error("[AuthAPI] JSON parse error:", err)
        throw new Error("Invalid JSON in response from backend")
      }
    }

    // Si no fue 2xx, devolvemos error legible
    throw new Error(`HTTP ${response.status}: ${raw || "Unexpected error"}`)
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const response = await fetch(
      `${API_BASE_URL}/user/auth/refresh-token?refreshToken=${encodeURIComponent(refreshToken)}`,
      {
        method: "POST",
      },
    )

    if (!response.ok) {
      throw new Error("Failed to refresh token")
    }

    return response.json()
  }

  /**
   * Get all users (requires authentication)
   */
  async getAllUsers(token: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/user`, {
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
}

export const authAPI: AuthAPI = new AuthAPI()