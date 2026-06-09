import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sekolahApi } from '@/api/endpoints/sekolah'
import { getErrorMessage } from '@/utils/error'
import { useState } from 'react'
import type { KategoriSekolah, StatusSekolah } from '@/types'

const KATEGORI_OPTIONS: { value: KategoriSekolah; label: string }[] = [
  { value: 'TK_PAUD', label: 'TK/PAUD' },
  { value: 'SD_MI', label: 'SD/MI' },
  { value: 'SMP_MTS', label: 'SMP/MTs' },
  { value: 'SMA_MA_SMK', label: 'SMA/MA/SMK' },
  { value: 'POSYANDU', label: 'Posyandu' },
]

export function SekolahFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    nama: '', alamat: '', kabupatenKota: '',
    kategori: 'TK_PAUD' as KategoriSekolah, jumlahPenerima: '0',
    noTelp: '', status: 'AKTIF' as StatusSekolah,
  })

  const { isLoading: loadingExisting } = useQuery({
    queryKey: ['sekolah', id],
    queryFn: () => sekolahApi.getOne(id!),
    enabled: isEdit,
    select: (res) => {
      const d = res.data.data
      setForm({
        nama: d.nama, alamat: d.alamat, kabupatenKota: d.kabupatenKota,
        kategori: d.kategori, jumlahPenerima: d.jumlahPenerima.toString(),
        noTelp: d.noTelp ?? '', status: d.status,
      })
      return res.data.data
    },
  })

  const mutation = useMutation({
    mutationFn: (data: typeof form) => {
      const payload = {
        ...data,
        jumlahPenerima: parseInt(data.jumlahPenerima) || 0,
        noTelp: data.noTelp || undefined,
      }
      return isEdit ? sekolahApi.update(id!, payload) : sekolahApi.create(payload)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sekolah'] }); navigate('/sekolah') },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))
  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none"
  const labelCls = "block text-sm font-medium text-gray-700 mb-1"

  if (isEdit && loadingExisting) return <p className="text-gray-500">Memuat...</p>

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-bgn-900 mb-6">{isEdit ? 'Edit Sekolah' : 'Tambah Sekolah'}</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form) }} className="space-y-5">
        <div className="bg-white rounded-xl border border-bgn-100 p-5 shadow-md space-y-3">
          <h2 className="font-semibold text-bgn-900 text-sm uppercase tracking-wide">Data Sekolah</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className={labelCls}>Nama Sekolah *</label>
              <input value={form.nama} onChange={(e) => set('nama', e.target.value)} required className={inputCls} /></div>
            <div className="col-span-2"><label className={labelCls}>Alamat *</label>
              <textarea value={form.alamat} onChange={(e) => set('alamat', e.target.value)} required rows={2} className={inputCls} /></div>
            <div><label className={labelCls}>Kabupaten/Kota *</label>
              <input value={form.kabupatenKota} onChange={(e) => set('kabupatenKota', e.target.value)} required className={inputCls} /></div>
            <div><label className={labelCls}>Kategori *</label>
              <select value={form.kategori} onChange={(e) => set('kategori', e.target.value)} className={inputCls}>
                {KATEGORI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
            <div><label className={labelCls}>Jumlah Penerima</label>
              <input type="number" value={form.jumlahPenerima} onChange={(e) => set('jumlahPenerima', e.target.value)} min={0} className={inputCls} /></div>
            <div><label className={labelCls}>No. Telepon</label>
              <input value={form.noTelp} onChange={(e) => set('noTelp', e.target.value)} placeholder="Opsional" className={inputCls} /></div>
            <div><label className={labelCls}>Status *</label>
              <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputCls}>
                <option value="AKTIF">Aktif</option>
                <option value="NONAKTIF">Nonaktif</option></select></div>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={mutation.isPending}
            className="bg-bgn-green-400 text-white px-6 py-2 rounded-lg hover:bg-bgn-green-500 disabled:opacity-50">
            {mutation.isPending ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Sekolah'}
          </button>
          <button type="button" onClick={() => navigate('/sekolah')}
            className="border border-bgn-900 text-bgn-900 px-6 py-2 rounded-lg hover:bg-bgn-50">Batal</button>
        </div>
      </form>
    </div>
  )
}