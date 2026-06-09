import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { penerimaApi } from '@/api/endpoints/penerima'
import { StatusBadge } from '@/components/StatusBadge'

const JENJANG_LABELS: Record<string, string> = {
  TK: 'TK', SD: 'SD', SMP: 'SMP', SMA: 'SMA',
}

const JK_LABELS: Record<string, string> = { L: 'Laki-laki', P: 'Perempuan' }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-sm text-gray-900 mt-0.5">{children}</dd>
    </div>
  )
}

export function PenerimaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['penerima', id],
    queryFn: () => penerimaApi.getOne(id!),
    enabled: !!id,
  })

  const deleteMutation = useMutation({
    mutationFn: () => penerimaApi.delete(id!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['penerima'] }); navigate('/penerima') },
  })

  if (isLoading) return <p className="text-gray-500">Memuat...</p>

  const p = data?.data.data
  if (!p) return <p className="text-red-500">Data tidak ditemukan</p>

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-bgn-900">{p.nama}</h1>
          <p className="text-gray-500 text-sm mt-1">NIK: {p.nik}</p>
        </div>
        <StatusBadge status={p.status} />
      </div>
      <div className="bg-white rounded-xl border border-bgn-100 p-5 shadow-md space-y-4">
        <h2 className="font-semibold text-bgn-900 text-sm uppercase tracking-wide">Data Pribadi</h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
          <Field label="Nama">{p.nama}</Field>
          <Field label="NIK">{p.nik}</Field>
          <Field label="Tanggal Lahir">{new Date(p.tanggalLahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</Field>
          <Field label="Jenis Kelamin">{JK_LABELS[p.jenisKelamin] ?? p.jenisKelamin}</Field>
          <Field label="Alamat"><div className="col-span-2">{p.alamat}</div></Field>
        </dl>
      </div>
      <div className="bg-white rounded-xl border border-bgn-100 p-5 shadow-md space-y-4 mt-4">
        <h2 className="font-semibold text-bgn-900 text-sm uppercase tracking-wide">Pendidikan</h2>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
          <Field label="Institusi">{p.institusi}</Field>
          <Field label="Jenjang">{JENJANG_LABELS[p.jenjang] ?? p.jenjang}</Field>
          <Field label="Kelas">{p.kelas ?? '-'}</Field>
          <Field label="Status">{<StatusBadge status={p.status} />}</Field>
        </dl>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={() => navigate(`/penerima/${p.id}/edit`)}
          className="bg-bgn-green-400 text-white px-6 py-2 rounded-lg hover:bg-bgn-green-500">Edit</button>
        <button onClick={() => { if (confirm('Hapus penerima?')) deleteMutation.mutate() }}
          disabled={deleteMutation.isPending}
          className="border border-red-300 text-red-600 px-6 py-2 rounded-lg hover:bg-red-50 disabled:opacity-50">Hapus</button>
        <button onClick={() => navigate('/penerima')}
          className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50">Kembali</button>
      </div>
    </div>
  )
}