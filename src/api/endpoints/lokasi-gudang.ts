import { api } from '@/api/axios'
import type { ApiResponse, LokasiGudang } from '@/types'

export const lokasiGudangApi = {
  list: (params?: { tipe?: string; isActive?: boolean }) =>
    api.get<ApiResponse<LokasiGudang[]>>('/lokasi-gudang', { params }),
  create: (data: { nama: string; tipe: string; keterangan?: string }) =>
    api.post<ApiResponse<LokasiGudang>>('/lokasi-gudang', data),
  update: (id: string, data: Partial<{ nama: string; tipe: string; keterangan: string; isActive: boolean }>) =>
    api.patch<ApiResponse<LokasiGudang>>(`/lokasi-gudang/${id}`, data),
  delete: (id: string) => api.delete(`/lokasi-gudang/${id}`),
}
