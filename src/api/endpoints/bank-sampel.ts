import { api } from '@/api/axios'
import type { ApiResponse, BankSampel, StatusSampel } from '@/types'

// Bank Sampel menempel ke batch produksi: /produksi/:id/sampel
export const bankSampelApi = {
  list: (produksiId: string) =>
    api.get<ApiResponse<BankSampel[]>>(`/produksi/${produksiId}/sampel`),
  create: (
    produksiId: string,
    data: { namaMakanan: string; lokasiSimpan?: string; suhuSimpan?: number; catatan?: string },
  ) => api.post<ApiResponse<BankSampel>>(`/produksi/${produksiId}/sampel`, data),
  update: (
    produksiId: string,
    sampelId: string,
    data: { status?: StatusSampel; catatan?: string },
  ) => api.patch<ApiResponse<BankSampel>>(`/produksi/${produksiId}/sampel/${sampelId}`, data),
  remove: (produksiId: string, sampelId: string) =>
    api.delete(`/produksi/${produksiId}/sampel/${sampelId}`),
}
