import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { produksiApi } from '@/api/endpoints/produksi'
import { getErrorMessage } from '@/utils/error'

interface FormData {
  menuId: string
  tanggal: string
  catatan: string
}

export function ProduksiFormPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: { menuId: '', tanggal: '', catatan: '' },
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      produksiApi.create({
        menuId: data.menuId,
        tanggal: data.tanggal,
        catatan: data.catatan || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['produksi'] })
      navigate('/produksi')
    },
  })

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Buat Produksi</h1>
      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Menu ID</label>
          <input
            {...register('menuId', { required: true })}
            placeholder="UUID menu harian"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-green-400 focus:outline-none font-mono text-sm"
          />
          {errors.menuId && <p className="text-red-500 text-xs mt-1">Wajib diisi</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Produksi</label>
          <input
            type="date"
            {...register('tanggal', { required: true })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-green-400 focus:outline-none"
          />
          {errors.tanggal && <p className="text-red-500 text-xs mt-1">Wajib diisi</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (opsional)</label>
          <textarea
            {...register('catatan')}
            rows={3}
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
            {mutation.isPending ? 'Menyimpan...' : 'Buat Produksi'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/produksi')}
            className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}
