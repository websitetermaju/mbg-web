import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sekolahApi } from '@/api/endpoints/sekolah'
import { Pagination } from '@/components/Pagination'
import type { KategoriSekolah, StatusSekolah } from '@/types'

const KATEGORI_LABELS: Record<string, string> = {
  TK_PAUD: 'TK/PAUD', SD_MI: 'SD/MI', SMP_MTS: 'SMP/MTs',
  SMA_MA_SMK: 'SMA/MA/SMK', POSYANDU: 'Posyandu',
}

const STATUS_LABELS: Record<string, string> = {
  AKTIF: 'Aktif',
  NONAKTIF: 'Nonaktif',
}

export function SekolahListPage() {
  const [page, setPage] = useState(1)
  const [kategori, setKategori] = useState('')
  const [status, setStatus] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['sekolah', page, kategori, status],
    queryFn: () => sekolahApi.list({ page, limit: 20, ...(kategori ? { kategori } : {}), ...(status ? { status } : {}) }),
  })

  const deleteMutation = useMutation({
    mutationFn: sekolahApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sekolah'] }),
  })

  const items = data?.data.data ?? []
  const meta = data?.data.meta

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-bgn-900">Sekolah</h1>
        <div className="flex items-center gap-2">
          <Link to="/penerima" className="border border-bgn-200 text-bgn-700 px-4 py-2 rounded-lg text-sm hover:bg-bgn-50">
            Penerima manfaat
          </Link>
          <Link to="/sekolah/baru" className="bg-bgn-green-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-bgn-green-500">
            + Tambah Sekolah
          </Link>
        </div>
      </div>
      <div className="flex gap-3 mb-4">
        <select value={kategori} onChange={(e) => { setKategori(e.target.value as KategoriSekolah | ''); setPage(1) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none">
          <option value="">Semua Kategori</option>
          {Object.entries(KATEGORI_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={status} onChange={(e) => { setStatus(e.target.value as StatusSekolah | ''); setPage(1) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none">
          <option value="">Semua Status</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      {isLoading ? <p className="text-gray-500">Memuat...</p> : (
        <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bgn-200">
              <tr>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Nama</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Kategori</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Kabupaten/Kota</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Jml Penerima</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bgn-100">
              {items.map((s) => (
                <tr key={s.id} className="odd:bg-white even:bg-bgn-50 hover:bg-bgn-100 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/sekolah/${s.id}`} className="font-medium text-bgn-900 hover:underline">{s.nama}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{KATEGORI_LABELS[s.kategori] ?? s.kategori}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{s.kabupatenKota}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{s.jumlahPenerima}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === 'AKTIF' ? 'bg-bgn-green-100 text-bgn-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {STATUS_LABELS[s.status] ?? s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Link to={`/sekolah/${s.id}/edit`} className="text-bgn-800 hover:underline text-xs">Edit</Link>
                      <button onClick={() => { if (confirm('Hapus sekolah?')) deleteMutation.mutate(s.id) }}
                        className="text-red-500 hover:underline text-xs">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Belum ada sekolah</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} totalPages={meta?.totalPages ?? 1} onPageChange={setPage} />
    </div>
  )
}