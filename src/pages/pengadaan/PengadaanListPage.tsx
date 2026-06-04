import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pengadaanApi } from '@/api/endpoints/pengadaan'
import { StatusBadge } from '@/components/StatusBadge'
import { Pagination } from '@/components/Pagination'

export function PengadaanListPage() {
  const [page, setPage] = useState(1)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['pengadaan', page],
    queryFn: () => pengadaanApi.list({ page, limit: 20 }),
  })

  const approveMutation = useMutation({
    mutationFn: pengadaanApi.approve,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pengadaan'] }),
  })

  const orderMutation = useMutation({
    mutationFn: pengadaanApi.order,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pengadaan'] }),
  })

  const cancelMutation = useMutation({
    mutationFn: pengadaanApi.cancel,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pengadaan'] }),
  })

  const items = data?.data.data ?? []
  const meta = data?.data.meta

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pengadaan Bahan Baku</h1>
        <Link
          to="/pengadaan/baru"
          className="bg-bgn-green-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-bgn-green-500"
        >
          + Buat PO
        </Link>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Memuat...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bgn-200">
              <tr>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">No. PO</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Tanggal</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Supplier</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Total</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bgn-100">
              {items.map((p) => (
                <tr key={p.id} className="odd:bg-white even:bg-bgn-50 hover:bg-bgn-100 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    <Link to={`/pengadaan/${p.id}`} className="text-blue-600 hover:underline">
                      {p.nomorPo}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.tanggal}</td>
                  <td className="px-4 py-3 text-gray-600">{p.supplier}</td>
                  <td className="px-4 py-3 text-gray-600">Rp {p.totalNilai.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      {p.status === 'DRAFT' && (
                        <>
                          <button
                            onClick={() => approveMutation.mutate(p.id)}
                            className="text-bgn-800 hover:underline"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => cancelMutation.mutate(p.id)}
                            className="text-red-500 hover:underline"
                          >
                            Batal
                          </button>
                        </>
                      )}
                      {p.status === 'APPROVED' && (
                        <>
                          <button
                            onClick={() => orderMutation.mutate(p.id)}
                            className="text-blue-600 hover:underline"
                          >
                            Pesan
                          </button>
                          <button
                            onClick={() => cancelMutation.mutate(p.id)}
                            className="text-red-500 hover:underline"
                          >
                            Batal
                          </button>
                        </>
                      )}
                      {p.status === 'ORDERED' && (
                        <Link to={`/pengadaan/${p.id}`} className="text-bgn-800 hover:underline">
                          Terima Barang
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    Belum ada pengadaan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} totalPages={meta?.totalPages ?? 1} onPageChange={setPage} />
    </div>
  )
}
