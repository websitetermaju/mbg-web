import { api } from '@/api/axios'
import type { ApiResponse, StokBatch } from '@/types'

export const stokBatchApi = {
  getBahan: (bahanBakuId: string) =>
    api.get<ApiResponse<StokBatch[]>>(`/bahan-baku/${bahanBakuId}/batches`),
  createManual: (bahanBakuId: string, data: {
    bahanBakuId: string
    jumlahMasuk: number
    tanggalMasuk: string
    tanggalKadaluarsa?: string
    hargaSatuan?: number
    lokasiId?: string
    catatan?: string
  }) => api.post<ApiResponse<StokBatch>>(`/bahan-baku/${bahanBakuId}/batches`, data),
  update: (id: string, data: { lokasiId?: string | null; tanggalKadaluarsa?: string | null }) =>
    api.patch<ApiResponse<StokBatch>>(`/stok-batch/${id}`, data),
  expiring: (days = 7) =>
    api.get<ApiResponse<StokBatch[]>>(`/stok-batch/expiring?days=${days}`),
}
