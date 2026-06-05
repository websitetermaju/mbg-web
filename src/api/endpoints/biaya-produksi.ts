import { api } from '@/api/axios'
import type { ApiResponse, BiayaSummary, BiayaProduksiItem } from '@/types'

export const biayaApi = {
  get: (produksiId: string) =>
    api.get<ApiResponse<BiayaSummary>>(`/produksi/${produksiId}/biaya`),
  tambah: (produksiId: string, data: { kategori: string; deskripsi: string; jumlah: number }) =>
    api.post<ApiResponse<BiayaProduksiItem>>(`/produksi/${produksiId}/biaya`, data),
  hapus: (produksiId: string, itemId: string) =>
    api.delete(`/produksi/${produksiId}/biaya/${itemId}`),
}
