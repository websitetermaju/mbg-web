import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { keuanganApi } from '@/api/endpoints/keuangan'
import { Pagination } from '@/components/Pagination'

export function KeuanganListPage() {
  const [page, setPage] = useState(1)
  const [filterJenis, setFilterJenis] = useState<'PEMASUKAN' | 'PENGELUARAN' | ''>('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['keuangan', page, filterJenis],
    queryFn: () =>
      keuanganApi.list({ page, limit: 20, jenisTransaksi: filterJenis || undefined }),
  })

  const deleteMutation = useMutation({
    mutationFn: keuanganApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['keuangan'] }),
  })

  const items = data?.data.data ?? []
  const meta = data?.data.meta

  const totalPemasukan = items
    .filter((k) => k.jenisTransaksi === 'PEMASUKAN')
    .reduce((s, k) => s + k.jumlah, 0)
  const totalPengeluaran = items
    .filter((k) => k.jenisTransaksi === 'PENGELUARAN')
    .reduce((s, k) => s + k.jumlah, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Keuangan</h1>
        <Link
          to="/keuangan/baru"
          className="bg-bgn-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-bgn-900"
        >
          + Catat Transaksi
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-bgn-50 border border-bgn-200 rounded-xl p-4">
          <p className="text-sm text-bgn-800">Total Pemasukan (halaman ini)</p>
          <p className="text-xl font-bold text-bgn-900">Rp {totalPemasukan.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-600">Total Pengeluaran (halaman ini)</p>
          <p className="text-xl font-bold text-red-700">Rp {totalPengeluaran.toLocaleString('id-ID')}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4 flex gap-2">
        {(['', 'PEMASUKAN', 'PENGELUARAN'] as const).map((j) => (
          <button
            key={j}
            onClick={() => setFilterJenis(j)}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              filterJenis === j
                ? 'bg-bgn-900 text-white border-bgn-800'
                : 'border-gray-300 text-gray-600 hover:border-bgn-600'
            }`}
          >
            {j === '' ? 'Semua' : j === 'PEMASUKAN' ? 'Pemasukan' : 'Pengeluaran'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-gray-500">Memuat...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Tanggal</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Jenis</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Kategori</th>
                <th className="text-right px-4 py-3 text-gray-600 font-medium">Jumlah</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Keterangan</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((k) => (
                <tr key={k.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">{k.tanggal}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        k.jenisTransaksi === 'PEMASUKAN'
                          ? 'bg-bgn-100 text-bgn-900'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {k.jenisTransaksi === 'PEMASUKAN' ? 'Pemasukan' : 'Pengeluaran'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{k.kategori}</td>
                  <td className={`px-4 py-3 text-right font-medium ${
                    k.jenisTransaksi === 'PEMASUKAN' ? 'text-bgn-800' : 'text-red-600'
                  }`}>
                    {k.jenisTransaksi === 'PEMASUKAN' ? '+' : '-'} Rp {k.jumlah.toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{k.keterangan ?? '-'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => { if (confirm('Hapus transaksi ini?')) deleteMutation.mutate(k.id) }}
                      className="text-red-500 hover:underline text-sm"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Belum ada transaksi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} totalPages={meta?.totalPages ?? 1} onPageChange={setPage} />
    </div>
  )
}
