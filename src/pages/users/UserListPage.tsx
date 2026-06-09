import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/api/endpoints/users'
import { StatusBadge } from '@/components/StatusBadge'
import { Pagination } from '@/components/Pagination'
import { useAuthStore } from '@/store/auth.store'

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Semua Role' },
  { value: 'ADMIN_BGN', label: 'Admin BGN' },
  { value: 'KEPALA_SPPG', label: 'Kepala SPPG' },
  { value: 'AHLI_GIZI', label: 'Ahli Gizi' },
  { value: 'PETUGAS_DAPUR', label: 'Petugas Dapur' },
  { value: 'KURIR', label: 'Kurir' },
  { value: 'BENDAHARA', label: 'Bendahara' },
]

const ROLE_LABELS: Record<string, string> = {
  ADMIN_BGN: 'Admin BGN',
  KEPALA_SPPG: 'Kepala SPPG',
  AHLI_GIZI: 'Ahli Gizi',
  PETUGAS_DAPUR: 'Petugas Dapur',
  KURIR: 'Kurir',
  BENDAHARA: 'Bendahara',
}

const ACTIVE_OPTIONS = [
  { value: '', label: 'Semua' },
  { value: 'true', label: 'Aktif' },
  { value: 'false', label: 'Nonaktif' },
]

export function UserListPage() {
  const [page, setPage] = useState(1)
  const [role, setRole] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const canManage = user?.role === 'ADMIN_BGN' || user?.role === 'KEPALA_SPPG'

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, role, activeFilter],
    queryFn: () => usersApi.list({
      page,
      limit: 20,
      ...(role ? { role } : {}),
      ...(activeFilter ? { isActive: activeFilter === 'true' } : {}),
    }),
  })

  const deleteMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })

  const items = data?.data.data ?? []
  const meta = data?.data.meta

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-bgn-900">Pengguna</h1>
      </div>
      <div className="flex gap-3 mb-4">
        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none">
          {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={activeFilter} onChange={(e) => { setActiveFilter(e.target.value); setPage(1) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none">
          {ACTIVE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      {isLoading ? <p className="text-gray-500">Memuat...</p> : (
        <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bgn-200">
              <tr>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Nama</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Email</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Role</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Status</th>
                {canManage && <th className="px-4 py-3"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-bgn-100">
              {items.map((u) => (
                <tr key={u.id} className="odd:bg-white even:bg-bgn-50 hover:bg-bgn-100 transition-colors">
                  <td className="px-4 py-3 font-medium text-bgn-900">{u.nama}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">{ROLE_LABELS[u.role] ?? u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={u.isActive ? 'AKTIF' : 'NONAKTIF'} />
                  </td>
                  {canManage && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Link to={`/users/${u.id}/edit`} className="text-bgn-800 hover:underline text-xs">Edit</Link>
                        <button onClick={() => { if (confirm('Nonaktifkan pengguna ini?')) deleteMutation.mutate(u.id) }}
                          className="text-red-500 hover:underline text-xs">Hapus</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={canManage ? 5 : 4} className="px-4 py-8 text-center text-gray-400">Belum ada pengguna</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} totalPages={meta?.totalPages ?? 1} onPageChange={setPage} />
    </div>
  )
}