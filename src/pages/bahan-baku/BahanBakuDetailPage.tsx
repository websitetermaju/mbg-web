import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bahanBakuApi } from '@/api/endpoints/bahan-baku'
import { stokBatchApi } from '@/api/endpoints/stok-batch'
import { StatusBadge } from '@/components/StatusBadge'
import { getErrorMessage } from '@/utils/error'

function getDaysUntilExpiry(tanggal: string | null): number | null {
  if (!tanggal) return null
  const diff = new Date(tanggal).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function BahanBakuDetailPage() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const [showBatchForm, setShowBatchForm] = useState(false)
  const [batchJumlah, setBatchJumlah] = useState('')
  const [batchTanggal, setBatchTanggal] = useState('')
  const [batchKadaluarsa, setBatchKadaluarsa] = useState('')
  const [batchHarga, setBatchHarga] = useState('')
  const [error, setError] = useState('')

  const { data: bahanData, isLoading } = useQuery({
    queryKey: ['bahan-baku', id],
    queryFn: () => bahanBakuApi.getOne(id!),
    enabled: !!id,
  })

  const { data: batchData } = useQuery({
    queryKey: ['stok-batch', id],
    queryFn: () => stokBatchApi.getBahan(id!),
    enabled: !!id,
  })

  const createBatchMutation = useMutation({
    mutationFn: () => stokBatchApi.createManual(id!, {
      bahanBakuId: id!,
      jumlahMasuk: parseFloat(batchJumlah),
      tanggalMasuk: batchTanggal,
      tanggalKadaluarsa: batchKadaluarsa || undefined,
      hargaSatuan: batchHarga ? parseFloat(batchHarga) : undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stok-batch', id] })
      qc.invalidateQueries({ queryKey: ['bahan-baku', id] })
      setShowBatchForm(false)
      setBatchJumlah(''); setBatchTanggal(''); setBatchKadaluarsa(''); setBatchHarga('')
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  if (isLoading) return <p className="text-gray-500">Memuat...</p>
  const bahan = bahanData?.data.data
  if (!bahan) return <p className="text-red-500">Data tidak ditemukan</p>

  const batches = batchData?.data.data ?? []
  const expiringBatches = batches.filter(b => {
    const days = getDaysUntilExpiry(b.tanggalKadaluarsa)
    return days !== null && days <= 7 && b.jumlahTersisa > 0
  })

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/bahan-baku" className="text-bgn-800 hover:underline text-sm">← Bahan Baku</Link>
        <span className="text-gray-400">/</span>
        <h1 className="text-2xl font-bold text-bgn-900">{bahan.nama}</h1>
        <StatusBadge status={bahan.statusStok} />
      </div>

      {expiringBatches.length > 0 && (
        <div className="bg-orange-50 border border-orange-300 rounded-lg p-4 mb-4 text-sm text-orange-700">
          ⚠ <strong>{expiringBatches.length} batch</strong> akan kadaluarsa dalam 7 hari!
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}

      <div className="bg-white rounded-xl shadow-md border border-bgn-100 p-5 mb-4">
        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
          <div><span className="text-gray-500">Satuan:</span> <span className="font-medium">{bahan.satuan}</span></div>
          <div><span className="text-gray-500">Kategori:</span> <span className="font-medium">{bahan.kategori ?? '-'}</span></div>
          <div><span className="text-gray-500">Stok Minimum:</span> <span className="font-medium">{bahan.stokMinimum} {bahan.satuan}</span></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Stok Akhir', value: `${bahan.stokAkhir} ${bahan.satuan}`, color: bahan.statusStok !== 'NORMAL' ? 'text-red-600' : 'text-bgn-green-700' },
            { label: 'Stok Masuk', value: `${bahan.stokMasuk} ${bahan.satuan}` },
            { label: 'Stok Keluar', value: `${bahan.stokKeluar} ${bahan.satuan}` },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center p-3 bg-bgn-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`font-bold ${color ?? 'text-gray-800'}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-bgn-100">
          <h2 className="font-semibold text-bgn-900">Batch Stok</h2>
          <button onClick={() => setShowBatchForm(!showBatchForm)}
            className="bg-bgn-green-400 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-bgn-green-500">
            + Input Batch Manual
          </button>
        </div>

        {showBatchForm && (
          <div className="p-5 border-b border-bgn-100 bg-bgn-50">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Jumlah ({bahan.satuan})</label>
                <input type="number" value={batchJumlah} onChange={(e) => setBatchJumlah(e.target.value)} placeholder="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Masuk</label>
                <input type="date" value={batchTanggal} onChange={(e) => setBatchTanggal(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Kadaluarsa (opsional)</label>
                <input type="date" value={batchKadaluarsa} onChange={(e) => setBatchKadaluarsa(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Harga Satuan (opsional)</label>
                <input type="number" value={batchHarga} onChange={(e) => setBatchHarga(e.target.value)} placeholder="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => createBatchMutation.mutate()}
                disabled={!batchJumlah || !batchTanggal || createBatchMutation.isPending}
                className="bg-bgn-green-400 text-white px-5 py-2 rounded-lg text-sm hover:bg-bgn-green-500 disabled:opacity-50">
                {createBatchMutation.isPending ? 'Menyimpan...' : 'Simpan Batch'}
              </button>
              <button onClick={() => setShowBatchForm(false)} className="border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
                Batal
              </button>
            </div>
          </div>
        )}

        {batches.length === 0 ? (
          <p className="px-5 py-8 text-center text-gray-400 text-sm">Belum ada data batch stok</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-bgn-200">
              <tr>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Masuk</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Kadaluarsa</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Jumlah Masuk</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Sisa</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Lokasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bgn-100">
              {batches.map((b) => {
                const days = getDaysUntilExpiry(b.tanggalKadaluarsa)
                return (
                  <tr key={b.id} className="odd:bg-white even:bg-bgn-50">
                    <td className="px-4 py-3 text-gray-700">{b.tanggalMasuk}</td>
                    <td className="px-4 py-3">
                      {b.tanggalKadaluarsa ? (
                        <span className={`text-xs font-medium ${days !== null && days <= 3 ? 'text-red-600' : days !== null && days <= 7 ? 'text-orange-600' : 'text-gray-600'}`}>
                          {b.tanggalKadaluarsa}
                          {days !== null && days <= 7 && (
                            <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${days <= 3 ? 'bg-red-100' : 'bg-orange-100'}`}>
                              {days}h lagi
                            </span>
                          )}
                        </span>
                      ) : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{b.jumlahMasuk} {bahan.satuan}</td>
                    <td className={`px-4 py-3 font-medium ${Number(b.jumlahTersisa) <= 0 ? 'text-gray-400 line-through' : 'text-bgn-900'}`}>
                      {b.jumlahTersisa} {bahan.satuan}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{b.lokasi?.nama ?? '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
