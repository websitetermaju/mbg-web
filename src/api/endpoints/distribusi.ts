import { api } from '@/api/axios'
import type { ApiResponse, Distribusi } from '@/types'

export const distribusiApi = {
  list: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<ApiResponse<Distribusi[]>>('/distribusi', { params }),
  getOne: (id: string) => api.get<ApiResponse<Distribusi>>(`/distribusi/${id}`),
  create: (data: { produksiId: string; tanggal: string; jumlahPorsi: number; keterangan?: string }) =>
    api.post<ApiResponse<Distribusi>>('/distribusi', data),
  pickup: (id: string) =>
    api.patch<ApiResponse<Distribusi>>(`/distribusi/${id}/pickup`),
  transit: (id: string) =>
    api.patch<ApiResponse<Distribusi>>(`/distribusi/${id}/transit`),
  deliver: (id: string, fotoBukti: File) => {
    const formData = new FormData()
    formData.append('fotoBukti', fotoBukti)
    return api.patch<ApiResponse<Distribusi>>(`/distribusi/${id}/deliver`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  gagal: (id: string, alasanGagal: string) =>
    api.patch<ApiResponse<Distribusi>>(`/distribusi/${id}/gagal`, { alasanGagal }),
}
