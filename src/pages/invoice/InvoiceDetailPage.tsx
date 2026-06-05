import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { invoiceApi } from '@/api/endpoints/invoice'
import { StatusBadge } from '@/components/StatusBadge'
import { getErrorMessage } from '@/utils/error'
import type { MetodeBayar } from '@/types'

const formatRp = (n: number) => `Rp ${Number(n).toLocaleString('id-ID')}`

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [bayarJumlah, setBayarJumlah] = useState('')
  const [bayarTanggal, setBayarTanggal] = useState('')
  const [bayarMetode, setBayarMetode] = useState<MetodeBayar>('TRANSFER')
  const [bayarCatatan, setBayarCatatan] = useState('')
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoiceApi.getOne(id!),
    enabled: !!id,
  })

  const tambahMutation = useMutation({
    mutationFn: () => invoiceApi.tambahPembayaran(id!, {
      jumlah: parseFloat(bayarJumlah),
      tanggalBayar: bayarTanggal,
      metodeBayar: bayarMetode,
      catatan: bayarCatatan || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoice', id] })
      setShowForm(false)
      setBayarJumlah(''); setBayarTanggal(''); setBayarCatatan('')
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const batalMutation = useMutation({
    mutationFn: (bayarId: string) => invoiceApi.batalkanPembayaran(id!, bayarId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoice', id] }),
    onError: (err) => setError(getErrorMessage(err)),
  })

  if (isLoading) return <p className="text-gray-500">Memuat...</p>
  const inv = data?.data.data
  if (!inv) return <p className="text-red-500">Data tidak ditemukan</p>

  const pct = inv.totalTagihan > 0 ? Math.min(100, (inv.totalDibayar / inv.totalTagihan) * 100) : 0
  const sisa = inv.totalTagihan - inv.totalDibayar

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/invoice" className="text-bgn-800 hover:underline text-sm">← Invoice</Link>
        <span className="text-gray-400">/</span>
        <h1 className="text-2xl font-bold text-bgn-900">{inv.nomorInvoice}</h1>
        <StatusBadge status={inv.status} />
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}

      {/* Header info */}
      <div className="bg-white rounded-xl shadow-md border border-bgn-100 p-5 mb-4">
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div><span className="text-gray-500">PO:</span>{' '}
            <Link to={`/pengadaan/${inv.pengadaanId}`} className="text-bgn-800 hover:underline font-medium">
              {inv.pengadaan?.nomorPo ?? inv.pengadaanId}
            </Link>
          </div>
          <div><span className="text-gray-500">Jatuh Tempo:</span>{' '}
            <span className={inv.status === 'OVERDUE' ? 'text-red-600 font-semibold' : 'font-medium'}>
              {inv.tanggalJatuhTempo}
            </span>
          </div>
          {inv.supplier && <div><span className="text-gray-500">Supplier:</span> <span className="font-medium">{inv.supplier.nama}</span></div>}
        </div>

        {/* Progress bar */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progres Pembayaran</span>
            <span>{pct.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className={`h-2 rounded-full transition-all ${inv.status === 'PAID' ? 'bg-bgn-green-400' : inv.status === 'OVERDUE' ? 'bg-red-400' : 'bg-bgn-400'}`}
              style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center p-3 bg-bgn-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Total Tagihan</p>
            <p className="font-bold text-bgn-900">{formatRp(inv.totalTagihan)}</p>
          </div>
          <div className="text-center p-3 bg-bgn-green-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Dibayar</p>
            <p className="font-bold text-bgn-green-600">{formatRp(inv.totalDibayar)}</p>
          </div>
          <div className={`text-center p-3 rounded-lg ${sisa > 0 ? 'bg-orange-50' : 'bg-bgn-green-50'}`}>
            <p className="text-xs text-gray-500 mb-1">Sisa</p>
            <p className={`font-bold ${sisa > 0 ? 'text-orange-600' : 'text-bgn-green-600'}`}>{formatRp(Math.max(0, sisa))}</p>
          </div>
        </div>
      </div>

      {/* Riwayat Pembayaran */}
      <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden mb-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-bgn-100">
          <h2 className="font-semibold text-bgn-900">Riwayat Pembayaran</h2>
          {inv.status !== 'PAID' && (
            <button onClick={() => setShowForm(!showForm)}
              className="bg-bgn-green-400 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-bgn-green-500">
              + Tambah Pembayaran
            </button>
          )}
        </div>

        {showForm && (
          <div className="p-5 border-b border-bgn-100 bg-bgn-50">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Jumlah (Rp)</label>
                <input type="number" value={bayarJumlah} onChange={(e) => setBayarJumlah(e.target.value)}
                  placeholder="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Bayar</label>
                <input type="date" value={bayarTanggal} onChange={(e) => setBayarTanggal(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Metode</label>
                <select value={bayarMetode} onChange={(e) => setBayarMetode(e.target.value as MetodeBayar)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none">
                  <option value="TRANSFER">Transfer Bank</option>
                  <option value="TUNAI">Tunai</option>
                  <option value="CEK">Cek</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Catatan (opsional)</label>
                <input type="text" value={bayarCatatan} onChange={(e) => setBayarCatatan(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => tambahMutation.mutate()} disabled={!bayarJumlah || !bayarTanggal || tambahMutation.isPending}
                className="bg-bgn-green-400 text-white px-5 py-2 rounded-lg text-sm hover:bg-bgn-green-500 disabled:opacity-50">
                {tambahMutation.isPending ? 'Menyimpan...' : 'Simpan Pembayaran'}
              </button>
              <button onClick={() => setShowForm(false)} className="border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
                Batal
              </button>
            </div>
          </div>
        )}

        {inv.pembayaran.length === 0 ? (
          <p className="px-5 py-6 text-center text-gray-400 text-sm">Belum ada pembayaran</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-bgn-200">
              <tr>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Tanggal</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Metode</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Jumlah</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Catatan</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bgn-100">
              {inv.pembayaran.map((p) => (
                <tr key={p.id} className="odd:bg-white even:bg-bgn-50">
                  <td className="px-4 py-3 text-gray-700">{p.tanggalBayar}</td>
                  <td className="px-4 py-3 text-gray-600">{p.metodeBayar}</td>
                  <td className="px-4 py-3 font-medium text-bgn-green-700">{formatRp(p.jumlah)}</td>
                  <td className="px-4 py-3 text-gray-500">{p.catatan ?? '-'}</td>
                  <td className="px-4 py-3 text-right">
                    {inv.status !== 'PAID' && (
                      <button onClick={() => { if (confirm('Batalkan pembayaran ini?')) batalMutation.mutate(p.id) }}
                        className="text-red-500 hover:underline text-xs">
                        Batalkan
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
