import { api } from '@/api/axios'
import type { ApiResponse, Pengadaan } from '@/types'

export const pengadaanApi = {
  list: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<ApiResponse<Pengadaan[]>>('/pengadaan', { params }),
  getOne: (id: string) => api.get<ApiResponse<Pengadaan>>(`/pengadaan/${id}`),
  create: (data: {
    nomorPo: string
    tanggal: string
    supplier: string
    catatan?: string
    items: { bahanBakuId: string; jumlah: number; hargaSatuan: number }[]
  }) => api.post<ApiResponse<Pengadaan>>('/pengadaan', data),
  approve: (id: string) => api.patch<ApiResponse<Pengadaan>>(`/pengadaan/${id}/approve`),
  order: (id: string) => api.patch<ApiResponse<Pengadaan>>(`/pengadaan/${id}/order`),
  terima: (id: string, items: { pengadaanItemId: string; jumlahDiterima: number }[]) =>
    api.patch<ApiResponse<Pengadaan>>(`/pengadaan/${id}/terima`, { items }),
  cancel: (id: string) => api.patch<ApiResponse<Pengadaan>>(`/pengadaan/${id}/cancel`),
  delete: (id: string) => api.delete(`/pengadaan/${id}`),
}
