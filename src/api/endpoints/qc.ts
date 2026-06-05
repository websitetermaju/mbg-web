import { api } from '@/api/axios'
import type { ApiResponse, QcTemplateItem, QcHasil, Produksi } from '@/types'

export const qcApi = {
  getTemplate: () =>
    api.get<ApiResponse<QcTemplateItem[]>>('/qc-template'),
  getHasil: (produksiId: string) =>
    api.get<ApiResponse<QcHasil[]>>(`/produksi/${produksiId}/qc`),
  init: (produksiId: string) =>
    api.post<ApiResponse<QcHasil[]>>(`/produksi/${produksiId}/qc/init`),
  centang: (produksiId: string, hasilId: string, data: { passed: boolean; catatan?: string }) =>
    api.patch<ApiResponse<QcHasil>>(`/produksi/${produksiId}/qc/${hasilId}`, data),
  selesai: (produksiId: string) =>
    api.post<ApiResponse<Produksi>>(`/produksi/${produksiId}/qc/selesai`),
}
