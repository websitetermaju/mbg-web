import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { higieneApi } from '@/api/endpoints/higiene'
import { getErrorMessage } from '@/utils/error'
import type { PemeriksaanHigiene } from '@/types'

// Butir pemeriksaan (samakan dengan field backend)
const BUTIR = [
  { key: 'sehat', label: 'Sehat (tidak demam/diare/batuk-pilek)' },
  { key: 'tanganBersih', label: 'Tangan bersih, tidak ada luka terbuka' },
  { key: 'kukuPendek', label: 'Kuku pendek & bersih, tanpa cat kuku' },
  { key: 'apdLengkap', label: 'APD lengkap (celemek, penutup kepala, masker)' },
  { key: 'tanpaPerhiasan', label: 'Tidak memakai perhiasan' },
] as const

type ButirKey = (typeof BUTIR)[number]['key']
const todayStr = () => new Date().toISOString().slice(0, 10)

export function HigienePage() {
  const qc = useQueryClient()
  const [nama, setNama] = useState('')
  const [centang, setCentang] = useState<Record<ButirKey, boolean>>({
    sehat: false, tanganBersih: false, kukuPendek: false, apdLengkap: false, tanpaPerhiasan: false,
  })
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['higiene', todayStr()],
    queryFn: () => higieneApi.list(todayStr()),
  })
  const items = data?.data.data ?? []

  const reset = () => {
    setNama('')
    setCentang({ sehat: false, tanganBersih: false, kukuPendek: false, apdLengkap: false, tanpaPerhiasan: false })
  }

  const simpanMutation = useMutation({
    mutationFn: () => higieneApi.create({ namaPekerja: nama, ...centang }),
    onSuccess: () => { reset(); setError(''); qc.invalidateQueries({ queryKey: ['higiene', todayStr()] }) },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const hapusMutation = useMutation({
    mutationFn: (id: string) => higieneApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['higiene', todayStr()] }),
  })

  const toggle = (k: ButirKey) => setCentang(c => ({ ...c, [k]: !c[k] }))
  const ringkas = (h: PemeriksaanHigiene) => BUTIR.filter(b => h[b.key]).length

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-bgn-900 mb-1">Higiene pekerja</h1>
      <p className="text-sm text-gray-500 mb-6">Pemeriksaan harian penjamah makanan sebelum mulai memasak.</p>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}

      {/* Form pemeriksaan */}
      <div className="bg-white rounded-xl border border-bgn-100 p-5 shadow-md mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Nama pekerja *</label>
        <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="mis. Siti Aminah"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />

        <div className="space-y-2 mb-4">
          {BUTIR.map(b => (
            <label key={b.key} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={centang[b.key]} onChange={() => toggle(b.key)}
                className="w-4 h-4 rounded border-gray-300 text-bgn-green-500 focus:ring-bgn-green-400" />
              {b.label}
            </label>
          ))}
        </div>

        <button onClick={() => nama && simpanMutation.mutate()} disabled={!nama || simpanMutation.isPending}
          className="bg-bgn-green-400 text-white px-5 py-2 rounded-lg text-sm hover:bg-bgn-green-500 disabled:opacity-50">
          {simpanMutation.isPending ? 'Menyimpan...' : 'Catat pemeriksaan'}
        </button>
      </div>

      {/* Daftar hari ini */}
      <h2 className="font-semibold text-bgn-900 mb-2">Pemeriksaan hari ini</h2>
      {isLoading ? <p className="text-gray-500">Memuat...</p> : items.length === 0 ? (
        <p className="text-gray-400 text-sm">Belum ada pemeriksaan hari ini.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-bgn-100 divide-y divide-bgn-100">
          {items.map(h => (
            <div key={h.id} className="flex items-center gap-3 px-5 py-3">
              <span className="text-lg" aria-hidden>{h.lolos ? '🟢' : '🔴'}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-bgn-900">{h.namaPekerja}</p>
                <p className="text-xs text-gray-500">{ringkas(h)}/{BUTIR.length} butir terpenuhi</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${h.lolos ? 'bg-bgn-green-100 text-bgn-green-700' : 'bg-red-100 text-red-600'}`}>
                {h.lolos ? 'Lolos' : 'Belum lolos'}
              </span>
              <button onClick={() => { if (confirm('Hapus catatan ini?')) hapusMutation.mutate(h.id) }}
                className="text-xs text-red-500 hover:underline">Hapus</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
