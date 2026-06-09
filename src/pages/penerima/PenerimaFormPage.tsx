import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { penerimaApi } from '@/api/endpoints/penerima'
import { getErrorMessage } from '@/utils/error'
import { useState } from 'react'
import type { JenisKelamin, JenjangPendidikan, StatusPenerima } from '@/types'

export function PenerimaFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    nama: '', nik: '', tanggalLahir: '', jenisKelamin: 'L' as JenisKelamin,
    alamat: '', institusi: '', jenjang: 'SD' as JenjangPendidikan, kelas: '',
    status: 'AKTIF' as StatusPenerima,
  })

  const { isLoading: loadingExisting } = useQuery({
    queryKey: ['penerima', id],
    queryFn: () => penerimaApi.getOne(id!),
    enabled: isEdit,
    select: (res) => {
      const d = res.data.data
      setForm({
        nama: d.nama, nik: d.nik,
        tanggalLahir: d.tanggalLahir ? d.tanggalLahir.slice(0, 10) : '',
        jenisKelamin: d.jenisKelamin, alamat: d.alamat,
        institusi: d.institusi, jenjang: d.jenjang,
        kelas: d.kelas ?? '', status: d.status,
      })
      return res.data.data
    },
  })

  const mutation = useMutation({
    mutationFn: (data: typeof form) => {
      const payload = {
        ...data,
        kelas: data.kelas || null,
      }
      return isEdit ? penerimaApi.update(id!, payload) : penerimaApi.create(payload)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['penerima'] }); navigate('/penerima') },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))
  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none"
  const labelCls = "block text-sm font-medium text-gray-700 mb-1"

  if (isEdit && loadingExisting) return <p className="text-gray-500">Memuat...</p>

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-bgn-900 mb-6">{isEdit ? 'Edit Penerima' : 'Tambah Penerima'}</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form) }} className="space-y-5">
        <div className="bg-white rounded-xl border border-bgn-100 p-5 shadow-md space-y-3">
          <h2 className="font-semibold text-bgn-900 text-sm uppercase tracking-wide">Data Pribadi</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className={labelCls}>Nama *</label>
              <input value={form.nama} onChange={(e) => set('nama', e.target.value)} required className={inputCls} /></div>
            <div><label className={labelCls}>NIK *</label>
              <input value={form.nik} onChange={(e) => set('nik', e.target.value)} required maxLength={16} className={inputCls} /></div>
            <div><label className={labelCls}>Tanggal Lahir *</label>
              <input type="date" value={form.tanggalLahir} onChange={(e) => set('tanggalLahir', e.target.value)} required className={inputCls} /></div>
            <div><label className={labelCls}>Jenis Kelamin *</label>
              <select value={form.jenisKelamin} onChange={(e) => set('jenisKelamin', e.target.value)} className={inputCls}>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select></div>
            <div className="col-span-2"><label className={labelCls}>Alamat *</label>
              <textarea value={form.alamat} onChange={(e) => set('alamat', e.target.value)} required rows={2} className={inputCls} /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-bgn-100 p-5 shadow-md space-y-3">
          <h2 className="font-semibold text-bgn-900 text-sm uppercase tracking-wide">Pendidikan</h2>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Institusi *</label>
              <input value={form.institusi} onChange={(e) => set('institusi', e.target.value)} required className={inputCls} /></div>
            <div><label className={labelCls}>Jenjang *</label>
              <select value={form.jenjang} onChange={(e) => set('jenjang', e.target.value)} className={inputCls}>
                {(['TK', 'SD', 'SMP', 'SMA'] as JenjangPendidikan[]).map(v => <option key={v} value={v}>{v}</option>)}</select></div>
            <div><label className={labelCls}>Kelas</label>
              <input value={form.kelas} onChange={(e) => set('kelas', e.target.value)} placeholder="Opsional" className={inputCls} /></div>
            <div><label className={labelCls}>Status *</label>
              <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputCls}>
                <option value="AKTIF">Aktif</option>
                <option value="NONAKTIF">Nonaktif</option>
              </select></div>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={mutation.isPending}
            className="bg-bgn-green-400 text-white px-6 py-2 rounded-lg hover:bg-bgn-green-500 disabled:opacity-50">
            {mutation.isPending ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Penerima'}
          </button>
          <button type="button" onClick={() => navigate('/penerima')}
            className="border border-bgn-900 text-bgn-900 px-6 py-2 rounded-lg hover:bg-bgn-50">Batal</button>
        </div>
      </form>
    </div>
  )
}