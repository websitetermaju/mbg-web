import { api } from '@/api/axios'
import type { ApiResponse, Laporan, StatusLaporan } from '@/types'

export const laporanApi = {
  list: (params?: { page?: number; limit?: number; status?: StatusLaporan; jenis?: string }) =>
    api.get<ApiResponse<Laporan[]>>('/laporan', { params }),
  getOne: (id: string) => api.get<ApiResponse<Laporan>>(`/laporan/${id}`),
  create: (data: { judul: string; jenis: string; periodeMulai: string; periodeAkhir: string }) =>
    api.post<ApiResponse<Laporan>>('/laporan', data),
  review: (id: string, catatan: string) =>
    api.patch<ApiResponse<Laporan>>(`/laporan/${id}/review`, { catatan }),
  submit: (id: string) =>
    api.patch<ApiResponse<Laporan>>(`/laporan/${id}/submit`),
  accept: (id: string) =>
    api.patch<ApiResponse<Laporan>>(`/laporan/${id}/accept`),
  reject: (id: string, catatan: string) =>
    api.patch<ApiResponse<Laporan>>(`/laporan/${id}/reject`, { catatan }),
  delete: (id: string) => api.delete(`/laporan/${id}`),
  export: (id: string, format: 'pdf' | 'excel') =>
    api.get<Blob>(`/laporan/${id}/export`, {
      params: { format },
      responseType: 'blob',
    }),
}
