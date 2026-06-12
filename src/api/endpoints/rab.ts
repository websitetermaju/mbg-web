import { api } from '@/api/axios'
import type { ApiResponse, RabMingguan } from '@/types'

export const rabApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api.get<ApiResponse<RabMingguan[]>>('/rab', { params }),
  detail: (id: string) => api.get<ApiResponse<RabMingguan>>(`/rab/${id}`),
  import: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<ApiResponse<RabMingguan>>('/rab/import', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  delete: (id: string) => api.delete(`/rab/${id}`),
}
