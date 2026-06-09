import { api } from '@/api/axios'
import type { ApiResponse, UserData } from '@/types'

export const usersApi = {
  list: (params?: { page?: number; limit?: number; role?: string; isActive?: boolean }) =>
    api.get<ApiResponse<UserData[]>>('/users', { params }),
  getOne: (id: string) => api.get<ApiResponse<UserData>>(`/users/${id}`),
  update: (id: string, data: Partial<UserData>) => api.patch<ApiResponse<UserData>>(`/users/${id}`, data),
  changePassword: (id: string, data: { passwordLama: string; passwordBaru: string }) =>
    api.patch(`/users/${id}/password`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
}