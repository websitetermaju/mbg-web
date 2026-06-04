import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { menuApi } from '@/api/endpoints/menu'
import { getErrorMessage } from '@/utils/error'
import type { JenisPenerima } from '@/types'

interface FormData {
  namaMenu: string
  tanggal: string
  jenisPenerima: JenisPenerima
  jumlahPorsi: number
  kalori: number
  protein: number
  karbohidrat: number
  lemak: number
}

const JENIS_PENERIMA: JenisPenerima[] = ['BALITA', 'SD', 'SMP_SMA', 'IBU_HAMIL', 'LANSIA']

export function MenuFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id
  const qc = useQueryClient()

  const { data: existing } = useQuery({
    queryKey: ['menu', id],
    queryFn: () => menuApi.getOne(id!),
    enabled: isEdit,
  })

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    values: existing?.data.data
      ? {
          namaMenu: existing.data.data.namaMenu,
          tanggal: existing.data.data.tanggal,
          jenisPenerima: existing.data.data.jenisPenerima,
          jumlahPorsi: existing.data.data.jumlahPorsi,
          kalori: existing.data.data.kalori,
          protein: existing.data.data.protein,
          karbohidrat: existing.data.data.karbohidrat,
          lemak: existing.data.data.lemak,
        }
      : undefined,
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      isEdit ? menuApi.update(id!, data) : menuApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['menu'] })
      navigate('/menu')
    },
  })

  const onSubmit = (data: FormData) => mutation.mutate(data)

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{isEdit ? 'Edit' : 'Buat'} Menu Harian</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nama Menu</label>
          <input {...register('namaMenu', { required: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-600 focus:outline-none" />
          {errors.namaMenu && <p className="text-red-500 text-xs mt-1">Wajib diisi</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
            <input type="date" {...register('tanggal', { required: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-600 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Penerima</label>
            <select {...register('jenisPenerima', { required: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-600 focus:outline-none">
              {JENIS_PENERIMA.map((j) => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Porsi</label>
          <input type="number" {...register('jumlahPorsi', { required: true, min: 1 })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-600 focus:outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {(['kalori', 'protein', 'karbohidrat', 'lemak'] as const).map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">{field} {field === 'kalori' ? '(kkal)' : '(g)'}</label>
              <input type="number" step="0.1" {...register(field, { required: true, min: 0 })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-600 focus:outline-none" />
            </div>
          ))}
        </div>
        {mutation.error && (
          <p className="text-red-500 text-sm">{getErrorMessage(mutation.error)}</p>
        )}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={mutation.isPending} className="bg-bgn-900 text-white px-6 py-2 rounded-lg hover:bg-bgn-900 disabled:opacity-50">
            {mutation.isPending ? 'Menyimpan...' : 'Simpan'}
          </button>
          <button type="button" onClick={() => navigate('/menu')} className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50">
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}
