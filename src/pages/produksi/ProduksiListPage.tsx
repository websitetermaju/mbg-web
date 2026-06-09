import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { produksiApi } from '@/api/endpoints/produksi'
import { StatusBadge } from '@/components/StatusBadge'
import { Pagination } from '@/components/Pagination'
import type { Produksi } from '@/types'

function SelesaiModal({
  onClose,
  onConfirm,
}: {
  item: Produksi
  onClose: () => void
  onConfirm: (porsiDiproduksi: number, porsiGagal: number, catatan: string) => void
}) {
  const [porsiDiproduksi, setPorsiDiproduksi] = useState(0)
  const [porsiGagal, setPorsiGagal] = useState(0)
  const [catatan, setCatatan] = useState('')

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
        <h2 className="font-semibold text-gray-800 mb-4">Selesaikan Produksi</h2>
        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Porsi Diproduksi</label>
            <input
              type="number"
              min={0}
              value={porsiDiproduksi}
              onChange={(e) => setPorsiDiproduksi(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-green-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Porsi Gagal</label>
            <input
              type="number"
              min={0}
              value={porsiGagal}
              onChange={(e) => setPorsiGagal(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-green-400 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (opsional)</label>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-green-400 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onConfirm(porsiDiproduksi, porsiGagal, catatan)}
            disabled={porsiDiproduksi <= 0}
            className="flex-1 bg-bgn-green-400 text-white py-2 rounded-lg hover:bg-bgn-green-500 disabled:opacity-50"
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

export function ProduksiListPage() {
  const [page, setPage] = useState(1)
  const [selesaiItem, setSelesaiItem] = useState<Produksi | null>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['produksi', page],
    queryFn: () => produksiApi.list({ page, limit: 20 }),
  })

  const mulaiMutation = useMutation({
    mutationFn: produksiApi.mulai,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['produksi'] }),
  })

  const selesaiMutation = useMutation({
    mutationFn: ({ id, porsiDiproduksi, porsiGagal, catatan }: {
      id: string; porsiDiproduksi: number; porsiGagal: number; catatan: string
    }) => produksiApi.selesai(id, { porsiDiproduksi, porsiGagal, catatan }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['produksi'] })
      setSelesaiItem(null)
    },
  })

  const batalMutation = useMutation({
    mutationFn: produksiApi.batal,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['produksi'] }),
  })

  const items = data?.data.data ?? []
  const meta = data?.data.meta

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Produksi</h1>
        <div className="flex items-center gap-2">
          <Link
            to="/sop-template"
            className="border border-bgn-200 text-bgn-700 px-4 py-2 rounded-lg text-sm hover:bg-bgn-50"
          >
            SOP dapur
          </Link>
          <Link
            to="/produksi/baru"
            className="bg-bgn-green-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-bgn-green-500"
          >
            + Buat Produksi
          </Link>
        </div>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Memuat...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bgn-200">
              <tr>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Tanggal</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Menu ID</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Status</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Porsi</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Gagal</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Waktu Mulai</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bgn-100">
              {items.map((p) => (
                <tr key={p.id} className="odd:bg-white even:bg-bgn-50 hover:bg-bgn-100 transition-colors">
                  <td className="px-4 py-3 text-gray-600">
                    <Link to={`/produksi/${p.id}`} className="text-bgn-800 hover:underline font-medium">
                      Produksi {p.tanggal}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{p.menuId.slice(0, 8)}...</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-gray-600">{p.porsiDiproduksi}</td>
                  <td className="px-4 py-3 text-gray-600">{p.porsiGagal}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {p.waktuMulai ? new Date(p.waktuMulai).toLocaleTimeString('id-ID') : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      {p.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => mulaiMutation.mutate(p.id)}
                            className="text-bgn-800 hover:underline"
                          >
                            Mulai
                          </button>
                          <button
                            onClick={() => { if (confirm('Batalkan produksi?')) batalMutation.mutate(p.id) }}
                            className="text-red-500 hover:underline"
                          >
                            Batal
                          </button>
                        </>
                      )}
                      {p.status === 'IN_PROGRESS' && (
                        <>
                          <button
                            onClick={() => setSelesaiItem(p)}
                            className="text-bgn-800 hover:underline"
                          >
                            Selesai
                          </button>
                          <button
                            onClick={() => { if (confirm('Batalkan produksi?')) batalMutation.mutate(p.id) }}
                            className="text-red-500 hover:underline"
                          >
                            Batal
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Belum ada data produksi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} totalPages={meta?.totalPages ?? 1} onPageChange={setPage} />

      {selesaiItem && (
        <SelesaiModal
          item={selesaiItem}
          onClose={() => setSelesaiItem(null)}
          onConfirm={(porsiDiproduksi, porsiGagal, catatan) =>
            selesaiMutation.mutate({ id: selesaiItem.id, porsiDiproduksi, porsiGagal, catatan })
          }
        />
      )}
    </div>
  )
}
