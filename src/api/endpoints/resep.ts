import { api } from '@/api/axios'
import type { ApiResponse, Resep, ResepItem, PreviewKebutuhan } from '@/types'

export const resepApi = {
  list: (params?: { page?: number; limit?: number; jenisPenerima?: string; isActive?: boolean }) =>
    api.get<ApiResponse<Resep[]>>('/resep', { params }),
  getOne: (id: string) => api.get<ApiResponse<Resep>>(`/resep/${id}`),
  create: (data: { nama: string; jenisPenerima: string; deskripsi?: string }) =>
    api.post<ApiResponse<Resep>>('/resep', data),
  update: (id: string, data: Partial<{ nama: string; deskripsi: string; isActive: boolean }>) =>
    api.patch<ApiResponse<Resep>>(`/resep/${id}`, data),
  delete: (id: string) => api.delete(`/resep/${id}`),
  addItem: (id: string, data: { bahanBakuId: string; jumlahPerPorsi: number; catatan?: string }) =>
    api.post<ApiResponse<ResepItem>>(`/resep/${id}/items`, data),
  updateItem: (id: string, itemId: string, data: { jumlahPerPorsi?: number; catatan?: string }) =>
    api.patch<ApiResponse<ResepItem>>(`/resep/${id}/items/${itemId}`, data),
  removeItem: (id: string, itemId: string) =>
    api.delete(`/resep/${id}/items/${itemId}`),
  kebutuhan: (id: string, jumlahPorsi: number) =>
    api.get<ApiResponse<PreviewKebutuhan>>(`/resep/${id}/kebutuhan?jumlahPorsi=${jumlahPorsi}`),
}
