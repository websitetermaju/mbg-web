import { api } from '@/api/axios'
import type { ApiResponse, Notifikasi } from '@/types'

export const notifikasiApi = {
  list: (params?: { page?: number; limit?: number; isRead?: boolean }) =>
    api.get<ApiResponse<Notifikasi[]>>('/notifikasi', { params }),
  markRead: (id: string) =>
    api.patch<ApiResponse<Notifikasi>>(`/notifikasi/${id}/read`),
  markAllRead: () =>
    api.patch('/notifikasi/read-all'),
  unreadCount: () =>
    api.get<ApiResponse<{ count: number }>>('/notifikasi/unread-count'),
}
