import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { prApi } from '@/api/endpoints/permintaan-pembelian'
import { bahanBakuApi } from '@/api/endpoints/bahan-baku'
import { getErrorMessage } from '@/utils/error'

interface PRItemRow { bahanBakuId: string; jumlah: number; keterangan: string }

export function PRFormPage() {
  const navigate = useNavigate()
  const [tanggal, setTanggal] = useState('')
  const [catatan, setCatatan] = useState('')
  const [items, setItems] = useState<PRItemRow[]>([{ bahanBakuId: '', jumlah: 0, keterangan: '' }])
  const [error, setError] = useState('')

  const { data: bahanList } = useQuery({
    queryKey: ['bahan-baku', 'all'],
    queryFn: () => bahanBakuApi.list({ limit: 200 }),
  })

  const mutation = useMutation({
    mutationFn: prApi.create,
    onSuccess: (res) => navigate(`/permintaan-pembelian/${res.data.data.id}`),
    onError: (err) => setError(getErrorMessage(err)),
  })

  const addItem = () => setItems([...items, { bahanBakuId: '', jumlah: 0, keterangan: '' }])
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx))
  const updateItem = (idx: number, field: keyof PRItemRow, value: string | number) => {
    setItems(items.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tanggal) { setError('Tanggal wajib diisi'); return }
    if (items.some(i => !i.bahanBakuId || i.jumlah <= 0)) {
      setError('Semua item harus memiliki bahan baku dan jumlah > 0'); return
    }
    mutation.mutate({ tanggal, catatan: catatan || undefined, items })
  }

  const bahanOptions = bahanList?.data.data ?? []

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-bgn-900 mb-6">Buat Permintaan Pembelian</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-bgn-100 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
          <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (opsional)</label>
          <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Item Bahan Baku</label>
            <button type="button" onClick={addItem} className="text-sm text-bgn-800 hover:underline">+ Tambah Item</button>
          </div>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <select value={item.bahanBakuId} onChange={(e) => updateItem(idx, 'bahanBakuId', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none">
                  <option value="">-- Pilih Bahan --</option>
                  {bahanOptions.map((b) => <option key={b.id} value={b.id}>{b.nama} ({b.satuan})</option>)}
                </select>
                <input type="number" min="0.01" step="0.01" value={item.jumlah || ''}
                  onChange={(e) => updateItem(idx, 'jumlah', parseFloat(e.target.value) || 0)}
                  placeholder="Jumlah" className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
                <input type="text" value={item.keterangan} onChange={(e) => updateItem(idx, 'keterangan', e.target.value)}
                  placeholder="Ket. (opsional)" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(idx)} className="text-red-500 px-2 py-2 text-lg leading-none">×</button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={mutation.isPending}
            className="bg-bgn-green-400 text-white px-6 py-2 rounded-lg hover:bg-bgn-green-500 disabled:opacity-50">
            {mutation.isPending ? 'Menyimpan...' : 'Buat PR'}
          </button>
          <button type="button" onClick={() => navigate('/permintaan-pembelian')}
            className="border border-bgn-900 text-bgn-900 px-6 py-2 rounded-lg hover:bg-bgn-50">
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}
