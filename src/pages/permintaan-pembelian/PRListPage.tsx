import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { prApi } from '@/api/endpoints/permintaan-pembelian'
import { StatusBadge } from '@/components/StatusBadge'
import { Pagination } from '@/components/Pagination'

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'APPROVED', label: 'Disetujui' },
  { value: 'CONVERTED', label: 'Dikonversi' },
  { value: 'REJECTED', label: 'Ditolak' },
]

export function PRListPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['pr', page, status],
    queryFn: () => prApi.list({ page, limit: 20, ...(status ? { status } : {}) }),
  })

  const deleteMutation = useMutation({
    mutationFn: prApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pr'] }),
  })

  const items = data?.data.data ?? []
  const meta = data?.data.meta

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-bgn-900">Permintaan Pembelian</h1>
        <Link to="/permintaan-pembelian/baru" className="bg-bgn-green-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-bgn-green-500">
          + Buat PR
        </Link>
      </div>

      <div className="mb-4">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none"
        >
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Memuat...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bgn-200">
              <tr>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Nomor PR</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Tanggal</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Jumlah Item</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bgn-100">
              {items.map((pr) => (
                <tr key={pr.id} className="odd:bg-white even:bg-bgn-50 hover:bg-bgn-100 transition-colors">
                  <td className="px-4 py-3 font-medium text-bgn-900">
                    <Link to={`/permintaan-pembelian/${pr.id}`} className="hover:underline text-bgn-800">
                      {pr.nomorPr}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{pr.tanggal}</td>
                  <td className="px-4 py-3 text-gray-600">{pr.items?.length ?? 0} item</td>
                  <td className="px-4 py-3"><StatusBadge status={pr.status} /></td>
                  <td className="px-4 py-3 text-right">
                    {pr.status === 'DRAFT' && (
                      <button
                        onClick={() => { if (confirm('Hapus PR ini?')) deleteMutation.mutate(pr.id) }}
                        className="text-red-500 hover:underline text-xs"
                      >
                        Hapus
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Belum ada permintaan pembelian</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} totalPages={meta?.totalPages ?? 1} onPageChange={setPage} />
    </div>
  )
}
