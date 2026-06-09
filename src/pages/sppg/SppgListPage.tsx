import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sppgApi } from '@/api/endpoints/sppg'
import { StatusBadge } from '@/components/StatusBadge'
import { Pagination } from '@/components/Pagination'
import { useAuthStore } from '@/store/auth.store'

const STATUS_OPTIONS = [
  { value: '', label: 'Semua Status' },
  { value: 'AKTIF', label: 'Aktif' },
  { value: 'NONAKTIF', label: 'Nonaktif' },
]

export function SppgListPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN_BGN'

  const { data, isLoading } = useQuery({
    queryKey: ['sppg', page, status],
    queryFn: () => sppgApi.list({ page, limit: 20, ...(status ? { status } : {}) }),
  })

  const deleteMutation = useMutation({
    mutationFn: sppgApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sppg'] }),
  })

  const items = data?.data.data ?? []
  const meta = data?.data.meta

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-bgn-900">SPPG</h1>
        {isAdmin && (
          <Link to="/sppg/baru" className="bg-bgn-green-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-bgn-green-500">
            + Tambah SPPG
          </Link>
        )}
      </div>
      <div className="mb-4">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none">
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      {isLoading ? <p className="text-gray-500">Memuat...</p> : (
        <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bgn-200">
              <tr>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Kode</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Nama</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Wilayah</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Provinsi</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Status</th>
                {isAdmin && <th className="px-4 py-3"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-bgn-100">
              {items.map((s) => (
                <tr key={s.id} className="odd:bg-white even:bg-bgn-50 hover:bg-bgn-100 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/sppg/${s.id}`} className="text-bgn-800 hover:underline font-medium">{s.kode}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{s.nama}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{s.wilayah}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{s.provinsi}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.status} />
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Link to={`/sppg/${s.id}/edit`} className="text-bgn-800 hover:underline text-xs">Edit</Link>
                        <button onClick={() => { if (confirm('Hapus SPPG ini?')) deleteMutation.mutate(s.id) }}
                          className="text-red-500 hover:underline text-xs">Hapus</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={isAdmin ? 6 : 5} className="px-4 py-8 text-center text-gray-400">Belum ada SPPG</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} totalPages={meta?.totalPages ?? 1} onPageChange={setPage} />
    </div>
  )
}