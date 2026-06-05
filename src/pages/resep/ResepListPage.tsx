import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { resepApi } from '@/api/endpoints/resep'
import { Pagination } from '@/components/Pagination'
import type { JenisPenerima } from '@/types'

const JP_LABELS: Record<JenisPenerima, string> = {
  BALITA: 'Balita', SD: 'SD', SMP_SMA: 'SMP/SMA', IBU_HAMIL: 'Ibu Hamil', LANSIA: 'Lansia',
}

export function ResepListPage() {
  const [page, setPage] = useState(1)
  const [jp, setJp] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['resep', page, jp],
    queryFn: () => resepApi.list({ page, limit: 20, ...(jp ? { jenisPenerima: jp } : {}) }),
  })

  const deleteMutation = useMutation({
    mutationFn: resepApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resep'] }),
  })

  const items = data?.data.data ?? []
  const meta = data?.data.meta

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-bgn-900">Resep / BOM</h1>
        <Link to="/resep/baru" className="bg-bgn-green-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-bgn-green-500">
          + Buat Resep
        </Link>
      </div>
      <div className="mb-4">
        <select value={jp} onChange={(e) => { setJp(e.target.value); setPage(1) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none">
          <option value="">Semua Penerima</option>
          {Object.entries(JP_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      {isLoading ? <p className="text-gray-500">Memuat...</p> : (
        <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bgn-200">
              <tr>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Nama Resep</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Penerima</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Bahan</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bgn-100">
              {items.map((r) => (
                <tr key={r.id} className="odd:bg-white even:bg-bgn-50 hover:bg-bgn-100 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/resep/${r.id}`} className="font-medium text-bgn-800 hover:underline">{r.nama}</Link>
                    {r.deskripsi && <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{r.deskripsi}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{JP_LABELS[r.jenisPenerima] ?? r.jenisPenerima}</td>
                  <td className="px-4 py-3 text-gray-600">{r.items?.length ?? 0} bahan</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.isActive ? 'bg-bgn-green-100 text-bgn-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {r.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link to={`/resep/${r.id}`} className="text-bgn-800 hover:underline text-xs">Detail</Link>
                      <button onClick={() => { if (confirm('Hapus resep?')) deleteMutation.mutate(r.id) }}
                        className="text-red-500 hover:underline text-xs">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Belum ada resep</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} totalPages={meta?.totalPages ?? 1} onPageChange={setPage} />
    </div>
  )
}
