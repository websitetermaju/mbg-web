import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { laporanApi } from '@/api/endpoints/laporan'
import { StatusBadge } from '@/components/StatusBadge'
import { Pagination } from '@/components/Pagination'

export function LaporanListPage() {
  const [page, setPage] = useState(1)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['laporan', page],
    queryFn: () => laporanApi.list({ page, limit: 20 }),
  })

  const submitMutation = useMutation({
    mutationFn: laporanApi.submit,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['laporan'] }),
  })

  const acceptMutation = useMutation({
    mutationFn: laporanApi.accept,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['laporan'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: laporanApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['laporan'] }),
  })

  const [exporting, setExporting] = useState<string | null>(null)

  const handleExport = async (id: string, format: 'pdf' | 'excel') => {
    try {
      setExporting(id + format)
      const res = await laporanApi.export(id, format)
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `laporan-${id}.${format === 'pdf' ? 'pdf' : 'xlsx'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 100)
    } catch (err) {
      console.error('[Export]', err)
      window.alert('Gagal mengunduh file. Silakan coba lagi.')
    } finally {
      setExporting(null)
    }
  }

  const items = data?.data.data ?? []
  const meta = data?.data.meta

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Laporan</h1>
        <Link
          to="/laporan/baru"
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
        >
          + Generate Laporan
        </Link>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Memuat...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Judul</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Jenis</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Periode</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{l.judul}</td>
                  <td className="px-4 py-3 text-gray-600">{l.jenis}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {l.periodeMulai} – {l.periodeAkhir}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => { void handleExport(l.id, 'excel') }}
                        disabled={exporting === l.id + 'excel'}
                        className="text-green-600 hover:underline text-xs"
                      >
                        {exporting === l.id + 'excel' ? 'Memuat...' : 'Excel'}
                      </button>
                      <button
                        onClick={() => { void handleExport(l.id, 'pdf') }}
                        disabled={exporting === l.id + 'pdf'}
                        className="text-red-600 hover:underline text-xs"
                      >
                        {exporting === l.id + 'pdf' ? 'Memuat...' : 'PDF'}
                      </button>
                      {l.status === 'REVIEWED' && (
                        <button
                          onClick={() => submitMutation.mutate(l.id)}
                          className="text-purple-600 hover:underline"
                        >
                          Submit ke BGN
                        </button>
                      )}
                      {l.status === 'SUBMITTED' && (
                        <button
                          onClick={() => acceptMutation.mutate(l.id)}
                          className="text-green-600 hover:underline"
                        >
                          Terima
                        </button>
                      )}
                      {l.status === 'DRAFT' && (
                        <button
                          onClick={() => { if (confirm('Hapus laporan ini?')) deleteMutation.mutate(l.id) }}
                          className="text-red-500 hover:underline"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Belum ada laporan</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} totalPages={meta?.totalPages ?? 1} onPageChange={setPage} />
    </div>
  )
}
