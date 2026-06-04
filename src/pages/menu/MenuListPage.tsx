import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { menuApi } from '@/api/endpoints/menu'
import { StatusBadge } from '@/components/StatusBadge'
import { Pagination } from '@/components/Pagination'
import type { StatusMenu } from '@/types'

export function MenuListPage() {
  const [page, setPage] = useState(1)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['menu', page],
    queryFn: () => menuApi.list({ page, limit: 20 }),
  })

  const deleteMutation = useMutation({
    mutationFn: menuApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu'] }),
  })

  const transisiMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: StatusMenu }) =>
      menuApi.transisiStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['menu'] }),
  })

  const items = data?.data.data ?? []
  const meta = data?.data.meta

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Menu Harian</h1>
        <Link
          to="/menu/baru"
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
        >
          + Buat Menu
        </Link>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Memuat...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Nama Menu</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Tanggal</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Penerima</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Porsi</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{m.namaMenu}</td>
                  <td className="px-4 py-3 text-gray-600">{m.tanggal}</td>
                  <td className="px-4 py-3 text-gray-600">{m.jenisPenerima}</td>
                  <td className="px-4 py-3 text-gray-600">{m.jumlahPorsi}</td>
                  <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      {m.status === 'DRAFT' && (
                        <>
                          <Link to={`/menu/${m.id}/edit`} className="text-blue-600 hover:underline">Edit</Link>
                          <button
                            onClick={() => transisiMutation.mutate({ id: m.id, status: 'APPROVED' })}
                            className="text-green-600 hover:underline"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => { if (confirm('Hapus menu ini?')) deleteMutation.mutate(m.id) }}
                            className="text-red-500 hover:underline"
                          >
                            Hapus
                          </button>
                        </>
                      )}
                      {m.status === 'APPROVED' && (
                        <button
                          onClick={() => transisiMutation.mutate({ id: m.id, status: 'REJECTED' })}
                          className="text-red-500 hover:underline"
                        >
                          Tolak
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Belum ada menu</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} totalPages={meta?.totalPages ?? 1} onPageChange={setPage} />
    </div>
  )
}
