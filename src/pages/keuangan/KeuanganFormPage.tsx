import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { keuanganApi } from '@/api/endpoints/keuangan'
import { getErrorMessage } from '@/utils/error'
import type { JenisTransaksi, Keuangan } from '@/types'

interface FormData {
  tanggal: string
  jenisTransaksi: JenisTransaksi
  kategori: string
  jumlah: number
  keterangan: string
  referensi: string
}

const KATEGORI_KEUANGAN = [
  'Pembelian Bahan Baku',
  'Gaji Karyawan',
  'Listrik & Air',
  'Transportasi',
  'Peralatan',
  'Dana BGN',
  'Lainnya',
]

export function KeuanganFormPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      tanggal: new Date().toISOString().slice(0, 10),
      jenisTransaksi: 'PENGELUARAN',
      kategori: 'Pembelian Bahan Baku',
      jumlah: 0,
      keterangan: '',
      referensi: '',
    },
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      keuanganApi.create({
        ...data,
        jumlah: Number(data.jumlah),
        keterangan: data.keterangan || null,
        referensi: data.referensi || null,
      } as Partial<Keuangan>),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['keuangan'] })
      navigate('/keuangan')
    },
  })

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Catat Transaksi</h1>
      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
            <input type="date" {...register('tanggal', { required: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-600 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis</label>
            <select {...register('jenisTransaksi')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-600 focus:outline-none">
              <option value="PENGELUARAN">Pengeluaran</option>
              <option value="PEMASUKAN">Pemasukan</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
          <select {...register('kategori')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-600 focus:outline-none">
            {KATEGORI_KEUANGAN.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp)</label>
          <input type="number" min={0} {...register('jumlah', { required: true, min: 0 })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-600 focus:outline-none" />
          {errors.jumlah && <p className="text-red-500 text-xs mt-1">Wajib diisi</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan (opsional)</label>
          <input {...register('keterangan')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-600 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Referensi (No. PO / dll)</label>
          <input {...register('referensi')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-600 focus:outline-none" />
        </div>
        {mutation.error && (
          <p className="text-red-500 text-sm">{getErrorMessage(mutation.error)}</p>
        )}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={mutation.isPending} className="bg-bgn-900 text-white px-6 py-2 rounded-lg hover:bg-bgn-900 disabled:opacity-50">
            {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button type="button" onClick={() => navigate('/keuangan')} className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50">Batal</button>
        </div>
      </form>
    </div>
  )
}
