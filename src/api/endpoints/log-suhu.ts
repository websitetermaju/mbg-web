import { api } from '@/api/axios'
import type { ApiResponse, LogSuhuGudang } from '@/types'

// Log suhu menempel ke lokasi gudang: /lokasi-gudang/:id/suhu
export const logSuhuApi = {
  list: (lokasiId: string, tanggal?: string) =>
    api.get<ApiResponse<LogSuhuGudang[]>>(`/lokasi-gudang/${lokasiId}/suhu`, {
      params: tanggal ? { tanggal } : undefined,
    }),
  create: (lokasiId: string, data: { suhu: number; catatan?: string }) =>
    api.post<ApiResponse<LogSuhuGudang>>(`/lokasi-gudang/${lokasiId}/suhu`, data),
  remove: (lokasiId: string, logId: string) =>
    api.delete(`/lokasi-gudang/${lokasiId}/suhu/${logId}`),
}
