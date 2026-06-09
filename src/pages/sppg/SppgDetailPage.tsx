import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { sppgApi } from '@/api/endpoints/sppg'
import { StatusBadge } from '@/components/StatusBadge'
import { useAuthStore } from '@/store/auth.store'

export function SppgDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN_BGN'

  const { data, isLoading } = useQuery({
    queryKey: ['sppg', id],
    queryFn: () => sppgApi.getOne(id!),
    enabled: !!id,
  })

  if (isLoading) return <p className="text-gray-500">Memuat...</p>
  const sppg = data?.data.data
  if (!sppg) return <p className="text-red-500">Data tidak ditemukan</p>

  const fields: { label: string; value: string | null }[] = [
    { label: 'Kode', value: sppg.kode },
    { label: 'Nama', value: sppg.nama },
    { label: 'Alamat', value: sppg.alamat },
    { label: 'Penanggung Jawab', value: sppg.penanggungJawab },
    { label: 'No. Telp', value: sppg.noTelp },
    { label: 'Wilayah', value: sppg.wilayah },
    { label: 'Provinsi', value: sppg.provinsi },
  ]

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/sppg" className="text-bgn-800 hover:underline text-sm">← SPPG</Link>
        <span className="text-gray-400">/</span>
        <h1 className="text-2xl font-bold text-bgn-900">{sppg.nama}</h1>
        <StatusBadge status={sppg.status} />
      </div>

      <div className="bg-white rounded-xl border border-bgn-100 p-5 shadow-md">
        <div className="space-y-3">
          {fields.map((f) => (
            <div key={f.label} className="flex justify-between items-center py-2 border-b border-bgn-50 last:border-b-0">
              <span className="text-sm text-gray-500">{f.label}</span>
              <span className="text-sm font-medium text-bgn-900">{f.value ?? '-'}</span>
            </div>
          ))}
        </div>
      </div>

      {isAdmin && (
        <div className="mt-4">
          <Link to={`/sppg/${sppg.id}/edit`}
            className="bg-bgn-green-400 text-white px-5 py-2 rounded-lg text-sm hover:bg-bgn-green-500 inline-block">
            Edit SPPG
          </Link>
        </div>
      )}
    </div>
  )
}