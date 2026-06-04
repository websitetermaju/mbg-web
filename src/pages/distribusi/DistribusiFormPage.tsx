import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { distribusiApi } from '@/api/endpoints/distribusi'
import { getErrorMessage } from '@/utils/error'

interface FormData {
  produksiId: string
  tanggal: string
  jumlahPorsi: number
  keterangan: string
}

export function DistribusiFormPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: { produksiId: '', tanggal: '', jumlahPorsi: 1, keterangan: '' },
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      distribusiApi.create({
        produksiId: data.produksiId,
        tanggal: data.tanggal,
        jumlahPorsi: Number(data.jumlahPorsi),
        keterangan: data.keterangan || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['distribusi'] })
      navigate('/distribusi')
    },
  })

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Buat Distribusi</h1>
      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Produksi ID</label>
          <input
            {...register('produksiId', { required: true })}
            placeholder="UUID produksi"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-green-400 focus:outline-none font-mono text-sm"
          />
          {errors.produksiId && <p className="text-red-500 text-xs mt-1">Wajib diisi</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
            <input
              type="date"
              {...register('tanggal', { required: true })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-green-400 focus:outline-none"
            />
            {errors.tanggal && <p className="text-red-500 text-xs mt-1">Wajib diisi</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Porsi</label>
            <input
              type="number"
              min={1}
              {...register('jumlahPorsi', { required: true, min: 1 })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-green-400 focus:outline-none"
            />
            {errors.jumlahPorsi && <p className="text-red-500 text-xs mt-1">Min 1 porsi</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan (opsional)</label>
          <textarea
            {...register('keterangan')}
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-green-400 focus:outline-none"
          />
        </div>
        {mutation.error && (
          <p className="text-red-500 text-sm">
            {getErrorMessage(mutation.error)}
          </p>
        )}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-bgn-green-400 text-white px-6 py-2 rounded-lg hover:bg-bgn-green-500 disabled:opacity-50"
          >
            {mutation.isPending ? 'Menyimpan...' : 'Buat Distribusi'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/distribusi')}
            className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}
