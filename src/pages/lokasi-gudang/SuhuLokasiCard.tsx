import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { logSuhuApi } from '@/api/endpoints/log-suhu'
import { getErrorMessage } from '@/utils/error'
import type { TipeLokasiGudang } from '@/types'

// Rentang aman per tipe (samakan dengan backend RENTANG_SUHU)
const RENTANG: Record<TipeLokasiGudang, string> = {
  DINGIN: 'Aman 0–5°C',
  BEKU: 'Aman ≤ −18°C',
  KERING: 'Aman ≤ 25°C',
}
const TIPE_ICONS: Record<TipeLokasiGudang, string> = { KERING: '📦', DINGIN: '❄️', BEKU: '🧊' }

const todayStr = () => new Date().toISOString().slice(0, 10)
const jam = (iso: string) => new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

export function SuhuLokasiCard({ lokasi }: { lokasi: { id: string; nama: string; tipe: TipeLokasiGudang } }) {
  const qc = useQueryClient()
  const [suhu, setSuhu] = useState('')
  const [error, setError] = useState('')

  const { data } = useQuery({
    queryKey: ['log-suhu', lokasi.id, todayStr()],
    queryFn: () => logSuhuApi.list(lokasi.id, todayStr()),
  })
  const logs = data?.data.data ?? []
  const terbaru = logs[0] // list diurut waktu DESC

  const catatMutation = useMutation({
    mutationFn: () => logSuhuApi.create(lokasi.id, { suhu: Number(suhu) }),
    onSuccess: () => {
      setSuhu(''); setError('')
      qc.invalidateQueries({ queryKey: ['log-suhu', lokasi.id, todayStr()] })
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  return (
    <div className="bg-white rounded-xl border border-bgn-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="font-medium text-bgn-900 text-sm">{TIPE_ICONS[lokasi.tipe]} {lokasi.nama}</p>
          <p className="text-xs text-gray-400">{RENTANG[lokasi.tipe]}</p>
        </div>
        {terbaru ? (
          <span className={`text-xs px-2 py-0.5 rounded-full ${terbaru.aman ? 'bg-bgn-green-100 text-bgn-green-700' : 'bg-red-100 text-red-600'}`}>
            {terbaru.suhu}°C · {terbaru.aman ? 'Aman' : 'Bahaya'}
          </span>
        ) : (
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Belum dicatat hari ini</span>
        )}
      </div>

      {/* Input catat suhu */}
      <div className="flex items-center gap-2">
        <input
          type="number" inputMode="decimal" step="0.1" value={suhu}
          onChange={(e) => setSuhu(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && suhu) catatMutation.mutate() }}
          placeholder="Suhu sekarang"
          className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-right focus:ring-2 focus:ring-bgn-green-400 focus:outline-none"
        />
        <span className="text-xs text-gray-500">°C</span>
        <button onClick={() => suhu && catatMutation.mutate()} disabled={!suhu || catatMutation.isPending}
          className="bg-bgn-800 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-bgn-900 disabled:opacity-50">
          {catatMutation.isPending ? '...' : 'Catat'}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {/* Riwayat hari ini */}
      {logs.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {logs.map(l => (
            <span key={l.id} className={`text-[11px] px-1.5 py-0.5 rounded ${l.aman ? 'bg-bgn-green-50 text-bgn-green-700' : 'bg-red-50 text-red-600'}`}>
              {jam(l.waktu)} {l.suhu}°
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
