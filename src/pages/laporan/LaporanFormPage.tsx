import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { laporanApi } from '@/api/endpoints/laporan'
import { getErrorMessage } from '@/utils/error'
import type { JenisLaporan } from '@/types'

interface FormData {
  judul: string
  jenis: JenisLaporan
  periodeMulai: string
  periodeAkhir: string
}

const JENIS_OPTIONS: JenisLaporan[] = ['HARIAN', 'MINGGUAN', 'BULANAN']

export function LaporanFormPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      judul: '',
      jenis: 'BULANAN',
      periodeMulai: '',
      periodeAkhir: '',
    },
  })

  const mutation = useMutation({
    mutationFn: laporanApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['laporan'] })
      navigate('/laporan')
    },
  })

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Generate Laporan</h1>
      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Judul Laporan</label>
          <input {...register('judul', { required: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-600 focus:outline-none" />
          {errors.judul && <p className="text-red-500 text-xs mt-1">Wajib diisi</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Laporan</label>
          <select {...register('jenis')} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-600 focus:outline-none">
            {JENIS_OPTIONS.map((j) => <option key={j} value={j}>{j}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Periode Mulai</label>
            <input type="date" {...register('periodeMulai', { required: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-600 focus:outline-none" />
            {errors.periodeMulai && <p className="text-red-500 text-xs mt-1">Wajib diisi</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Periode Akhir</label>
            <input type="date" {...register('periodeAkhir', { required: true })} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-600 focus:outline-none" />
            {errors.periodeAkhir && <p className="text-red-500 text-xs mt-1">Wajib diisi</p>}
          </div>
        </div>
        {mutation.error && (
          <p className="text-red-500 text-sm">{getErrorMessage(mutation.error)}</p>
        )}
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={mutation.isPending} className="bg-bgn-900 text-white px-6 py-2 rounded-lg hover:bg-bgn-900 disabled:opacity-50">
            {mutation.isPending ? 'Generating...' : 'Generate Laporan'}
          </button>
          <button type="button" onClick={() => navigate('/laporan')} className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50">Batal</button>
        </div>
      </form>
    </div>
  )
}
