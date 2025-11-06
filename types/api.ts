export interface Timestamp {
  _seconds: number
  _nanoseconds: number
}

export interface TenantSettings {
  is_api_enabled?: boolean
}

export interface TenantAssets {
  primary?: string
  secondary?: string
  tertiary?: string
}

export interface TenantFeatures {
  settings?: Record<string, any>
  analytics?: boolean
  apis?: string
  assets?: TenantAssets
}

export interface TenantData {
  id: string
  tenant_name: string
  plan_id: string
  max_users_limit: number
  current_users_count: number
  meta_app_id: string
  waba_id: string
  primary_channel_id: string
  whatsapp_number: string
  is_api_enabled: boolean
  api_key: string
  chat_supervision_enabled: boolean
  settings?: TenantSettings
  features?: TenantFeatures
  updated_at?: Timestamp
}

export interface UpdateSettingsPayload {
  id?: string
  tenant_name?: string
  plan_id?: string
  max_users_limit?: number
  current_users_count?: number
  meta_app_id?: string
  waba_id?: string
  primary_channel_id?: string
  whatsapp_number?: string
  is_api_enabled?: boolean
  api_key?: string
  chat_supervision_enabled?: boolean
  features?: TenantFeatures
  updated_at?: Timestamp
}

export interface UpdateFeaturesPayload {
  analytics?: boolean
  apis?: string
  assets?: TenantAssets | string
}

export interface UpdateAssetsPayload {
  primary?: string
  secondary?: string
  tertiary?: string
}

export interface UserData {
  uid: string
  org_id: string
  name: string
  email: string
  auth_provider_id: string | null
  auth_source: string
  is_verified: boolean
  role_id: string
  status: string
  assigned_whatsapp_numbers: string[]
  additional_attributes: Record<string, any>
  two_fa_attemps: number
  two_fa_code: string | null
  two_fa_code_valid: Timestamp | null
  created_at: Timestamp
  updated_at: Timestamp
  last_login_at: Timestamp
}

export interface UsersListResponse {
  users: UserData[]
  total: number
  page: number
  limit: number
}

export interface CreateUserPayload {
  org_id: string
  name: string
  email: string
  password: string
  auth_provider_id?: string
  auth_source?: string
  is_verified?: boolean
  role_id?: string
  status?: string
  assigned_whatsapp_numbers?: string[]
  assets_admin?: any
  two_fa_attemps?: number
  two_fa_code?: string
  two_fa_valid?: Timestamp | Date
}

export interface RoleData {
  id: string
  org_id: string
  name: string
  is_default: boolean
  permission_ids: string[]
  created_at: Timestamp
  updated_at: Timestamp
}

export interface CreateRolePayload {
  org_id: string
  name: string
  is_default: boolean
  permission_ids: string[]
}

export interface TabPermissions {
  p_read: boolean
  p_create: boolean
  p_update: boolean
  p_delete: boolean
}

export interface NavigationPermissions {
  home_tab: TabPermissions
  contacts_tab: TabPermissions
  users_tab: TabPermissions
  organization_tab: TabPermissions
  profile_tab: TabPermissions
  integrations_tab: TabPermissions
  whatsapp_tab: TabPermissions
}

export interface PermissionData {
  id: string
  description: string
  feature_tag: string
  name: string
  navigation: NavigationPermissions
  created_at: Timestamp
  updated_at: Timestamp
}
