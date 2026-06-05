import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { pengadaanApi } from '@/api/endpoints/pengadaan'
import { invoiceApi } from '@/api/endpoints/invoice'
import { StatusBadge } from '@/components/StatusBadge'
import { getErrorMessage } from '@/utils/error'

export function PengadaanDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [jumlahDiterima, setJumlahDiterima] = useState<Record<string, number>>({})

  const { data, isLoading } = useQuery({
    queryKey: ['pengadaan', id],
    queryFn: () => pengadaanApi.getOne(id!),
    enabled: !!id,
  })

  const { data: invoiceData } = useQuery({
    queryKey: ['invoice', 'by-po', id],
    queryFn: () => invoiceApi.list({ pengadaanId: id! }),
    enabled: !!id,
  })
  const invoice = invoiceData?.data.data?.[0]

  const terimaMutation = useMutation({
    mutationFn: () =>
      pengadaanApi.terima(
        id!,
        Object.entries(jumlahDiterima).map(([pengadaanItemId, jumlahDiterima]) => ({
          pengadaanItemId,
          jumlahDiterima,
        })),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pengadaan'] })
      navigate('/pengadaan')
    },
  })

  const cancelMutation = useMutation({
    mutationFn: () => pengadaanApi.cancel(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pengadaan'] })
      navigate('/pengadaan')
    },
  })

  if (isLoading) return <p className="text-gray-500">Memuat...</p>

  const po = data?.data.data
  if (!po) return <p className="text-red-500">Data tidak ditemukan</p>

  const isOrdered = po.status === 'ORDERED'

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Detail PO — {po.nomorPo}</h1>
          <p className="text-gray-500 text-sm mt-1">{po.supplier} · {po.tanggal}</p>
        </div>
        <StatusBadge status={po.status} />
      </div>

      {/* Link PR sumber */}
      {po.permintaanPembelianId && (
        <div className="text-sm text-gray-600 mb-2">
          📋 Dari PR:{' '}
          <Link to={`/permintaan-pembelian/${po.permintaanPembelianId}`} className="text-bgn-800 hover:underline font-medium">
            Lihat Permintaan Pembelian
          </Link>
        </div>
      )}
      {/* Link Invoice */}
      {invoice && (
        <div className="text-sm text-gray-600 mb-4">
          🧾 Invoice:{' '}
          <Link to={`/invoice/${invoice.id}`} className="text-bgn-800 hover:underline font-medium">
            {invoice.nomorInvoice}
          </Link>
          {' — '}
          <span className={invoice.status === 'OVERDUE' ? 'text-red-600 font-semibold' : invoice.status === 'PAID' ? 'text-bgn-green-700' : 'text-orange-600'}>
            {invoice.status}
          </span>
          {' '}
          <span className="text-gray-500">Rp {Number(invoice.totalDibayar).toLocaleString('id-ID')} / {Number(invoice.totalTagihan).toLocaleString('id-ID')}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead className="bg-bgn-200">
            <tr>
              <th className="text-left px-4 py-3 text-bgn-900 font-semibold">ID Bahan Baku</th>
              <th className="text-right px-4 py-3 text-bgn-900 font-semibold">Jumlah</th>
              <th className="text-right px-4 py-3 text-bgn-900 font-semibold">Harga Satuan</th>
              <th className="text-right px-4 py-3 text-bgn-900 font-semibold">Subtotal</th>
              {isOrdered && (
                <th className="text-right px-4 py-3 text-bgn-900 font-semibold">Diterima</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-bgn-100">
            {po.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-gray-600 font-mono text-xs">{item.bahanBakuId}</td>
                <td className="px-4 py-3 text-gray-600 text-right">{item.jumlah}</td>
                <td className="px-4 py-3 text-gray-600 text-right">Rp {item.hargaSatuan.toLocaleString('id-ID')}</td>
                <td className="px-4 py-3 text-gray-600 text-right">Rp {item.subtotal.toLocaleString('id-ID')}</td>
                {isOrdered && (
                  <td className="px-4 py-3 text-right">
                    <input
                      type="number"
                      min={0}
                      max={item.jumlah}
                      defaultValue={item.jumlah}
                      onChange={(e) =>
                        setJumlahDiterima((prev) => ({
                          ...prev,
                          [item.id]: Number(e.target.value),
                        }))
                      }
                      className="w-20 border border-gray-300 rounded px-2 py-1 text-right focus:ring-2 focus:ring-bgn-green-400 focus:outline-none"
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex items-center justify-between">
        <span className="text-gray-600">Total Nilai PO</span>
        <span className="text-xl font-bold text-gray-800">Rp {po.totalNilai.toLocaleString('id-ID')}</span>
      </div>

      {po.catatan && (
        <p className="text-sm text-gray-500 mb-6">Catatan: {po.catatan}</p>
      )}

      <div className="flex gap-3">
        {isOrdered && (
          <button
            onClick={() => terimaMutation.mutate()}
            disabled={terimaMutation.isPending}
            className="bg-bgn-green-400 text-white px-6 py-2 rounded-lg hover:bg-bgn-green-500 disabled:opacity-50"
          >
            {terimaMutation.isPending ? 'Memproses...' : 'Konfirmasi Terima Barang'}
          </button>
        )}
        {(po.status === 'DRAFT' || po.status === 'APPROVED') && (
          <button
            onClick={() => { if (confirm('Batalkan PO ini?')) cancelMutation.mutate() }}
            disabled={cancelMutation.isPending}
            className="border border-red-300 text-red-600 px-6 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
          >
            Batalkan PO
          </button>
        )}
        <button
          onClick={() => navigate('/pengadaan')}
          className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50"
        >
          Kembali
        </button>
      </div>

      {terimaMutation.error && (
        <p className="text-red-500 text-sm mt-3">{getErrorMessage(terimaMutation.error)}</p>
      )}
    </div>
  )
}
