import { api } from '@/api/axios'
import type { ApiResponse, StockOpname, StockOpnameItem } from '@/types'

export const stockOpnameApi = {
  list: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<ApiResponse<StockOpname[]>>('/stock-opname', { params }),
  getOne: (id: string) =>
    api.get<ApiResponse<StockOpname>>(`/stock-opname/${id}`),
  create: (data: { tanggal: string; catatan?: string }) =>
    api.post<ApiResponse<StockOpname>>('/stock-opname', data),
  updateItem: (id: string, itemId: string, data: { jumlahFisik: number; catatan?: string }) =>
    api.patch<ApiResponse<StockOpnameItem>>(`/stock-opname/${id}/items/${itemId}`, data),
  finalize: (id: string) =>
    api.post<ApiResponse<StockOpname>>(`/stock-opname/${id}/finalize`),
  delete: (id: string) =>
    api.delete(`/stock-opname/${id}`),
}
