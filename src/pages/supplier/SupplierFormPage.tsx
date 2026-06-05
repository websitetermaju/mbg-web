import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supplierApi } from '@/api/endpoints/supplier'
import { getErrorMessage } from '@/utils/error'
import { useState } from 'react'
import type { JenisUsaha, KategoriSupplier, TerminBayar } from '@/types'

export function SupplierFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    nama: '', jenisUsaha: 'CV' as JenisUsaha, npwp: '',
    namaPic: '', telepon: '', email: '', alamat: '', kota: '',
    namaBank: '', noRekening: '', atasNama: '',
    terminBayar: 'COD' as TerminBayar, kategori: 'LAINNYA' as KategoriSupplier,
    minOrder: '', leadTime: '', catatan: '', isActive: true,
  })

  const { isLoading: loadingExisting } = useQuery({
    queryKey: ['supplier', id],
    queryFn: () => supplierApi.getOne(id!),
    enabled: isEdit,
    select: (res) => {
      const d = res.data.data
      setForm({
        nama: d.nama, jenisUsaha: d.jenisUsaha, npwp: d.npwp ?? '',
        namaPic: d.namaPic, telepon: d.telepon, email: d.email ?? '',
        alamat: d.alamat ?? '', kota: d.kota ?? '',
        namaBank: d.namaBank ?? '', noRekening: d.noRekening ?? '', atasNama: d.atasNama ?? '',
        terminBayar: d.terminBayar, kategori: d.kategori,
        minOrder: d.minOrder?.toString() ?? '', leadTime: d.leadTime?.toString() ?? '',
        catatan: d.catatan ?? '', isActive: d.isActive,
      })
      return res.data.data
    },
  })

  const mutation = useMutation({
    mutationFn: (data: typeof form) => {
      const payload = {
        ...data,
        npwp: data.npwp || undefined, email: data.email || undefined,
        alamat: data.alamat || undefined, kota: data.kota || undefined,
        namaBank: data.namaBank || undefined, noRekening: data.noRekening || undefined,
        atasNama: data.atasNama || undefined,
        minOrder: data.minOrder ? parseFloat(data.minOrder) : undefined,
        leadTime: data.leadTime ? parseInt(data.leadTime) : undefined,
        catatan: data.catatan || undefined,
      }
      return isEdit ? supplierApi.update(id!, payload) : supplierApi.create(payload)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['supplier'] }); navigate('/supplier') },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const set = (field: string, value: string | boolean) => setForm(f => ({ ...f, [field]: value }))
  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none"
  const labelCls = "block text-sm font-medium text-gray-700 mb-1"

  if (isEdit && loadingExisting) return <p className="text-gray-500">Memuat...</p>

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-bgn-900 mb-6">{isEdit ? 'Edit Supplier' : 'Tambah Supplier'}</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form) }} className="space-y-5">
        <div className="bg-white rounded-xl border border-bgn-100 p-5 shadow-md space-y-3">
          <h2 className="font-semibold text-bgn-900 text-sm uppercase tracking-wide">Identitas Bisnis</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className={labelCls}>Nama Usaha *</label>
              <input value={form.nama} onChange={(e) => set('nama', e.target.value)} required className={inputCls} /></div>
            <div><label className={labelCls}>Jenis Usaha *</label>
              <select value={form.jenisUsaha} onChange={(e) => set('jenisUsaha', e.target.value)} className={inputCls}>
                {(['PT','CV','KOPERASI','UMKM','PERORANGAN'] as JenisUsaha[]).map(v => <option key={v} value={v}>{v}</option>)}</select></div>
            <div><label className={labelCls}>NPWP</label>
              <input value={form.npwp} onChange={(e) => set('npwp', e.target.value)} placeholder="01.234.567.8" className={inputCls} /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-bgn-100 p-5 shadow-md space-y-3">
          <h2 className="font-semibold text-bgn-900 text-sm uppercase tracking-wide">Kontak</h2>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Nama PIC *</label>
              <input value={form.namaPic} onChange={(e) => set('namaPic', e.target.value)} required className={inputCls} /></div>
            <div><label className={labelCls}>Telepon *</label>
              <input value={form.telepon} onChange={(e) => set('telepon', e.target.value)} required className={inputCls} /></div>
            <div><label className={labelCls}>Email</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Kota</label>
              <input value={form.kota} onChange={(e) => set('kota', e.target.value)} className={inputCls} /></div>
            <div className="col-span-2"><label className={labelCls}>Alamat</label>
              <textarea value={form.alamat} onChange={(e) => set('alamat', e.target.value)} rows={2} className={inputCls} /></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-bgn-100 p-5 shadow-md space-y-3">
          <h2 className="font-semibold text-bgn-900 text-sm uppercase tracking-wide">Keuangan & Operasional</h2>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Kategori *</label>
              <select value={form.kategori} onChange={(e) => set('kategori', e.target.value)} className={inputCls}>
                {['BAHAN_SEGAR','BAHAN_KERING','BUMBU_REMPAH','KEMASAN','LAINNYA'].map(v => <option key={v} value={v}>{v.replace('_',' ')}</option>)}</select></div>
            <div><label className={labelCls}>Termin Bayar *</label>
              <select value={form.terminBayar} onChange={(e) => set('terminBayar', e.target.value)} className={inputCls}>
                {(['COD','NET_7','NET_14','NET_30'] as TerminBayar[]).map(v => <option key={v} value={v}>{v.replace('_',' ')}</option>)}</select></div>
            <div><label className={labelCls}>Bank</label>
              <input value={form.namaBank} onChange={(e) => set('namaBank', e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>No. Rekening</label>
              <input value={form.noRekening} onChange={(e) => set('noRekening', e.target.value)} className={inputCls} /></div>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={mutation.isPending}
            className="bg-bgn-green-400 text-white px-6 py-2 rounded-lg hover:bg-bgn-green-500 disabled:opacity-50">
            {mutation.isPending ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Supplier'}
          </button>
          <button type="button" onClick={() => navigate('/supplier')}
            className="border border-bgn-900 text-bgn-900 px-6 py-2 rounded-lg hover:bg-bgn-50">Batal</button>
        </div>
      </form>
    </div>
  )
}
