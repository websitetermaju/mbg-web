import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { produksiApi } from '@/api/endpoints/produksi'
import { biayaApi } from '@/api/endpoints/biaya-produksi'
import { qcApi } from '@/api/endpoints/qc'
import { bankSampelApi } from '@/api/endpoints/bank-sampel'
import { sopApi } from '@/api/endpoints/sop'
import { StatusBadge } from '@/components/StatusBadge'
import { getErrorMessage } from '@/utils/error'
import type { KategoriBiaya, SopProduksiStep } from '@/types'

const formatRp = (n: number) => `Rp ${Number(n).toLocaleString('id-ID')}`

const KATEGORI_OPTIONS: { value: KategoriBiaya; label: string }[] = [
  { value: 'BAHAN_BAKU', label: 'Bahan Baku' },
  { value: 'UPAH', label: 'Upah' },
  { value: 'UTILITAS', label: 'Utilitas (Gas/Listrik)' },
  { value: 'LAINNYA', label: 'Lainnya' },
]

export function ProduksiDetailPage() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const [showBiayaForm, setShowBiayaForm] = useState(false)
  const [biayaKategori, setBiayaKategori] = useState<KategoriBiaya>('LAINNYA')
  const [biayaDeskripsi, setBiayaDeskripsi] = useState('')
  const [biayaJumlah, setBiayaJumlah] = useState('')
  const [error, setError] = useState('')

  const { data: prodData, isLoading } = useQuery({
    queryKey: ['produksi', id],
    queryFn: () => produksiApi.getOne(id!),
    enabled: !!id,
  })

  const { data: biayaData, refetch: refetchBiaya } = useQuery({
    queryKey: ['biaya', id],
    queryFn: () => biayaApi.get(id!),
    enabled: !!id,
  })

  const { data: qcData, refetch: refetchQc } = useQuery({
    queryKey: ['qc-hasil', id],
    queryFn: () => qcApi.getHasil(id!),
    enabled: !!id,
  })

  const { data: sopData, refetch: refetchSop } = useQuery({
    queryKey: ['sop-produksi', id],
    queryFn: () => sopApi.getSteps(id!),
    enabled: !!id,
  })
  const sopSteps = sopData?.data.data ?? []

  const tambahBiayaMutation = useMutation({
    mutationFn: () => biayaApi.tambah(id!, { kategori: biayaKategori, deskripsi: biayaDeskripsi, jumlah: parseFloat(biayaJumlah) }),
    onSuccess: () => {
      void refetchBiaya()
      setShowBiayaForm(false)
      setBiayaDeskripsi(''); setBiayaJumlah('')
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const hapusBiayaMutation = useMutation({
    mutationFn: (itemId: string) => biayaApi.hapus(id!, itemId),
    onSuccess: () => void refetchBiaya(),
    onError: (err) => setError(getErrorMessage(err)),
  })

  const initQcMutation = useMutation({
    mutationFn: () => qcApi.init(id!),
    onSuccess: () => void refetchQc(),
    onError: (err) => setError(getErrorMessage(err)),
  })

  const centangMutation = useMutation({
    mutationFn: ({ hasilId, passed, nilai, catatan }: { hasilId: string; passed?: boolean; nilai?: number; catatan?: string }) =>
      qcApi.centang(id!, hasilId, { passed, nilai, catatan }),
    onSuccess: () => void refetchQc(),
  })

  // Nilai suhu yang sedang diketik per item (sebelum dicatat). Key = id hasil.
  const [suhuInput, setSuhuInput] = useState<Record<string, string>>({})

  const selesaiQcMutation = useMutation({
    mutationFn: () => qcApi.selesai(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['produksi', id] })
      void refetchQc()
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  // ── Bank Sampel (retain sample 24 jam) ──
  const { data: sampelData, refetch: refetchSampel } = useQuery({
    queryKey: ['bank-sampel', id],
    queryFn: () => bankSampelApi.list(id!),
    enabled: !!id,
  })
  const [sampelForm, setSampelForm] = useState({ namaMakanan: '', lokasiSimpan: '', suhuSimpan: '' })

  const tambahSampelMutation = useMutation({
    mutationFn: () => bankSampelApi.create(id!, {
      namaMakanan: sampelForm.namaMakanan,
      lokasiSimpan: sampelForm.lokasiSimpan || undefined,
      suhuSimpan: sampelForm.suhuSimpan ? Number(sampelForm.suhuSimpan) : undefined,
    }),
    onSuccess: () => {
      setSampelForm({ namaMakanan: '', lokasiSimpan: '', suhuSimpan: '' })
      void refetchSampel()
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const buangSampelMutation = useMutation({
    mutationFn: (sampelId: string) => bankSampelApi.update(id!, sampelId, { status: 'DIBUANG' }),
    onSuccess: () => void refetchSampel(),
    onError: (err) => setError(getErrorMessage(err)),
  })

  const mulaiSopMutation = useMutation({
    mutationFn: (stepId: string) => sopApi.mulaiStep(id!, stepId),
    onSuccess: () => void refetchSop(),
    onError: (err) => setError(getErrorMessage(err)),
  })

  const selesaiSopMutation = useMutation({
    mutationFn: (stepId: string) => sopApi.selesaiStep(id!, stepId),
    onSuccess: () => void refetchSop(),
    onError: (err) => setError(getErrorMessage(err)),
  })

  if (isLoading) return <p className="text-gray-500">Memuat...</p>
  const prod = prodData?.data.data
  if (!prod) return <p className="text-red-500">Data tidak ditemukan</p>

  const biaya = biayaData?.data.data
  const hasilList = qcData?.data.data ?? []
  const sampelList = sampelData?.data.data ?? []

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/produksi" className="text-bgn-800 hover:underline text-sm">← Produksi</Link>
        <span className="text-gray-400">/</span>
        <h1 className="text-2xl font-bold text-bgn-900">Produksi {prod.tanggal}</h1>
        <StatusBadge status={prod.status} />
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}

      {/* Info produksi */}
      <div className="bg-white rounded-xl shadow-md border border-bgn-100 p-5 mb-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { label: 'Porsi Diproduksi', value: prod.porsiDiproduksi, color: 'text-bgn-green-700' },
            { label: 'Porsi Gagal', value: prod.porsiGagal, color: prod.porsiGagal > 0 ? 'text-red-600' : 'text-gray-800' },
            { label: 'Need Review', value: prod.needReview ? 'Ya' : 'Tidak', color: prod.needReview ? 'text-orange-600' : 'text-gray-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="p-3 bg-bgn-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`font-bold text-lg ${color}`}>{value}</p>
            </div>
          ))}
        </div>
        {(prod.waktuMulai || prod.waktuSelesai) && (
          <div className="grid grid-cols-2 gap-3 text-sm mt-3">
            {prod.waktuMulai && <div><span className="text-gray-500">Mulai:</span> <span>{new Date(prod.waktuMulai).toLocaleString('id-ID')}</span></div>}
            {prod.waktuSelesai && <div><span className="text-gray-500">Selesai:</span> <span>{new Date(prod.waktuSelesai).toLocaleString('id-ID')}</span></div>}
          </div>
        )}
        {biaya && (
          <div className="flex gap-4 mt-3 text-sm border-t border-bgn-100 pt-3">
            <div><span className="text-gray-500">Total Biaya:</span> <span className="font-semibold">{formatRp(biaya.totalBiaya)}</span></div>
            <div><span className="text-gray-500">Cost/Porsi:</span> <span className="font-semibold text-bgn-green-700">{formatRp(biaya.costPerPorsi)}</span></div>
          </div>
        )}
      </div>

      {/* Section Biaya Produksi */}
      <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden mb-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-bgn-100">
          <h2 className="font-semibold text-bgn-900">Biaya Produksi</h2>
          <button onClick={() => setShowBiayaForm(!showBiayaForm)}
            className="bg-bgn-green-400 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-bgn-green-500">
            + Tambah Biaya
          </button>
        </div>

        {showBiayaForm && (
          <div className="p-4 border-b border-bgn-100 bg-bgn-50">
            <div className="grid grid-cols-3 gap-2 mb-3">
              <select value={biayaKategori} onChange={(e) => setBiayaKategori(e.target.value as KategoriBiaya)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none">
                {KATEGORI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <input type="text" value={biayaDeskripsi} onChange={(e) => setBiayaDeskripsi(e.target.value)}
                placeholder="Deskripsi" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
              <input type="number" value={biayaJumlah} onChange={(e) => setBiayaJumlah(e.target.value)}
                placeholder="Jumlah (Rp)" className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => tambahBiayaMutation.mutate()}
                disabled={!biayaDeskripsi || !biayaJumlah || tambahBiayaMutation.isPending}
                className="bg-bgn-green-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-bgn-green-500 disabled:opacity-50">
                Simpan
              </button>
              <button onClick={() => setShowBiayaForm(false)} className="border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">Batal</button>
            </div>
          </div>
        )}

        {!biaya || biaya.items.length === 0 ? (
          <p className="px-5 py-6 text-center text-gray-400 text-sm">Belum ada biaya dicatat</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-bgn-200">
              <tr>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Kategori</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Deskripsi</th>
                <th className="text-right px-4 py-3 text-bgn-900 font-semibold">Jumlah</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bgn-100">
              {biaya.items.map(item => (
                <tr key={item.id} className="odd:bg-white even:bg-bgn-50">
                  <td className="px-4 py-3 text-xs text-gray-500 uppercase">{item.kategori}</td>
                  <td className="px-4 py-3 text-gray-700">{item.deskripsi}</td>
                  <td className="px-4 py-3 text-right font-medium text-bgn-900">{formatRp(item.jumlah)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { if (confirm('Hapus item biaya?')) hapusBiayaMutation.mutate(item.id) }}
                      className="text-red-500 hover:underline text-xs">Hapus</button>
                  </td>
                </tr>
              ))}
              <tr className="bg-bgn-100">
                <td colSpan={2} className="px-4 py-3 font-semibold text-bgn-900 text-right">Total</td>
                <td className="px-4 py-3 text-right font-bold text-bgn-900">{formatRp(biaya.totalBiaya)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* Section QC Checklist */}
      <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-bgn-100">
          <div>
            <h2 className="font-semibold text-bgn-900">QC Checklist</h2>
            {prod.qcSelesai && <span className="text-xs text-bgn-green-600 font-medium">✓ QC Selesai</span>}
          </div>
          <div className="flex gap-2">
            {hasilList.length === 0 && !prod.qcSelesai && (
              <button onClick={() => initQcMutation.mutate()} disabled={initQcMutation.isPending}
                className="bg-bgn-green-400 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-bgn-green-500 disabled:opacity-50">
                {initQcMutation.isPending ? 'Memuat...' : 'Init QC'}
              </button>
            )}
            {hasilList.length > 0 && !prod.qcSelesai && (
              <button onClick={() => selesaiQcMutation.mutate()} disabled={selesaiQcMutation.isPending}
                className="border border-bgn-green-400 text-bgn-green-600 px-4 py-1.5 rounded-lg text-sm hover:bg-bgn-green-50 disabled:opacity-50">
                Selesaikan QC
              </button>
            )}
          </div>
        </div>

        {hasilList.length === 0 ? (
          <p className="px-5 py-6 text-center text-gray-400 text-sm">
            {prod.qcSelesai ? 'QC sudah selesai' : 'Klik "Init QC" untuk mulai checklist'}
          </p>
        ) : (
          <div className="divide-y divide-bgn-100">
            {hasilList.map(hasil => {
              const item = hasil.templateItem
              const isSuhu = item?.tipe === 'SUHU'
              const sat = item?.satuan ?? ''
              // Keterangan rentang aman untuk item suhu (CCP)
              const rentang = item && (item.batasMin != null || item.batasMax != null)
                ? item.batasMin != null && item.batasMax != null
                  ? `Aman ${item.batasMin}–${item.batasMax}${sat}`
                  : item.batasMin != null
                    ? `Aman ≥ ${item.batasMin}${sat}`
                    : `Aman ≤ ${item.batasMax}${sat}`
                : null

              return (
              <div key={hasil.id} className={`flex items-center gap-3 px-5 py-3 ${hasil.passed ? 'bg-bgn-green-50' : hasil.checkedAt ? 'bg-red-50' : 'bg-white'}`}>
                {isSuhu ? (
                  <span className="w-6 h-6 flex items-center justify-center flex-shrink-0 text-lg" aria-hidden>🌡️</span>
                ) : (
                  <button
                    onClick={() => centangMutation.mutate({ hasilId: hasil.id, passed: !hasil.passed })}
                    disabled={prod.qcSelesai}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      hasil.passed ? 'bg-bgn-green-400 border-bgn-green-400 text-white' :
                      hasil.checkedAt ? 'bg-red-100 border-red-400 text-red-500' :
                      'border-gray-300 hover:border-bgn-green-400'
                    } disabled:opacity-60 disabled:cursor-not-allowed`}
                  >
                    {hasil.passed ? '✓' : hasil.checkedAt ? '✗' : ''}
                  </button>
                )}
                <div className="flex-1">
                  <p className={`text-sm ${hasil.passed ? 'text-bgn-green-700 font-medium' : hasil.checkedAt ? 'text-red-600' : 'text-gray-700'}`}>
                    {item?.namaCheck ?? `Item ${hasil.templateItemId.slice(0,6)}`}
                  </p>
                  {rentang && <p className="text-xs text-gray-400 mt-0.5">{rentang}</p>}
                  {hasil.catatan && <p className="text-xs text-gray-500 mt-0.5">{hasil.catatan}</p>}
                </div>

                {isSuhu && !prod.qcSelesai && (
                  // Input suhu terukur: ketik angka lalu "Catat" → backend hitung lulus/gagal
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number" inputMode="decimal" step="0.1"
                      value={suhuInput[hasil.id] ?? (hasil.nilai != null ? String(hasil.nilai) : '')}
                      onChange={(e) => setSuhuInput(s => ({ ...s, [hasil.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && suhuInput[hasil.id]) {
                          centangMutation.mutate({ hasilId: hasil.id, nilai: Number(suhuInput[hasil.id]) })
                        }
                      }}
                      placeholder="0"
                      className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm text-right focus:ring-2 focus:ring-bgn-green-400 focus:outline-none"
                    />
                    {sat && <span className="text-xs text-gray-500">{sat}</span>}
                    <button
                      onClick={() => suhuInput[hasil.id] && centangMutation.mutate({ hasilId: hasil.id, nilai: Number(suhuInput[hasil.id]) })}
                      disabled={!suhuInput[hasil.id] || centangMutation.isPending}
                      className="bg-bgn-800 text-white text-xs px-3 py-1 rounded-lg hover:bg-bgn-900 disabled:opacity-50"
                    >
                      Catat
                    </button>
                  </div>
                )}
                {isSuhu && prod.qcSelesai && hasil.nilai != null && (
                  <span className="text-sm font-medium text-gray-700">{hasil.nilai}{sat}</span>
                )}

                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  hasil.passed ? 'bg-bgn-green-100 text-bgn-green-700' :
                  hasil.checkedAt ? 'bg-red-100 text-red-600' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {hasil.passed ? 'Lulus' : hasil.checkedAt ? 'Gagal' : 'Belum'}
                </span>
              </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Section Bank Sampel — retain sample 24 jam (juknis BGN) */}
      <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden mt-4">
        <div className="px-5 py-4 border-b border-bgn-100">
          <h2 className="font-semibold text-bgn-900">Bank sampel makanan</h2>
          <p className="text-xs text-gray-500 mt-0.5">Simpan contoh tiap menu minimal 1×24 jam sebagai bukti keamanan pangan.</p>
        </div>

        {/* Form tambah sampel */}
        <div className="px-5 py-3 bg-bgn-50/40 border-b border-bgn-100 flex flex-wrap items-end gap-2">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Nama makanan *</label>
            <input value={sampelForm.namaMakanan} onChange={(e) => setSampelForm(f => ({ ...f, namaMakanan: e.target.value }))}
              placeholder="mis. Nasi ayam teriyaki"
              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
          </div>
          <div className="w-32">
            <label className="block text-xs font-medium text-gray-600 mb-1">Lokasi simpan</label>
            <input value={sampelForm.lokasiSimpan} onChange={(e) => setSampelForm(f => ({ ...f, lokasiSimpan: e.target.value }))}
              placeholder="Chiller B"
              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
          </div>
          <div className="w-24">
            <label className="block text-xs font-medium text-gray-600 mb-1">Suhu (°C)</label>
            <input type="number" step="0.1" value={sampelForm.suhuSimpan} onChange={(e) => setSampelForm(f => ({ ...f, suhuSimpan: e.target.value }))}
              placeholder="4"
              className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-right focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
          </div>
          <button onClick={() => sampelForm.namaMakanan && tambahSampelMutation.mutate()}
            disabled={!sampelForm.namaMakanan || tambahSampelMutation.isPending}
            className="bg-bgn-green-400 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-bgn-green-500 disabled:opacity-50">
            {tambahSampelMutation.isPending ? 'Menyimpan...' : 'Simpan sampel'}
          </button>
        </div>

        {sampelList.length === 0 ? (
          <p className="px-5 py-6 text-center text-gray-400 text-sm">Belum ada sampel disimpan untuk batch ini.</p>
        ) : (
          <div className="divide-y divide-bgn-100">
            {sampelList.map(s => {
              const kedaluwarsa = new Date(s.waktuKedaluwarsa)
              const lewat = Date.now() > kedaluwarsa.getTime()
              const fmt = (iso: string) => new Date(iso).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
              return (
                <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-lg" aria-hidden>🍱</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-bgn-900">{s.namaMakanan}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Disimpan {fmt(s.waktuSimpan)}
                      {s.lokasiSimpan ? ` · ${s.lokasiSimpan}` : ''}
                      {s.suhuSimpan != null ? ` · ${s.suhuSimpan}°C` : ''}
                    </p>
                    <p className={`text-xs mt-0.5 ${lewat ? 'text-gray-400' : 'text-bgn-green-600'}`}>
                      {s.status === 'DISIMPAN'
                        ? (lewat ? `Retensi 24 jam selesai (${fmt(s.waktuKedaluwarsa)}) — boleh dibuang` : `Simpan sampai ${fmt(s.waktuKedaluwarsa)}`)
                        : s.status === 'DIUJI' ? 'Diambil untuk uji lab' : 'Sudah dibuang'}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    s.status === 'DISIMPAN' ? 'bg-bgn-green-100 text-bgn-green-700' :
                    s.status === 'DIUJI' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {s.status === 'DISIMPAN' ? 'Disimpan' : s.status === 'DIUJI' ? 'Diuji' : 'Dibuang'}
                  </span>
                  {s.status === 'DISIMPAN' && (
                    <button onClick={() => { if (confirm('Tandai sampel ini sudah dibuang?')) buangSampelMutation.mutate(s.id) }}
                      disabled={buangSampelMutation.isPending}
                      className="text-xs text-red-500 hover:underline disabled:opacity-50">Buang</button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Section SOP */}
      {sopSteps.length > 0 && (
        <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden mt-4">
          <div className="px-5 py-4 border-b border-bgn-100">
            <h2 className="font-semibold text-bgn-900">Tahapan SOP Produksi</h2>
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
              <span>{sopSteps.filter((s: SopProduksiStep) => s.status === 'COMPLETED').length}/{sopSteps.length} selesai</span>
              <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                <div className="bg-bgn-green-400 h-1.5 rounded-full transition-all"
                  style={{ width: `${(sopSteps.filter((s: SopProduksiStep) => s.status === 'COMPLETED').length / sopSteps.length) * 100}%` }} />
              </div>
            </div>
          </div>
          <div className="divide-y divide-bgn-100">
            {sopSteps.map((step: SopProduksiStep, idx: number) => {
              const durasi = step.waktuMulai && step.waktuSelesai
                ? Math.round((new Date(step.waktuSelesai).getTime() - new Date(step.waktuMulai).getTime()) / 60000)
                : null
              const estimasi = step.templateStep?.estimasiMenit
              return (
                <div key={step.id} className={`flex items-center gap-3 px-5 py-3 ${step.status === 'COMPLETED' ? 'bg-bgn-green-50' : step.status === 'IN_PROGRESS' ? 'bg-blue-50' : 'bg-white'}`}>
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${step.status === 'COMPLETED' ? 'bg-bgn-green-400 text-white' : step.status === 'IN_PROGRESS' ? 'bg-blue-400 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {step.status === 'COMPLETED' ? '✓' : step.status === 'IN_PROGRESS' ? '▶' : idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${step.status === 'COMPLETED' ? 'text-bgn-green-700' : step.status === 'IN_PROGRESS' ? 'text-blue-700' : 'text-gray-700'}`}>
                      {step.templateStep?.namaTahap ?? `Step ${idx + 1}`}
                    </p>
                    <div className="flex gap-3 text-xs text-gray-400 mt-0.5">
                      {estimasi && <span>Estimasi: {estimasi} mnt</span>}
                      {durasi !== null && <span className={durasi > (estimasi ?? Infinity) ? 'text-orange-500' : 'text-bgn-green-600'}>Aktual: {durasi} mnt</span>}
                      {step.catatan && <span className="text-gray-500">{step.catatan}</span>}
                    </div>
                  </div>
                  {prod.status === 'IN_PROGRESS' && (
                    <div className="flex gap-1">
                      {step.status === 'PENDING' && (
                        <button onClick={() => mulaiSopMutation.mutate(step.id)} disabled={mulaiSopMutation.isPending}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 disabled:opacity-50">Mulai</button>
                      )}
                      {step.status === 'IN_PROGRESS' && (
                        <button onClick={() => selesaiSopMutation.mutate(step.id)} disabled={selesaiSopMutation.isPending}
                          className="bg-bgn-green-400 text-white px-3 py-1 rounded text-xs hover:bg-bgn-green-500 disabled:opacity-50">Selesai</button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
