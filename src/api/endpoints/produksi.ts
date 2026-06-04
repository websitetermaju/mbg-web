import { api } from '@/api/axios'
import type { ApiResponse, Produksi } from '@/types'

export const produksiApi = {
  list: (params?: { page?: number; limit?: number; status?: string; tanggal?: string }) =>
    api.get<ApiResponse<Produksi[]>>('/produksi', { params }),
  getOne: (id: string) => api.get<ApiResponse<Produksi>>(`/produksi/${id}`),
  create: (data: { menuId: string; tanggal: string; catatan?: string }) =>
    api.post<ApiResponse<Produksi>>('/produksi', data),
  mulai: (id: string) =>
    api.patch<ApiResponse<Produksi>>(`/produksi/${id}/mulai`),
  selesai: (id: string, data: { porsiDiproduksi: number; porsiGagal: number; catatan?: string }) =>
    api.patch<ApiResponse<Produksi>>(`/produksi/${id}/selesai`, data),
  batal: (id: string) =>
    api.patch<ApiResponse<Produksi>>(`/produksi/${id}/batal`),
}
