import { api } from '@/api/axios'
import type { ApiResponse, BahanBaku } from '@/types'

export const bahanBakuApi = {
  list: (params?: { page?: number; limit?: number; search?: string; statusStok?: string }) =>
    api.get<ApiResponse<BahanBaku[]>>('/bahan-baku', { params }),
  getOne: (id: string) => api.get<ApiResponse<BahanBaku>>(`/bahan-baku/${id}`),
  create: (data: Partial<BahanBaku>) =>
    api.post<ApiResponse<BahanBaku>>('/bahan-baku', data),
  update: (id: string, data: Partial<BahanBaku>) =>
    api.patch<ApiResponse<BahanBaku>>(`/bahan-baku/${id}`, data),
  delete: (id: string) => api.delete(`/bahan-baku/${id}`),
  tambahStok: (id: string, jumlah: number, referensi: string) =>
    api.post<ApiResponse<BahanBaku>>(`/bahan-baku/${id}/stok/tambah`, { jumlah, referensi }),
  kurangiStok: (id: string, jumlah: number, referensi: string) =>
    api.post<ApiResponse<BahanBaku>>(`/bahan-baku/${id}/stok/kurangi`, { jumlah, referensi }),
}
