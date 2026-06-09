import { api } from '@/api/axios'
import type { ApiResponse, QcTemplateItem, QcHasil, Produksi } from '@/types'

export const qcApi = {
  getTemplate: () =>
    api.get<ApiResponse<QcTemplateItem[]>>('/qc-template'),
  getHasil: (produksiId: string) =>
    api.get<ApiResponse<QcHasil[]>>(`/produksi/${produksiId}/qc`),
  init: (produksiId: string) =>
    api.post<ApiResponse<QcHasil[]>>(`/produksi/${produksiId}/qc/init`),
  // CHECKLIST: kirim `passed`. SUHU: kirim `nilai` (lulus dihitung backend dari batas aman).
  centang: (
    produksiId: string,
    hasilId: string,
    data: { passed?: boolean; nilai?: number; catatan?: string },
  ) => api.patch<ApiResponse<QcHasil>>(`/produksi/${produksiId}/qc/${hasilId}`, data),
  selesai: (produksiId: string) =>
    api.post<ApiResponse<Produksi>>(`/produksi/${produksiId}/qc/selesai`),
}
