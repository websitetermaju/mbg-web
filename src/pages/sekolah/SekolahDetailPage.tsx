import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sekolahApi } from '@/api/endpoints/sekolah'
import { StatusBadge } from '@/components/StatusBadge'

const KATEGORI_LABELS: Record<string, string> = {
  TK_PAUD: 'TK/PAUD', SD_MI: 'SD/MI', SMP_MTS: 'SMP/MTs',
  SMA_MA_SMK: 'SMA/MA/SMK', POSYANDU: 'Posyandu',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 mt-0.5">{children}</dd>
    </div>
  )
}

export function SekolahDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['sekolah', id],
    queryFn: () => sekolahApi.getOne(id!),
    enabled: !!id,
  })

  const deleteMutation = useMutation({
    mutationFn: () => sekolahApi.delete(id!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sekolah'] }); navigate('/sekolah') },
  })

  if (isLoading) return <p className="text-gray-500">Memuat...</p>

  const s = data?.data.data
  if (!s) return <p className="text-red-500">Data tidak ditemukan</p>

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-bgn-900">{s.nama}</h1>
          <p className="text-gray-500 text-sm mt-1">{KATEGORI_LABELS[s.kategori] ?? s.kategori}</p>
        </div>
        <StatusBadge status={s.status} />
      </div>
      <div className="bg-white rounded-xl border border-bgn-100 p-5 shadow-md space-y-4">
        <h2 className="font-semibold text-bgn-900 text-sm uppercase tracking-wide">Informasi Sekolah</h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
          <Field label="Nama">{s.nama}</Field>
          <Field label="Kategori">{KATEGORI_LABELS[s.kategori] ?? s.kategori}</Field>
          <Field label="Kabupaten/Kota">{s.kabupatenKota}</Field>
          <Field label="Jumlah Penerima">{s.jumlahPenerima}</Field>
          <Field label="No. Telepon">{s.noTelp ?? '-'}</Field>
          <Field label="Status">{<StatusBadge status={s.status} />}</Field>
          <div className="col-span-2">
            <Field label="Alamat">{s.alamat}</Field>
          </div>
        </dl>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={() => navigate(`/sekolah/${s.id}/edit`)}
          className="bg-bgn-green-400 text-white px-6 py-2 rounded-lg hover:bg-bgn-green-500">Edit</button>
        <button onClick={() => { if (confirm('Hapus sekolah?')) deleteMutation.mutate() }}
          disabled={deleteMutation.isPending}
          className="border border-red-300 text-red-600 px-6 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50">Hapus</button>
        <button onClick={() => navigate('/sekolah')}
          className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50">Kembali</button>
      </div>
    </div>
  )
}