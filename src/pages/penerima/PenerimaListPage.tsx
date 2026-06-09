import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { penerimaApi } from '@/api/endpoints/penerima'
import { Pagination } from '@/components/Pagination'
import { StatusBadge } from '@/components/StatusBadge'

const JENJANG_LABELS: Record<string, string> = {
  TK: 'TK', SD: 'SD', SMP: 'SMP', SMA: 'SMA',
}

export function PenerimaListPage() {
  const [page, setPage] = useState(1)
  const [jenjang, setJenjang] = useState('')
  const [status, setStatus] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['penerima', page, jenjang, status],
    queryFn: () => penerimaApi.list({ page, limit: 20, ...(jenjang ? { jenjang } : {}), ...(status ? { status } : {}) }),
  })

  const deleteMutation = useMutation({
    mutationFn: penerimaApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['penerima'] }),
  })

  const items = data?.data.data ?? []
  const meta = data?.data.meta

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-bgn-900">Penerima</h1>
        <Link to="/penerima/baru" className="bg-bgn-green-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-bgn-green-500">
          + Tambah Penerima
        </Link>
      </div>
      <div className="flex gap-3 mb-4">
        <select value={jenjang} onChange={(e) => { setJenjang(e.target.value); setPage(1) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none">
          <option value="">Semua Jenjang</option>
          {Object.entries(JENJANG_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none">
          <option value="">Semua Status</option>
          <option value="AKTIF">Aktif</option>
          <option value="NONAKTIF">Nonaktif</option>
        </select>
      </div>
      {isLoading ? <p className="text-gray-500">Memuat...</p> : (
        <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bgn-200">
              <tr>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Nama</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">NIK</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Jenjang</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Institusi</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bgn-100">
              {items.map((p) => (
                <tr key={p.id} className="odd:bg-white even:bg-bgn-50 hover:bg-bgn-100 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/penerima/${p.id}`} className="font-medium text-bgn-900 hover:underline">{p.nama}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs font-mono">{p.nik}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{JENJANG_LABELS[p.jenjang] ?? p.jenjang}{p.kelas ? ` - ${p.kelas}` : ''}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{p.institusi}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Link to={`/penerima/${p.id}/edit`} className="text-bgn-800 hover:underline text-xs">Edit</Link>
                      <button onClick={() => { if (confirm('Hapus penerima?')) deleteMutation.mutate(p.id) }}
                        className="text-red-500 hover:underline text-xs">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Belum ada penerima</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} totalPages={meta?.totalPages ?? 1} onPageChange={setPage} />
    </div>
  )
}