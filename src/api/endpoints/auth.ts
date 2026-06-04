import { api } from '@/api/axios'
import type { ApiResponse, AuthResult } from '@/types'

export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<AuthResult>>('/auth/login', { email, password }),
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
  profile: () =>
    api.get<ApiResponse<{ sub: string; email: string; role: string; sppgId: string | null }>>('/auth/profile'),
}
