import { api } from '@/api/axios'
import type { ApiResponse, PemeriksaanHigiene } from '@/types'

export type HigieneInput = {
  namaPekerja: string
  tanggal?: string
  sehat?: boolean
  tanganBersih?: boolean
  kukuPendek?: boolean
  apdLengkap?: boolean
  tanpaPerhiasan?: boolean
  catatan?: string
}

export const higieneApi = {
  list: (tanggal?: string) =>
    api.get<ApiResponse<PemeriksaanHigiene[]>>('/higiene', {
      params: tanggal ? { tanggal } : undefined,
    }),
  create: (data: HigieneInput) =>
    api.post<ApiResponse<PemeriksaanHigiene>>('/higiene', data),
  remove: (id: string) => api.delete(`/higiene/${id}`),
}
