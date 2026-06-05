import { api } from '@/api/axios'
import type { ApiResponse, Invoice } from '@/types'

export const invoiceApi = {
  list: (params?: { page?: number; limit?: number; status?: string; pengadaanId?: string }) =>
    api.get<ApiResponse<Invoice[]>>('/invoice', { params }),
  overdue: () =>
    api.get<ApiResponse<Invoice[]>>('/invoice/overdue'),
  getOne: (id: string) =>
    api.get<ApiResponse<Invoice>>(`/invoice/${id}`),
  update: (id: string, data: { nomorInvoice?: string; tanggalJatuhTempo?: string; catatan?: string }) =>
    api.patch<ApiResponse<Invoice>>(`/invoice/${id}`, data),
  tambahPembayaran: (id: string, data: { jumlah: number; tanggalBayar: string; metodeBayar: string; buktiUrl?: string; catatan?: string }) =>
    api.post<ApiResponse<Invoice>>(`/invoice/${id}/bayar`, data),
  batalkanPembayaran: (id: string, bayarId: string) =>
    api.delete<ApiResponse<Invoice>>(`/invoice/${id}/bayar/${bayarId}`),
}
