import { api } from '@/api/axios'
import type { ApiResponse, PermintaanPembelian } from '@/types'

export const prApi = {
  list: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<ApiResponse<PermintaanPembelian[]>>('/permintaan-pembelian', { params }),
  getOne: (id: string) =>
    api.get<ApiResponse<PermintaanPembelian>>(`/permintaan-pembelian/${id}`),
  create: (data: { tanggal: string; catatan?: string; items: { bahanBakuId: string; jumlah: number; keterangan?: string }[] }) =>
    api.post<ApiResponse<PermintaanPembelian>>('/permintaan-pembelian', data),
  approve: (id: string) =>
    api.post<ApiResponse<PermintaanPembelian>>(`/permintaan-pembelian/${id}/approve`),
  reject: (id: string, alasanTolak: string) =>
    api.post<ApiResponse<PermintaanPembelian>>(`/permintaan-pembelian/${id}/reject`, { alasanTolak }),
  convert: (id: string) =>
    api.post<ApiResponse<{ nomorPo: string; id: string }>>(`/permintaan-pembelian/${id}/convert`),
  delete: (id: string) =>
    api.delete(`/permintaan-pembelian/${id}`),
}
