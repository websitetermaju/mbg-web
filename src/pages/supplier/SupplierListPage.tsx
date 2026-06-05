import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supplierApi } from '@/api/endpoints/supplier'
import { Pagination } from '@/components/Pagination'

const KATEGORI_LABELS: Record<string, string> = {
  BAHAN_SEGAR: 'Bahan Segar', BAHAN_KERING: 'Bahan Kering',
  BUMBU_REMPAH: 'Bumbu', KEMASAN: 'Kemasan', LAINNYA: 'Lainnya',
}

export function SupplierListPage() {
  const [page, setPage] = useState(1)
  const [kategori, setKategori] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['supplier', page, kategori],
    queryFn: () => supplierApi.list({ page, limit: 20, ...(kategori ? { kategori } : {}) }),
  })

  const deleteMutation = useMutation({
    mutationFn: supplierApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['supplier'] }),
  })

  const items = data?.data.data ?? []
  const meta = data?.data.meta

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-bgn-900">Supplier</h1>
        <Link to="/supplier/baru" className="bg-bgn-green-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-bgn-green-500">
          + Tambah Supplier
        </Link>
      </div>
      <div className="mb-4">
        <select value={kategori} onChange={(e) => { setKategori(e.target.value); setPage(1) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none">
          <option value="">Semua Kategori</option>
          {Object.entries(KATEGORI_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      {isLoading ? <p className="text-gray-500">Memuat...</p> : (
        <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bgn-200">
              <tr>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Nama</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Kategori</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">PIC</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Termin</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bgn-100">
              {items.map((s) => (
                <tr key={s.id} className="odd:bg-white even:bg-bgn-50 hover:bg-bgn-100 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-bgn-900">{s.nama}</p>
                    <p className="text-xs text-gray-500">{s.jenisUsaha} • {s.kota ?? '-'}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{KATEGORI_LABELS[s.kategori] ?? s.kategori}</td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700 text-xs">{s.namaPic}</p>
                    <p className="text-gray-500 text-xs">{s.telepon}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{s.terminBayar.replace('_', ' ')}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.isActive ? 'bg-bgn-green-100 text-bgn-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {s.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Link to={`/supplier/${s.id}/edit`} className="text-bgn-800 hover:underline text-xs">Edit</Link>
                      <button onClick={() => { if (confirm('Hapus supplier?')) deleteMutation.mutate(s.id) }}
                        className="text-red-500 hover:underline text-xs">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Belum ada supplier</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} totalPages={meta?.totalPages ?? 1} onPageChange={setPage} />
    </div>
  )
}
