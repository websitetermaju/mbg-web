import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { rabApi } from '@/api/endpoints/rab'

const fRp = (n: number) => 'Rp ' + Number(n).toLocaleString('id-ID')
const fQty = (n: number) => Number(n).toLocaleString('id-ID', { maximumFractionDigits: 3 })

export function RabDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [hariAktif, setHariAktif] = useState(0)

  const { data, isLoading } = useQuery({
    queryKey: ['rab', id],
    queryFn: () => rabApi.detail(id!),
    enabled: !!id,
  })

  if (isLoading) return <p className="text-gray-500">Memuat...</p>
  const rab = data?.data.data
  if (!rab) return <p className="text-gray-500">RAB tidak ditemukan.</p>

  const hariList = rab.hari ?? []
  const hari = hariList[hariAktif]

  return (
    <div>
      <div className="mb-4">
        <Link to="/rab" className="text-bgn-600 hover:underline text-sm">&larr; Kembali ke daftar</Link>
      </div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">{rab.label}</h1>

      {/* Ringkasan anggaran */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-bgn-50 border border-bgn-200 rounded-xl p-4">
          <p className="text-sm text-bgn-800">Total anggaran</p>
          <p className="text-lg font-bold text-bgn-900">{fRp(rab.totalAnggaran)}</p>
        </div>
        <div className="bg-bgn-50 border border-bgn-200 rounded-xl p-4">
          <p className="text-sm text-bgn-800">Penggunaan</p>
          <p className="text-lg font-bold text-bgn-900">{fRp(rab.penggunaanAnggaran)}</p>
        </div>
        <div className={`rounded-xl p-4 border ${rab.sisaAnggaran < 0 ? 'bg-red-50 border-red-200' : 'bg-bgn-50 border-bgn-200'}`}>
          <p className={`text-sm ${rab.sisaAnggaran < 0 ? 'text-red-600' : 'text-bgn-800'}`}>Sisa</p>
          <p className={`text-lg font-bold ${rab.sisaAnggaran < 0 ? 'text-red-700' : 'text-bgn-900'}`}>{fRp(rab.sisaAnggaran)}</p>
        </div>
      </div>

      {/* Pemilih hari */}
      <div className="mb-4 flex flex-wrap gap-2">
        {hariList.map((h, i) => (
          <button
            key={h.id}
            onClick={() => setHariAktif(i)}
            className={`px-3 py-1 rounded-full text-sm border transition-colors ${
              i === hariAktif ? 'bg-bgn-green-400 text-white border-bgn-800' : 'border-gray-300 text-gray-600 hover:border-bgn-600'
            }`}
          >
            {h.namaHari}
          </button>
        ))}
      </div>

      {hari && (
        <div className="space-y-6">
          {hari.menu && (
            <div className="bg-white rounded-xl border border-bgn-100 p-4">
              <p className="text-sm text-gray-500 mb-1">Menu</p>
              <p className="text-gray-800">{hari.menu}</p>
            </div>
          )}

          {/* Penerima manfaat */}
          <div className="bg-white rounded-xl shadow-sm border border-bgn-100 overflow-hidden">
            <div className="px-4 py-2 bg-bgn-50 text-bgn-900 font-semibold text-sm">Penerima manfaat</div>
            <table className="w-full text-sm">
              <thead className="bg-bgn-100">
                <tr>
                  <th className="text-left px-4 py-2 text-bgn-900">Kategori</th>
                  <th className="text-right px-4 py-2 text-bgn-900">Porsi</th>
                  <th className="text-right px-4 py-2 text-bgn-900">Harga/porsi</th>
                  <th className="text-right px-4 py-2 text-bgn-900">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bgn-100">
                {hari.penerima.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2 text-gray-700">{p.kategori}</td>
                    <td className="px-4 py-2 text-right text-gray-600">{p.jumlahPorsi.toLocaleString('id-ID')}</td>
                    <td className="px-4 py-2 text-right text-gray-600">{fRp(p.hargaPerPorsi)}</td>
                    <td className="px-4 py-2 text-right text-gray-700 font-medium">{fRp(p.subtotal)}</td>
                  </tr>
                ))}
                {hari.penerima.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-4 text-center text-gray-400">Tidak ada data penerima</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Bahan baku */}
          <div className="bg-white rounded-xl shadow-sm border border-bgn-100 overflow-hidden">
            <div className="px-4 py-2 bg-bgn-50 text-bgn-900 font-semibold text-sm">Bahan baku</div>
            <table className="w-full text-sm">
              <thead className="bg-bgn-100">
                <tr>
                  <th className="text-left px-4 py-2 text-bgn-900">Item</th>
                  <th className="text-right px-4 py-2 text-bgn-900">Qty</th>
                  <th className="text-left px-4 py-2 text-bgn-900">Satuan</th>
                  <th className="text-right px-4 py-2 text-bgn-900">Harga satuan</th>
                  <th className="text-right px-4 py-2 text-bgn-900">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bgn-100">
                {hari.bahan.map((b) => (
                  <tr key={b.id} className="odd:bg-white even:bg-bgn-50">
                    <td className="px-4 py-2 text-gray-700">{b.item}</td>
                    <td className="px-4 py-2 text-right text-gray-600">{fQty(b.qty)}</td>
                    <td className="px-4 py-2 text-gray-600">{b.satuan}</td>
                    <td className="px-4 py-2 text-right text-gray-600">{fRp(b.hargaSatuan)}</td>
                    <td className="px-4 py-2 text-right text-gray-700 font-medium">{fRp(b.totalHs)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-bgn-100 font-semibold">
                  <td className="px-4 py-2 text-bgn-900" colSpan={4}>Total bahan baku</td>
                  <td className="px-4 py-2 text-right text-bgn-900">{fRp(hari.totalBahanBaku)}</td>
                </tr>
                <tr className={hari.sisaAnggaran < 0 ? 'bg-red-50' : ''}>
                  <td className="px-4 py-2 text-gray-700" colSpan={4}>Sisa anggaran hari ini</td>
                  <td className={`px-4 py-2 text-right font-medium ${hari.sisaAnggaran < 0 ? 'text-red-600' : 'text-bgn-800'}`}>{fRp(hari.sisaAnggaran)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
