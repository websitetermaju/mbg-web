import { api } from '@/api/axios'
import type { ApiResponse, CekMutuPenerimaan } from '@/types'

export type CekMutuInput = {
  kondisiFisikBaik?: boolean
  kesegaranBaik?: boolean
  kemasanBaik?: boolean
  kedaluwarsaOk?: boolean
  suhuTerima?: number
  catatan?: string
}

// Cek mutu menempel ke pengadaan: /pengadaan/:id/cek-mutu
export const cekMutuApi = {
  list: (pengadaanId: string) =>
    api.get<ApiResponse<CekMutuPenerimaan[]>>(`/pengadaan/${pengadaanId}/cek-mutu`),
  create: (pengadaanId: string, data: CekMutuInput) =>
    api.post<ApiResponse<CekMutuPenerimaan>>(`/pengadaan/${pengadaanId}/cek-mutu`, data),
  remove: (pengadaanId: string, cekId: string) =>
    api.delete(`/pengadaan/${pengadaanId}/cek-mutu/${cekId}`),
}
