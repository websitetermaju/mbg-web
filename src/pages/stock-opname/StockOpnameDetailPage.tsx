import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { stockOpnameApi } from '@/api/endpoints/stock-opname'
import { getErrorMessage } from '@/utils/error'

export function StockOpnameDetailPage() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editJumlah, setEditJumlah] = useState('')
  const [editCatatan, setEditCatatan] = useState('')
  const [error, setError] = useState('')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['stock-opname', id],
    queryFn: () => stockOpnameApi.getOne(id!),
    enabled: !!id,
  })

  const updateMutation = useMutation({
    mutationFn: (itemId: string) => stockOpnameApi.updateItem(id!, itemId, {
      jumlahFisik: parseFloat(editJumlah),
      catatan: editCatatan || undefined,
    }),
    onSuccess: () => { void refetch(); setEditingId(null) },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const finalizeMutation = useMutation({
    mutationFn: () => stockOpnameApi.finalize(id!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['stock-opname'] }); void refetch() },
    onError: (err) => setError(getErrorMessage(err)),
  })

  if (isLoading) return <p className="text-gray-500">Memuat...</p>
  const opname = data?.data.data
  if (!opname) return <p className="text-red-500">Data tidak ditemukan</p>

  const isDraft = opname.status === 'DRAFT'
  const diisi = opname.items.filter(i => i.jumlahFisik !== null).length
  const totalSelisih = opname.items
    .filter(i => i.jumlahFisik !== null)
    .reduce((sum, i) => sum + (i.selisih ?? 0), 0)

  const startEdit = (item: typeof opname.items[0]) => {
    setEditingId(item.id)
    setEditJumlah(item.jumlahFisik?.toString() ?? '')
    setEditCatatan(item.catatan ?? '')
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/stock-opname" className="text-bgn-800 hover:underline text-sm">&#8592; Stock Opname</Link>
        <span className="text-gray-400">/</span>
        <h1 className="text-2xl font-bold text-bgn-900">Opname {opname.tanggal}</h1>
        <span className={`text-xs px-2 py-0.5 rounded-full ${opname.status === 'FINALIZED' ? 'bg-bgn-green-100 text-bgn-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {opname.status === 'FINALIZED' ? 'Final' : 'Draft'}
        </span>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}

      {/* Summary */}
      <div className="bg-white rounded-xl border border-bgn-100 p-5 shadow-md mb-4">
        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          <div className="p-3 bg-bgn-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Total Bahan</p>
            <p className="font-bold text-bgn-900">{opname.items.length}</p>
          </div>
          <div className="p-3 bg-bgn-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Sudah Diisi</p>
            <p className={`font-bold ${diisi === opname.items.length ? 'text-bgn-green-700' : 'text-orange-600'}`}>{diisi} / {opname.items.length}</p>
          </div>
          <div className="p-3 bg-bgn-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Net Selisih</p>
            <p className={`font-bold ${totalSelisih > 0 ? 'text-bgn-green-700' : totalSelisih < 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {totalSelisih > 0 ? '+' : ''}{totalSelisih.toFixed(3)}
            </p>
          </div>
        </div>
        {opname.catatan && <p className="text-gray-500 text-sm mt-3">{opname.catatan}</p>}
      </div>

      {/* Tabel Items */}
      <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden mb-4">
        <table className="w-full text-sm">
          <thead className="bg-bgn-200">
            <tr>
              <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Nama Bahan</th>
              <th className="text-right px-4 py-3 text-bgn-900 font-semibold">Stok Sistem</th>
              <th className="text-right px-4 py-3 text-bgn-900 font-semibold">Jumlah Fisik</th>
              <th className="text-right px-4 py-3 text-bgn-900 font-semibold">Selisih</th>
              <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Catatan</th>
              {isDraft && <th className="px-4 py-3"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-bgn-100">
            {opname.items.map((item) => (
              <tr key={item.id} className="odd:bg-white even:bg-bgn-50">
                <td className="px-4 py-3 text-gray-800 font-medium">
                  {item.bahanBaku?.nama ?? item.bahanBakuId}
                  <span className="text-xs text-gray-400 ml-1">({item.bahanBaku?.satuan ?? '-'})</span>
                </td>
                <td className="px-4 py-3 text-right text-gray-700">{Number(item.stokSistem).toFixed(3)}</td>
                <td className="px-4 py-3 text-right">
                  {editingId === item.id ? (
                    <input type="number" value={editJumlah} onChange={(e) => setEditJumlah(e.target.value)}
                      step="0.001" min="0" autoFocus
                      className="w-24 border border-bgn-400 rounded px-2 py-1 text-right text-sm focus:outline-none focus:ring-1 focus:ring-bgn-green-400" />
                  ) : (
                    <span className={item.jumlahFisik !== null ? 'text-bgn-900 font-medium' : 'text-gray-300 italic'}>
                      {item.jumlahFisik !== null ? Number(item.jumlahFisik).toFixed(3) : 'belum diisi'}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {item.selisih !== null && item.selisih !== undefined ? (
                    <span className={`font-medium ${item.selisih > 0 ? 'text-bgn-green-600' : item.selisih < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                      {item.selisih > 0 ? '+' : ''}{Number(item.selisih).toFixed(3)}
                    </span>
                  ) : <span className="text-gray-300">-</span>}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {editingId === item.id ? (
                    <input value={editCatatan} onChange={(e) => setEditCatatan(e.target.value)}
                      placeholder="Catatan..." className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none" />
                  ) : (item.catatan ?? '-')}
                </td>
                {isDraft && (
                  <td className="px-4 py-3 text-right">
                    {editingId === item.id ? (
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => updateMutation.mutate(item.id)} disabled={!editJumlah || updateMutation.isPending}
                          className="bg-bgn-green-400 text-white px-2 py-1 rounded text-xs hover:bg-bgn-green-500 disabled:opacity-50">Simpan</button>
                        <button onClick={() => setEditingId(null)} className="border border-gray-300 px-2 py-1 rounded text-xs">Batal</button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(item)} className="text-bgn-800 hover:underline text-xs">
                        {item.jumlahFisik !== null ? 'Edit' : 'Isi'}
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Finalisasi */}
      {isDraft && (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
          <p className="text-sm text-yellow-800 mb-3">
            <strong>Perhatian:</strong> Setelah difinalisasi, opname tidak dapat diubah dan stok akan langsung disesuaikan.
          </p>
          <button onClick={() => { if (confirm('Finalisasi opname dan sesuaikan stok? Tidak dapat diubah kembali.')) finalizeMutation.mutate() }}
            disabled={diisi === 0 || finalizeMutation.isPending}
            className="bg-bgn-900 text-white px-6 py-2 rounded-lg text-sm hover:bg-bgn-800 disabled:opacity-50">
            {finalizeMutation.isPending ? 'Memproses...' : `Finalisasi Opname (${diisi} item)`}
          </button>
        </div>
      )}

      {!isDraft && (
        <div className="bg-bgn-green-50 border border-bgn-green-200 rounded-lg p-4 text-sm text-bgn-green-800">
          Opname difinalisasi pada {opname.finalizedAt ? new Date(opname.finalizedAt).toLocaleString('id-ID') : '-'}. Stok sudah disesuaikan.
        </div>
      )}
    </div>
  )
}
