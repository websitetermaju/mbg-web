import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notifikasiApi } from '@/api/endpoints/notifikasi'
import { useState } from 'react'
import { Pagination } from '@/components/Pagination'

const PRIORITAS_COLORS: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
}

export function NotifikasiPage() {
  const [page, setPage] = useState(1)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifikasi', page],
    queryFn: () => notifikasiApi.list({ page, limit: 20 }),
  })

  const { data: unreadData } = useQuery({
    queryKey: ['notifikasi', 'unread-count'],
    queryFn: notifikasiApi.unreadCount,
    refetchInterval: 30_000,
  })

  const markReadMutation = useMutation({
    mutationFn: notifikasiApi.markRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifikasi'] })
    },
  })

  const markAllMutation = useMutation({
    mutationFn: notifikasiApi.markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifikasi'] })
    },
  })

  const items = data?.data.data ?? []
  const meta = data?.data.meta
  const unreadCount = unreadData?.data.data.count ?? 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notifikasi</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-orange-600 mt-1">{unreadCount} notifikasi belum dibaca</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="text-sm text-blue-600 hover:underline"
          >
            Tandai Semua Dibaca
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="text-gray-500">Memuat...</p>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-xl border p-4 flex items-start gap-3 transition-colors ${
                n.isRead ? 'border-gray-100' : 'border-blue-200 bg-blue-50'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${PRIORITAS_COLORS[n.prioritas] ?? 'bg-gray-100 text-gray-600'}`}>
                    {n.prioritas}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString('id-ID')}</span>
                  {!n.isRead && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-600 text-white text-xs">Baru</span>
                  )}
                </div>
                <p className="font-medium text-gray-800 text-sm">{n.judul}</p>
                <p className="text-gray-500 text-sm mt-0.5">{n.pesan}</p>
              </div>
              {!n.isRead && (
                <button
                  onClick={() => markReadMutation.mutate(n.id)}
                  className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                >
                  Tandai Dibaca
                </button>
              )}
            </div>
          ))}
          {items.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
              Tidak ada notifikasi
            </div>
          )}
        </div>
      )}
      <Pagination page={page} totalPages={meta?.totalPages ?? 1} onPageChange={setPage} />
    </div>
  )
}
