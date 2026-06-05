import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { stockOpnameApi } from '@/api/endpoints/stock-opname'
import { getErrorMessage } from '@/utils/error'
import { Pagination } from '@/components/Pagination'

export function StockOpnamePage() {
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [tanggal, setTanggal] = useState('')
  const [catatan, setCatatan] = useState('')
  const [error, setError] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['stock-opname', page],
    queryFn: () => stockOpnameApi.list({ page, limit: 20 }),
  })

  const createMutation = useMutation({
    mutationFn: () => stockOpnameApi.create({ tanggal, catatan: catatan || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stock-opname'] }); setShowForm(false); setTanggal(''); setCatatan('') },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: stockOpnameApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['stock-opname'] }),
  })

  const items = data?.data.data ?? []
  const meta = data?.data.meta

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-bgn-900">Stock Opname</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-bgn-green-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-bgn-green-500">
          + Buat Opname
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}

      {showForm && (
        <div className="bg-white rounded-xl border border-bgn-200 p-5 shadow-md mb-4">
          <h3 className="font-semibold text-bgn-900 mb-3">Buat Opname Baru</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="block text-xs font-medium text-gray-700 mb-1">Tanggal *</label>
              <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" /></div>
            <div><label className="block text-xs font-medium text-gray-700 mb-1">Catatan (opsional)</label>
              <input value={catatan} onChange={(e) => setCatatan(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" /></div>
          </div>
          <p className="text-xs text-gray-500 mb-3">Sistem akan otomatis snapshot stok semua bahan baku saat opname dibuat.</p>
          <div className="flex gap-2">
            <button onClick={() => createMutation.mutate()} disabled={!tanggal || createMutation.isPending}
              className="bg-bgn-green-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-bgn-green-500 disabled:opacity-50">
              {createMutation.isPending ? 'Membuat...' : 'Buat Opname'}
            </button>
            <button onClick={() => setShowForm(false)} className="border border-gray-300 px-4 py-2 rounded-lg text-sm">Batal</button>
          </div>
        </div>
      )}

      {isLoading ? <p className="text-gray-500">Memuat...</p> : (
        <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bgn-200">
              <tr>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Tanggal</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Catatan</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Bahan</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bgn-100">
              {items.map((op) => {
                const diisi = op.items.filter(i => i.jumlahFisik !== null).length
                return (
                  <tr key={op.id} className="odd:bg-white even:bg-bgn-50 hover:bg-bgn-100 transition-colors">
                    <td className="px-4 py-3"><Link to={`/stock-opname/${op.id}`} className="font-medium text-bgn-800 hover:underline">{op.tanggal}</Link></td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{op.catatan ?? '-'}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{diisi}/{op.items.length} diisi</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${op.status === 'FINALIZED' ? 'bg-bgn-green-100 text-bgn-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {op.status === 'FINALIZED' ? 'Final' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {op.status === 'DRAFT' && (
                        <button onClick={() => { if (confirm('Hapus opname?')) deleteMutation.mutate(op.id) }}
                          className="text-red-500 hover:underline text-xs">Hapus</button>
                      )}
                    </td>
                  </tr>
                )
              })}
              {items.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Belum ada stock opname</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} totalPages={meta?.totalPages ?? 1} onPageChange={setPage} />
    </div>
  )
}
