import { api } from '@/api/axios'
import type { ApiResponse, SopTemplateStep, SopProduksiStep } from '@/types'

export const sopApi = {
  listTemplate: () => api.get<ApiResponse<SopTemplateStep[]>>('/sop-template'),
  createTemplate: (data: { namaTahap: string; deskripsi?: string; urutan?: number; estimasiMenit?: number }) =>
    api.post<ApiResponse<SopTemplateStep>>('/sop-template', data),
  updateTemplate: (id: string, data: Partial<{ namaTahap: string; deskripsi: string; urutan: number; estimasiMenit: number; isActive: boolean }>) =>
    api.patch<ApiResponse<SopTemplateStep>>(`/sop-template/${id}`, data),
  deleteTemplate: (id: string) => api.delete(`/sop-template/${id}`),
  getSteps: (produksiId: string) =>
    api.get<ApiResponse<SopProduksiStep[]>>(`/produksi/${produksiId}/sop`),
  mulaiStep: (produksiId: string, stepId: string) =>
    api.post<ApiResponse<SopProduksiStep>>(`/produksi/${produksiId}/sop/${stepId}/mulai`),
  selesaiStep: (produksiId: string, stepId: string, data?: { catatan?: string }) =>
    api.post<ApiResponse<SopProduksiStep>>(`/produksi/${produksiId}/sop/${stepId}/selesai`, data ?? {}),
}
