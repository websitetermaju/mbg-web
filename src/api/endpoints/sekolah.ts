import { api } from '@/api/axios'
import type { ApiResponse, Sekolah } from '@/types'

export const sekolahApi = {
  list: (params?: { page?: number; limit?: number; kategori?: string; status?: string }) =>
    api.get<ApiResponse<Sekolah[]>>('/sekolah', { params }),
  getOne: (id: string) => api.get<ApiResponse<Sekolah>>(`/sekolah/${id}`),
  create: (data: Partial<Sekolah>) => api.post<ApiResponse<Sekolah>>('/sekolah', data),
  update: (id: string, data: Partial<Sekolah>) => api.patch<ApiResponse<Sekolah>>(`/sekolah/${id}`, data),
  delete: (id: string) => api.delete(`/sekolah/${id}`),
}