import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { resepApi } from '@/api/endpoints/resep'
import { getErrorMessage } from '@/utils/error'
import type { JenisPenerima } from '@/types'

const JP_OPTIONS: JenisPenerima[] = ['BALITA', 'SD', 'SMP_SMA', 'IBU_HAMIL', 'LANSIA']

export function ResepFormPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [nama, setNama] = useState('')
  const [jenisPenerima, setJenisPenerima] = useState<JenisPenerima>('SD')
  const [deskripsi, setDeskripsi] = useState('')
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: () => resepApi.create({ nama, jenisPenerima, deskripsi: deskripsi || undefined }),
    onSuccess: (res) => { qc.invalidateQueries({ queryKey: ['resep'] }); navigate(`/resep/${res.data.data.id}`) },
    onError: (err) => setError(getErrorMessage(err)),
  })

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-bgn-900 mb-6">Buat Resep Baru</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate() }} className="bg-white rounded-xl border border-bgn-100 p-6 shadow-md space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Resep *</label>
          <input value={nama} onChange={(e) => setNama(e.target.value)} required placeholder="Nasi Ayam Goreng SD"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Jenis Penerima *</label>
          <select value={jenisPenerima} onChange={(e) => setJenisPenerima(e.target.value as JenisPenerima)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-green-400 focus:outline-none">
            {JP_OPTIONS.map(v => <option key={v} value={v}>{v.replace('_', '/')}</option>)}</select></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi (opsional)</label>
          <textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" /></div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={mutation.isPending}
            className="bg-bgn-green-400 text-white px-6 py-2 rounded-lg hover:bg-bgn-green-500 disabled:opacity-50">
            {mutation.isPending ? 'Menyimpan...' : 'Buat Resep'}
          </button>
          <button type="button" onClick={() => navigate('/resep')}
            className="border border-bgn-900 text-bgn-900 px-6 py-2 rounded-lg hover:bg-bgn-50">Batal</button>
        </div>
      </form>
    </div>
  )
}
