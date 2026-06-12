import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { rabApi } from '@/api/endpoints/rab'
import { Pagination } from '@/components/Pagination'

const fRp = (n: number) => 'Rp ' + Number(n).toLocaleString('id-ID')

export function RabListPage() {
  const [page, setPage] = useState(1)
  const [pesan, setPesan] = useState<{ tipe: 'ok' | 'err'; teks: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['rab', page],
    queryFn: () => rabApi.list({ page, limit: 20 }),
  })

  const importMutation = useMutation({
    mutationFn: (file: File) => rabApi.import(file),
    onSuccess: (res) => {
      setPesan({ tipe: 'ok', teks: `Berhasil import "${res.data.data.label}".` })
      qc.invalidateQueries({ queryKey: ['rab'] })
    },
    onError: (err) => {
      const teks = isAxiosError(err)
        ? (err.response?.data?.message ?? 'Gagal import file.')
        : 'Gagal import file.'
      setPesan({ tipe: 'err', teks: Array.isArray(teks) ? teks.join(', ') : teks })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: rabApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rab'] }),
  })

  const items = data?.data.data ?? []
  const meta = data?.data.meta

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">RAB Mingguan</h1>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) importMutation.mutate(f)
              e.target.value = ''
            }}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={importMutation.isPending}
            className="bg-bgn-green-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-bgn-green-500 disabled:opacity-60"
          >
            {importMutation.isPending ? 'Mengimpor...' : '+ Import Excel'}
          </button>
        </div>
      </div>

      {pesan && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm ${
            pesan.tipe === 'ok'
              ? 'bg-bgn-50 border border-bgn-200 text-bgn-800'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {pesan.teks}
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-500">Memuat...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bgn-200">
              <tr>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Label</th>
                <th className="text-right px-4 py-3 text-bgn-900 font-semibold">Total anggaran</th>
                <th className="text-right px-4 py-3 text-bgn-900 font-semibold">Penggunaan</th>
                <th className="text-right px-4 py-3 text-bgn-900 font-semibold">Sisa</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Diimpor</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bgn-100">
              {items.map((r) => (
                <tr key={r.id} className="odd:bg-white even:bg-bgn-50 hover:bg-bgn-100 transition-colors">
                  <td className="px-4 py-3 text-gray-700 font-medium">
                    <Link to={`/rab/${r.id}`} className="text-bgn-700 hover:underline">
                      {r.label}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{fRp(r.totalAnggaran)}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{fRp(r.penggunaanAnggaran)}</td>
                  <td className={`px-4 py-3 text-right font-medium ${r.sisaAnggaran < 0 ? 'text-red-600' : 'text-bgn-800'}`}>
                    {fRp(r.sisaAnggaran)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.importedAt?.slice(0, 10)}</td>
                  <td className="px-4 py-3 flex gap-3">
                    <Link to={`/rab/${r.id}`} className="text-bgn-600 hover:underline text-sm">Lihat</Link>
                    <button
                      onClick={() => { if (confirm('Hapus RAB ini?')) deleteMutation.mutate(r.id) }}
                      className="text-red-500 hover:underline text-sm"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Belum ada RAB. Klik "Import Excel" untuk menambah.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} totalPages={meta?.totalPages ?? 1} onPageChange={setPage} />
    </div>
  )
}
