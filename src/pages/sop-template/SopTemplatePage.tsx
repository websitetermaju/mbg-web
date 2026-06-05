import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sopApi } from '@/api/endpoints/sop'
import { getErrorMessage } from '@/utils/error'

export function SopTemplatePage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [namaTahap, setNamaTahap] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [urutan, setUrutan] = useState('')
  const [estimasi, setEstimasi] = useState('')
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['sop-template'],
    queryFn: sopApi.listTemplate,
  })

  const saveMutation = useMutation({
    mutationFn: () => editId
      ? sopApi.updateTemplate(editId, {
          namaTahap, deskripsi: deskripsi || undefined,
          urutan: urutan ? parseInt(urutan) : undefined,
          estimasiMenit: estimasi ? parseInt(estimasi) : undefined,
        })
      : sopApi.createTemplate({
          namaTahap, deskripsi: deskripsi || undefined,
          urutan: urutan ? parseInt(urutan) : undefined,
          estimasiMenit: estimasi ? parseInt(estimasi) : undefined,
        }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sop-template'] })
      setShowForm(false); setEditId(null); setNamaTahap(''); setDeskripsi(''); setUrutan(''); setEstimasi('')
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: sopApi.deleteTemplate,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sop-template'] }),
  })

  const openEdit = (item: { id: string; namaTahap: string; deskripsi: string | null; urutan: number; estimasiMenit: number | null }) => {
    setEditId(item.id); setNamaTahap(item.namaTahap); setDeskripsi(item.deskripsi ?? '')
    setUrutan(String(item.urutan)); setEstimasi(item.estimasiMenit?.toString() ?? '')
    setShowForm(true)
  }

  const items = data?.data.data ?? []
  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none"

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-bgn-900">Template SOP Dapur</h1>
          <p className="text-gray-500 text-sm mt-1">Tahapan ini diinisialisasi otomatis saat produksi dimulai</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setNamaTahap(''); setDeskripsi(''); setUrutan(''); setEstimasi('') }}
          className="bg-bgn-green-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-bgn-green-500">
          + Tambah Tahapan
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}

      {showForm && (
        <div className="bg-white rounded-xl border border-bgn-200 p-5 shadow-md mb-4">
          <h3 className="font-semibold text-bgn-900 mb-3">{editId ? 'Edit Tahapan' : 'Tambah Tahapan Baru'}</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="col-span-2"><label className="block text-xs font-medium text-gray-700 mb-1">Nama Tahapan *</label>
              <input value={namaTahap} onChange={(e) => setNamaTahap(e.target.value)} placeholder="Pengolahan Lauk Hewani" className={inputCls} /></div>
            <div className="col-span-2"><label className="block text-xs font-medium text-gray-700 mb-1">Deskripsi (opsional)</label>
              <textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows={2} placeholder="Petunjuk detail..." className={inputCls} /></div>
            <div><label className="block text-xs font-medium text-gray-700 mb-1">Urutan</label>
              <input type="number" value={urutan} onChange={(e) => setUrutan(e.target.value)} placeholder="0" className={inputCls} /></div>
            <div><label className="block text-xs font-medium text-gray-700 mb-1">Estimasi (menit)</label>
              <input type="number" value={estimasi} onChange={(e) => setEstimasi(e.target.value)} placeholder="30" className={inputCls} /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => saveMutation.mutate()} disabled={!namaTahap || saveMutation.isPending}
              className="bg-bgn-green-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-bgn-green-500 disabled:opacity-50">
              {saveMutation.isPending ? 'Menyimpan...' : editId ? 'Simpan' : 'Tambah'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null) }} className="border border-gray-300 px-4 py-2 rounded-lg text-sm">Batal</button>
          </div>
        </div>
      )}

      {isLoading ? <p className="text-gray-500">Memuat...</p> : (
        <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bgn-200">
              <tr>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold w-10">#</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Nama Tahapan</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Estimasi</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bgn-100">
              {items.map(item => (
                <tr key={item.id} className="odd:bg-white even:bg-bgn-50">
                  <td className="px-4 py-3 text-gray-500 text-xs">{item.urutan}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-bgn-900">{item.namaTahap}</p>
                    {item.deskripsi && <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{item.deskripsi}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{item.estimasiMenit ? `${item.estimasiMenit} mnt` : '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(item)} className="text-bgn-800 hover:underline text-xs">Edit</button>
                      <button onClick={() => { if (confirm('Hapus tahapan?')) deleteMutation.mutate(item.id) }}
                        className="text-red-500 hover:underline text-xs">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Belum ada template SOP. Tambah tahapan untuk mulai.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
