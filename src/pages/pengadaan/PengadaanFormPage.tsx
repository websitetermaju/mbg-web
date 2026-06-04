import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pengadaanApi } from '@/api/endpoints/pengadaan'

interface ItemForm {
  bahanBakuId: string
  jumlah: number
  hargaSatuan: number
}

interface FormData {
  nomorPo: string
  tanggal: string
  supplier: string
  catatan: string
  items: ItemForm[]
}

export function PengadaanFormPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      nomorPo: '',
      tanggal: '',
      supplier: '',
      catatan: '',
      items: [{ bahanBakuId: '', jumlah: 1, hargaSatuan: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })

  const itemsWatch = watch('items')

  const totalNilai =
    itemsWatch?.reduce((sum, item) => {
      return sum + Number(item.jumlah) * Number(item.hargaSatuan)
    }, 0) ?? 0

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      pengadaanApi.create({
        ...data,
        items: data.items.map((i) => ({
          bahanBakuId: i.bahanBakuId,
          jumlah: Number(i.jumlah),
          hargaSatuan: Number(i.hargaSatuan),
        })),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pengadaan'] })
      navigate('/pengadaan')
    },
  })

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Buat Purchase Order</h1>
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
        {/* Info PO */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-700">Informasi PO</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor PO</label>
              <input
                {...register('nomorPo', { required: true })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-green-400 focus:outline-none"
              />
              {errors.nomorPo && <p className="text-red-500 text-xs mt-1">Wajib diisi</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
              <input
                type="date"
                {...register('tanggal', { required: true })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-green-400 focus:outline-none"
              />
              {errors.tanggal && <p className="text-red-500 text-xs mt-1">Wajib diisi</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
            <input
              {...register('supplier', { required: true })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-green-400 focus:outline-none"
            />
            {errors.supplier && <p className="text-red-500 text-xs mt-1">Wajib diisi</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catatan (opsional)
            </label>
            <textarea
              {...register('catatan')}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-green-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700">Item Pengadaan</h2>
            <button
              type="button"
              onClick={() => append({ bahanBakuId: '', jumlah: 1, hargaSatuan: 0 })}
              className="text-bgn-800 text-sm hover:underline"
            >
              + Tambah Item
            </button>
          </div>
          <div className="space-y-3">
            {fields.map((field, idx) => (
              <div
                key={field.id}
                className="grid grid-cols-[1fr_100px_120px_36px] gap-2 items-start"
              >
                <div>
                  <label className="block text-xs text-gray-500 mb-1">ID Bahan Baku</label>
                  <input
                    {...register(`items.${idx}.bahanBakuId`, { required: true })}
                    placeholder="UUID bahan baku"
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Jumlah</label>
                  <input
                    type="number"
                    min={1}
                    {...register(`items.${idx}.jumlah`, { required: true, min: 1 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Harga Satuan</label>
                  <input
                    type="number"
                    min={0}
                    {...register(`items.${idx}.hargaSatuan`, { required: true, min: 0 })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none"
                  />
                </div>
                <div className="pt-5">
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    disabled={fields.length === 1}
                    className="text-red-400 hover:text-red-600 disabled:opacity-30 text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-right">
            <p className="text-sm text-gray-500">Total Nilai PO</p>
            <p className="text-xl font-bold text-gray-800">
              Rp {totalNilai.toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        {mutation.error && (
          <p className="text-red-500 text-sm">
            {String(
              (mutation.error as { response?: { data?: { message?: string } } }).response?.data
                ?.message ?? 'Terjadi kesalahan',
            )}
          </p>
        )}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-bgn-green-400 text-white px-6 py-2 rounded-lg hover:bg-bgn-green-500 disabled:opacity-50"
          >
            {mutation.isPending ? 'Menyimpan...' : 'Buat PO'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/pengadaan')}
            className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}
