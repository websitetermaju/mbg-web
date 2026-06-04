import { api } from '@/api/axios'
import type { ApiResponse, MenuHarian, StatusMenu } from '@/types'

export const menuApi = {
  list: (params?: { page?: number; limit?: number; search?: string; status?: StatusMenu }) =>
    api.get<ApiResponse<MenuHarian[]>>('/menu', { params }),
  getOne: (id: string) => api.get<ApiResponse<MenuHarian>>(`/menu/${id}`),
  create: (data: Partial<MenuHarian>) =>
    api.post<ApiResponse<{ menu: MenuHarian; peringatan: string[] }>>('/menu', data),
  update: (id: string, data: Partial<MenuHarian>) =>
    api.patch<ApiResponse<{ menu: MenuHarian; peringatan: string[] }>>(`/menu/${id}`, data),
  delete: (id: string) => api.delete(`/menu/${id}`),
  transisiStatus: (id: string, status: StatusMenu) =>
    api.patch<ApiResponse<MenuHarian>>(`/menu/${id}/status`, { status }),
}
