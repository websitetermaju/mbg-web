import { api } from '@/api/axios'
import type { ApiResponse, Sppg } from '@/types'

export const sppgApi = {
  list: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<ApiResponse<Sppg[]>>('/sppg', { params }),
  getOne: (id: string) => api.get<ApiResponse<Sppg>>(`/sppg/${id}`),
  create: (data: Partial<Sppg>) => api.post<ApiResponse<Sppg>>('/sppg', data),
  update: (id: string, data: Partial<Sppg>) => api.patch<ApiResponse<Sppg>>(`/sppg/${id}`, data),
  delete: (id: string) => api.delete(`/sppg/${id}`),
}