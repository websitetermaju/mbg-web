import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bahanBakuApi } from '@/api/endpoints/bahan-baku'
import type { KategoriBahan } from '@/types'

interface FormData {
  nama: string
  satuan: string
  kategori: KategoriBahan
  stokAwal: number
  stokMinimum: number
  hargaSatuan: number
}

const KATEGORI_OPTIONS: KategoriBahan[] = ['PROTEIN', 'KARBOHIDRAT', 'SAYURAN', 'BUMBU', 'MINYAK', 'LAINNYA']

export function BahanBakuFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const qc = useQueryClient()

  const { data: existing } = useQuery({
    queryKey: ['bahan-baku', id],
    queryFn: () => bahanBakuApi.getOne(id!),
    enabled: isEdit,
  })

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    values: existing?.data.data
      ? {
          nama: existing.data.data.nama,
          satuan: existing.data.data.satuan,
          kategori: existing.data.data.kategori,
          stokAwal: existing.data.data.stokAwal,
          stokMinimum: existing.data.data.stokMinimum,
          hargaSatuan: existing.data.data.hargaSatuan,
        }
      : undefined,
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEdit ? bahanBakuApi.update(id!, data) : bahanBakuApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bahan-baku'] })
      navigate('/bahan-baku')
    },
  })

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{isEdit ? 'Edit' : 'Tambah'} Bahan Baku</h1>
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bahan</label>
          <input {...register('nama', { required: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none" />
          {errors.nama && <p className="text-red-500 text-xs mt-1">Wajib diisi</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Satuan</label>
            <input {...register('satuan', { required: true })} placeholder="kg, liter, pcs" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none" />
            {errors.satuan && <p className="text-red-500 text-xs mt-1">Wajib diisi</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            <select {...register('kategori', { required: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none">
              {KATEGORI_OPTIONS.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stok Awal</label>
            <input type="number" min={0} {...register('stokAwal', { required: true, min: 0 })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stok Minimum</label>
            <input type="number" min={0} {...register('stokMinimum', { required: true, min: 0 })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Harga/Satuan</label>
            <input type="number" min={0} {...register('hargaSatuan', { required: true, min: 0 })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:outline-none" />
          </div>
        </div>
        {mutation.error && (
          <p className="text-red-500 text-sm">{String((mutation.error as any).response?.data?.message ?? 'Terjadi kesalahan')}</p>
        )}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={mutation.isPending} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">
            {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button type="button" onClick={() => navigate('/bahan-baku')} className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50">
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}
