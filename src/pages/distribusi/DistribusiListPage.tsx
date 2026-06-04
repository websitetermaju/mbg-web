import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { distribusiApi } from '@/api/endpoints/distribusi'
import { StatusBadge } from '@/components/StatusBadge'
import { Pagination } from '@/components/Pagination'
import type { Distribusi } from '@/types'

function DeliverModal({
  onClose,
  onConfirm,
}: {
  item: Distribusi
  onClose: () => void
  onConfirm: (foto: File) => void
}) {
  const [file, setFile] = useState<File | null>(null)
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
        <h2 className="font-semibold text-gray-800 mb-4">Konfirmasi Terkirim</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Foto Bukti Pengiriman</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => file && onConfirm(file)}
            disabled={!file}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Konfirmasi
          </button>
          <button onClick={onClose} className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50">
            Batal
          </button>
        </div>
      </div>
    </div>
  )
}

function GagalModal({
  onClose,
  onConfirm,
}: {
  item: Distribusi
  onClose: () => void
  onConfirm: (alasan: string) => void
}) {
  const [alasan, setAlasan] = useState('')
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
        <h2 className="font-semibold text-gray-800 mb-4">Distribusi Gagal</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Alasan Kegagalan</label>
          <textarea
            value={alasan}
            onChange={(e) => setAlasan(e.target.value)}
            rows={3}
            placeholder="Jelaskan alasan distribusi gagal..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onConfirm(alasan)}
            disabled={!alasan.trim()}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            Konfirmasi
          </button>
          <button onClick={onClose} className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50">
            Batal
          </button>
        </div>
      </div>
    </div>
  )
}

export function DistribusiListPage() {
  const [page, setPage] = useState(1)
  const [deliverItem, setDeliverItem] = useState<Distribusi | null>(null)
  const [gagalItem, setGagalItem] = useState<Distribusi | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['distribusi', page],
    queryFn: () => distribusiApi.list({ page, limit: 20 }),
  })

  const pickupMutation = useMutation({
    mutationFn: distribusiApi.pickup,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['distribusi'] }),
  })

  const transitMutation = useMutation({
    mutationFn: distribusiApi.transit,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['distribusi'] }),
  })

  const deliverMutation = useMutation({
    mutationFn: ({ id, foto }: { id: string; foto: File }) => distribusiApi.deliver(id, foto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['distribusi'] })
      setDeliverItem(null)
    },
  })

  const gagalMutation = useMutation({
    mutationFn: ({ id, alasan }: { id: string; alasan: string }) => distribusiApi.gagal(id, alasan),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['distribusi'] })
      setGagalItem(null)
    },
  })

  const items = data?.data.data ?? []
  const meta = data?.data.meta

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Distribusi</h1>
        <Link
          to="/distribusi/baru"
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
        >
          + Buat Distribusi
        </Link>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Memuat...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Tanggal</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Produksi</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Porsi</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Terlambat</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((d) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{d.tanggal}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{d.produksiId.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-gray-600">{d.jumlahPorsi}</td>
                  <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                  <td className="px-4 py-3">
                    {d.isLate ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                        Terlambat
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      {d.status === 'ASSIGNED' && (
                        <button
                          onClick={() => pickupMutation.mutate(d.id)}
                          className="text-blue-600 hover:underline"
                        >
                          Ambil
                        </button>
                      )}
                      {d.status === 'PICKED_UP' && (
                        <button
                          onClick={() => transitMutation.mutate(d.id)}
                          className="text-indigo-600 hover:underline"
                        >
                          Kirim
                        </button>
                      )}
                      {d.status === 'IN_TRANSIT' && (
                        <>
                          <button
                            onClick={() => setDeliverItem(d)}
                            className="text-green-600 hover:underline"
                          >
                            Terkirim
                          </button>
                          <button
                            onClick={() => setGagalItem(d)}
                            className="text-red-500 hover:underline"
                          >
                            Gagal
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Belum ada distribusi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} totalPages={meta?.totalPages ?? 1} onPageChange={setPage} />

      {deliverItem && (
        <DeliverModal
          item={deliverItem}
          onClose={() => setDeliverItem(null)}
          onConfirm={(foto) => deliverMutation.mutate({ id: deliverItem.id, foto })}
        />
      )}
      {gagalItem && (
        <GagalModal
          item={gagalItem}
          onClose={() => setGagalItem(null)}
          onConfirm={(alasan) => gagalMutation.mutate({ id: gagalItem.id, alasan })}
        />
      )}
    </div>
  )
}
