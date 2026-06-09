import { api } from '@/api/axios'
import type { ApiResponse, Penerima } from '@/types'

export const penerimaApi = {
  list: (params?: { page?: number; limit?: number; jenjang?: string; status?: string; search?: string }) =>
    api.get<ApiResponse<Penerima[]>>('/penerima', { params }),
  getOne: (id: string) => api.get<ApiResponse<Penerima>>(`/penerima/${id}`),
  create: (data: Partial<Penerima>) => api.post<ApiResponse<Penerima>>('/penerima', data),
  update: (id: string, data: Partial<Penerima>) => api.patch<ApiResponse<Penerima>>(`/penerima/${id}`, data),
  delete: (id: string) => api.delete(`/penerima/${id}`),
}