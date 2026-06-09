import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cekMutuApi } from '@/api/endpoints/cek-mutu'
import { getErrorMessage } from '@/utils/error'
import type { CekMutuPenerimaan } from '@/types'

const BUTIR = [
  { key: 'kondisiFisikBaik', label: 'Kondisi fisik baik (tidak rusak/memar)' },
  { key: 'kesegaranBaik', label: 'Segar (tidak layu/berbau/busuk)' },
  { key: 'kemasanBaik', label: 'Kemasan utuh & bersih' },
  { key: 'kedaluwarsaOk', label: 'Tanggal kedaluwarsa masih aman' },
] as const

type ButirKey = (typeof BUTIR)[number]['key']
const jam = (iso: string) => new Date(iso).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

export function CekMutuSection({ pengadaanId }: { pengadaanId: string }) {
  const qc = useQueryClient()
  const [centang, setCentang] = useState<Record<ButirKey, boolean>>({
    kondisiFisikBaik: false, kesegaranBaik: false, kemasanBaik: false, kedaluwarsaOk: false,
  })
  const [suhu, setSuhu] = useState('')
  const [error, setError] = useState('')

  const { data } = useQuery({
    queryKey: ['cek-mutu', pengadaanId],
    queryFn: () => cekMutuApi.list(pengadaanId),
  })
  const list = data?.data.data ?? []

  const simpanMutation = useMutation({
    mutationFn: () => cekMutuApi.create(pengadaanId, {
      ...centang,
      suhuTerima: suhu ? Number(suhu) : undefined,
    }),
    onSuccess: () => {
      setCentang({ kondisiFisikBaik: false, kesegaranBaik: false, kemasanBaik: false, kedaluwarsaOk: false })
      setSuhu(''); setError('')
      qc.invalidateQueries({ queryKey: ['cek-mutu', pengadaanId] })
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const hapusMutation = useMutation({
    mutationFn: (cekId: string) => cekMutuApi.remove(pengadaanId, cekId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cek-mutu', pengadaanId] }),
  })

  const toggle = (k: ButirKey) => setCentang(c => ({ ...c, [k]: !c[k] }))
  const ringkas = (c: CekMutuPenerimaan) => BUTIR.filter(b => c[b.key]).length

  return (
    <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden mb-6">
      <div className="px-5 py-4 border-b border-bgn-100">
        <h2 className="font-semibold text-bgn-900">Cek mutu penerimaan</h2>
        <p className="text-xs text-gray-500 mt-0.5">Periksa mutu bahan saat barang datang, sebelum masuk stok.</p>
      </div>

      {/* Form cek mutu */}
      <div className="px-5 py-4 bg-bgn-50/40 border-b border-bgn-100">
        <div className="space-y-2 mb-3">
          {BUTIR.map(b => (
            <label key={b.key} className="flex items-center gap-2.5 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={centang[b.key]} onChange={() => toggle(b.key)}
                className="w-4 h-4 rounded border-gray-300 text-bgn-green-500 focus:ring-bgn-green-400" />
              {b.label}
            </label>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <div className="w-32">
            <label className="block text-xs font-medium text-gray-600 mb-1">Suhu terima (°C)</label>
            <input type="number" step="0.1" value={suhu} onChange={(e) => setSuhu(e.target.value)} placeholder="opsional"
              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-right focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
          </div>
          <button onClick={() => simpanMutation.mutate()} disabled={simpanMutation.isPending}
            className="bg-bgn-green-400 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-bgn-green-500 disabled:opacity-50">
            {simpanMutation.isPending ? 'Menyimpan...' : 'Catat cek mutu'}
          </button>
        </div>
        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>

      {/* Riwayat */}
      {list.length === 0 ? (
        <p className="px-5 py-5 text-center text-gray-400 text-sm">Belum ada cek mutu.</p>
      ) : (
        <div className="divide-y divide-bgn-100">
          {list.map(c => (
            <div key={c.id} className="flex items-center gap-3 px-5 py-3">
              <span className="text-lg" aria-hidden>{c.lolos ? '🟢' : '🔴'}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-bgn-900">{ringkas(c)}/{BUTIR.length} butir terpenuhi</p>
                <p className="text-xs text-gray-500">{jam(c.waktu)}{c.suhuTerima != null ? ` · terima ${c.suhuTerima}°C` : ''}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${c.lolos ? 'bg-bgn-green-100 text-bgn-green-700' : 'bg-red-100 text-red-600'}`}>
                {c.lolos ? 'Lolos' : 'Tidak lolos'}
              </span>
              <button onClick={() => { if (confirm('Hapus cek mutu ini?')) hapusMutation.mutate(c.id) }}
                className="text-xs text-red-500 hover:underline">Hapus</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
