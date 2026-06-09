import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sppgApi } from '@/api/endpoints/sppg'
import { StatusBadge } from '@/components/StatusBadge'
import { getErrorMessage } from '@/utils/error'
import { useAuthStore } from '@/store/auth.store'

export function SppgDetailPage() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'ADMIN_BGN'
  const bolehEditSlhs = user?.role === 'ADMIN_BGN' || user?.role === 'KEPALA_SPPG'

  const [editSlhs, setEditSlhs] = useState(false)
  const [slhsNomor, setSlhsNomor] = useState('')
  const [slhsBerlaku, setSlhsBerlaku] = useState('')
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['sppg', id],
    queryFn: () => sppgApi.getOne(id!),
    enabled: !!id,
  })

  const slhsMutation = useMutation({
    mutationFn: () => sppgApi.update(id!, {
      slhsNomor: slhsNomor || undefined,
      slhsBerlakuSampai: slhsBerlaku || undefined,
    }),
    onSuccess: () => { setEditSlhs(false); setError(''); qc.invalidateQueries({ queryKey: ['sppg', id] }) },
    onError: (err) => setError(getErrorMessage(err)),
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

  // Status legalitas SLHS
  const fmtTgl = (s: string) => new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
  const slhsKedaluwarsa = sppg.slhsBerlakuSampai ? new Date(sppg.slhsBerlakuSampai) < new Date() : false
  const slhsBadge = !sppg.slhsNomor
    ? { text: 'Belum ada', cls: 'bg-amber-100 text-amber-700' }
    : slhsKedaluwarsa
      ? { text: 'Kedaluwarsa', cls: 'bg-red-100 text-red-600' }
      : { text: 'Berlaku', cls: 'bg-bgn-green-100 text-bgn-green-700' }

  const openEditSlhs = () => {
    setSlhsNomor(sppg.slhsNomor ?? '')
    setSlhsBerlaku(sppg.slhsBerlakuSampai ? sppg.slhsBerlakuSampai.slice(0, 10) : '')
    setEditSlhs(true)
  }

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none'

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

      {/* Legalitas SLHS */}
      <div className="bg-white rounded-xl border border-bgn-100 p-5 shadow-md mt-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-bgn-900">Sertifikat Laik Higiene Sanitasi (SLHS)</h2>
            <p className="text-xs text-gray-500">Bukti dapur SPPG memenuhi syarat higiene sanitasi.</p>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full ${slhsBadge.cls}`}>{slhsBadge.text}</span>
        </div>

        {error && <p className="text-sm text-red-500 mb-2">{error}</p>}

        {!editSlhs ? (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Nomor sertifikat</span>
                <span className="font-medium text-bgn-900">{sppg.slhsNomor ?? '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Berlaku sampai</span>
                <span className={`font-medium ${slhsKedaluwarsa ? 'text-red-600' : 'text-bgn-900'}`}>
                  {sppg.slhsBerlakuSampai ? fmtTgl(sppg.slhsBerlakuSampai) : '-'}
                </span>
              </div>
            </div>
            {bolehEditSlhs && (
              <button onClick={openEditSlhs}
                className="mt-3 border border-bgn-300 text-bgn-700 px-4 py-1.5 rounded-lg text-sm hover:bg-bgn-50">
                {sppg.slhsNomor ? 'Perbarui SLHS' : 'Isi SLHS'}
              </button>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nomor sertifikat</label>
              <input value={slhsNomor} onChange={(e) => setSlhsNomor(e.target.value)} placeholder="mis. 440/SLHS/2026" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Berlaku sampai</label>
              <input type="date" value={slhsBerlaku} onChange={(e) => setSlhsBerlaku(e.target.value)} className={inputCls} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => slhsMutation.mutate()} disabled={slhsMutation.isPending}
                className="bg-bgn-green-400 text-white px-5 py-2 rounded-lg text-sm hover:bg-bgn-green-500 disabled:opacity-50">
                {slhsMutation.isPending ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button onClick={() => { setEditSlhs(false); setError('') }} className="border border-gray-300 px-5 py-2 rounded-lg text-sm">Batal</button>
            </div>
          </div>
        )}
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
