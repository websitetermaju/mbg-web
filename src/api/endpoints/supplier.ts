import { api } from '@/api/axios'
import type { ApiResponse, Supplier } from '@/types'

export const supplierApi = {
  list: (params?: { page?: number; limit?: number; kategori?: string; isActive?: boolean }) =>
    api.get<ApiResponse<Supplier[]>>('/supplier', { params }),
  getOne: (id: string) => api.get<ApiResponse<Supplier>>(`/supplier/${id}`),
  create: (data: Partial<Supplier>) => api.post<ApiResponse<Supplier>>('/supplier', data),
  update: (id: string, data: Partial<Supplier>) => api.patch<ApiResponse<Supplier>>(`/supplier/${id}`, data),
  delete: (id: string) => api.delete(`/supplier/${id}`),
}
