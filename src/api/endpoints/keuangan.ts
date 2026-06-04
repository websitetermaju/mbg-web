import { api } from '@/api/axios'
import type { ApiResponse, Keuangan } from '@/types'

export interface HasilCostPerPorsi {
  periode: { mulai: string; akhir: string }
  totalPengeluaran: number
  totalPorsi: number
  costPerPorsi: number
  pagu: number
  melebihiPagu: boolean
}

export const keuanganApi = {
  list: (params?: { page?: number; limit?: number; jenisTransaksi?: string }) =>
    api.get<ApiResponse<Keuangan[]>>('/keuangan', { params }),
  create: (data: Partial<Keuangan>) =>
    api.post<ApiResponse<Keuangan>>('/keuangan', data),
  delete: (id: string) => api.delete(`/keuangan/${id}`),
  costPerPorsi: (tanggalMulai: string, tanggalAkhir: string) =>
    api.get<ApiResponse<HasilCostPerPorsi>>('/keuangan/cost-per-porsi', {
      params: { tanggalMulai, tanggalAkhir },
    }),
}
