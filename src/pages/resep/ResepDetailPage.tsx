import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { resepApi } from '@/api/endpoints/resep'
import { bahanBakuApi } from '@/api/endpoints/bahan-baku'
import { getErrorMessage } from '@/utils/error'

export function ResepDetailPage() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const [showItemForm, setShowItemForm] = useState(false)
  const [itemBahan, setItemBahan] = useState('')
  const [itemJumlah, setItemJumlah] = useState('')
  const [itemCatatan, setItemCatatan] = useState('')
  const [previewPorsi, setPreviewPorsi] = useState('')
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['resep', id],
    queryFn: () => resepApi.getOne(id!),
    enabled: !!id,
  })

  const { data: bahanList } = useQuery({
    queryKey: ['bahan-baku', 'all'],
    queryFn: () => bahanBakuApi.list({ limit: 200 }),
  })

  const { data: previewData, refetch: refetchPreview } = useQuery({
    queryKey: ['resep-kebutuhan', id, previewPorsi],
    queryFn: () => resepApi.kebutuhan(id!, parseInt(previewPorsi)),
    enabled: false,
  })

  const addItemMutation = useMutation({
    mutationFn: () => resepApi.addItem(id!, { bahanBakuId: itemBahan, jumlahPerPorsi: parseFloat(itemJumlah), catatan: itemCatatan || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['resep', id] }); setShowItemForm(false); setItemBahan(''); setItemJumlah(''); setItemCatatan('') },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => resepApi.removeItem(id!, itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resep', id] }),
  })

  if (isLoading) return <p className="text-gray-500">Memuat...</p>
  const resep = data?.data.data
  if (!resep) return <p className="text-red-500">Data tidak ditemukan</p>

  const bahanOptions = bahanList?.data.data ?? []
  const preview = previewData?.data.data

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/resep" className="text-bgn-800 hover:underline text-sm">← Resep</Link>
        <span className="text-gray-400">/</span>
        <h1 className="text-2xl font-bold text-bgn-900">{resep.nama}</h1>
        <span className="text-xs px-2 py-0.5 rounded bg-bgn-100 text-bgn-800">{resep.jenisPenerima.replace('_','/')}</span>
        <span className={`text-xs px-2 py-0.5 rounded ${resep.isActive ? 'bg-bgn-green-100 text-bgn-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {resep.isActive ? 'Aktif' : 'Nonaktif'}
        </span>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}

      {resep.deskripsi && <p className="text-gray-600 text-sm mb-4">{resep.deskripsi}</p>}

      <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden mb-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-bgn-100">
          <h2 className="font-semibold text-bgn-900">Komposisi Bahan (per 1 porsi)</h2>
          <button onClick={() => setShowItemForm(!showItemForm)}
            className="bg-bgn-green-400 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-bgn-green-500">
            + Tambah Bahan
          </button>
        </div>

        {showItemForm && (
          <div className="p-4 border-b border-bgn-100 bg-bgn-50">
            <div className="flex gap-2 mb-2">
              <select value={itemBahan} onChange={(e) => setItemBahan(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none">
                <option value="">-- Pilih Bahan --</option>
                {bahanOptions.map(b => <option key={b.id} value={b.id}>{b.nama} ({b.satuan})</option>)}
              </select>
              <input type="number" value={itemJumlah} onChange={(e) => setItemJumlah(e.target.value)}
                placeholder="Jumlah/porsi" step="0.001"
                className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
              <input type="text" value={itemCatatan} onChange={(e) => setItemCatatan(e.target.value)}
                placeholder="Catatan (opsional)"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => addItemMutation.mutate()} disabled={!itemBahan || !itemJumlah || addItemMutation.isPending}
                className="bg-bgn-green-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-bgn-green-500 disabled:opacity-50">Simpan</button>
              <button onClick={() => setShowItemForm(false)} className="border border-gray-300 px-4 py-2 rounded-lg text-sm">Batal</button>
            </div>
          </div>
        )}

        {resep.items.length === 0 ? (
          <p className="px-5 py-8 text-center text-gray-400 text-sm">Belum ada bahan ditambahkan</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-bgn-200">
              <tr>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Bahan Baku</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Jumlah/Porsi</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Catatan</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bgn-100">
              {resep.items.map(item => (
                <tr key={item.id} className="odd:bg-white even:bg-bgn-50">
                  <td className="px-4 py-3 text-gray-800">{item.bahanBaku?.nama ?? item.bahanBakuId}</td>
                  <td className="px-4 py-3 text-gray-700">{item.jumlahPerPorsi} {item.bahanBaku?.satuan ?? ''}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{item.catatan ?? '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { if (confirm('Hapus bahan dari resep?')) removeItemMutation.mutate(item.id) }}
                      className="text-red-500 hover:underline text-xs">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {resep.items.length > 0 && (
        <div className="bg-white rounded-xl shadow-md border border-bgn-100 p-5">
          <h2 className="font-semibold text-bgn-900 mb-3">Preview Kebutuhan Bahan</h2>
          <div className="flex gap-2 mb-3">
            <input type="number" value={previewPorsi} onChange={(e) => setPreviewPorsi(e.target.value)}
              placeholder="Jumlah porsi" className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
            <button onClick={() => void refetchPreview()} disabled={!previewPorsi}
              className="bg-bgn-green-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-bgn-green-500 disabled:opacity-50">
              Hitung
            </button>
          </div>
          {preview && (
            <div>
              <div className={`text-sm mb-2 font-medium ${preview.semuaCukup ? 'text-bgn-green-700' : 'text-red-600'}`}>
                {preview.semuaCukup ? '✓ Stok mencukupi untuk semua bahan' : '✗ Ada bahan yang stoknya tidak cukup'}
              </div>
              <div className="space-y-1">
                {preview.items.map(item => (
                  <div key={item.bahanBakuId} className={`flex justify-between text-sm px-3 py-1.5 rounded ${item.cukup ? 'bg-bgn-green-50' : 'bg-red-50'}`}>
                    <span className={item.cukup ? 'text-gray-700' : 'text-red-700 font-medium'}>{item.nama}</span>
                    <span className={`text-xs ${item.cukup ? 'text-gray-500' : 'text-red-600'}`}>
                      Butuh: {item.kebutuhan} {item.satuan} | Stok: {item.stokTersedia} {item.satuan}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
