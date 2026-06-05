# Frontend Grup B — BahanBaku Detail + Produksi Detail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tambah BahanBakuDetailPage (dengan StokBatch) dan ProduksiDetailPage (dengan BiayaProduksi + QC Checklist) ke frontend.

**Architecture:** Tiga API client baru (stok-batch, biaya-produksi, qc) + tiga types baru. Dua halaman detail baru mengikuti pola existing pages. Update BahanBakuListPage dan ProduksiListPage untuk link ke detail. Fix route `/produksi/:id` yang salah.

**Tech Stack:** React 18, TanStack Query, Tailwind CSS BGN palette. Project: `/home/wanda/mbg-web`

---

## File Structure

| Action | Path | Tanggung Jawab |
|--------|------|----------------|
| Modify | `src/types/index.ts` | Tambah StokBatch, BiayaProduksiItem, QcHasil, QcTemplateItem types |
| Create | `src/api/endpoints/stok-batch.ts` | API client untuk batch stok |
| Create | `src/api/endpoints/biaya-produksi.ts` | API client untuk biaya produksi |
| Create | `src/api/endpoints/qc.ts` | API client untuk QC template + hasil |
| Create | `src/pages/bahan-baku/BahanBakuDetailPage.tsx` | Detail bahan + tabel batch + form manual |
| Modify | `src/pages/bahan-baku/BahanBakuListPage.tsx` | Tambah link ke detail |
| Create | `src/pages/produksi/ProduksiDetailPage.tsx` | Detail produksi + biaya + QC |
| Modify | `src/pages/produksi/ProduksiListPage.tsx` | Tambah link ke detail |
| Modify | `src/App.tsx` | Tambah route bahan-baku/:id + fix produksi/:id |

---

## Task 1: Types + API Clients Baru

**Files:**
- Modify: `src/types/index.ts`
- Create: `src/api/endpoints/stok-batch.ts`
- Create: `src/api/endpoints/biaya-produksi.ts`
- Create: `src/api/endpoints/qc.ts`

- [ ] **Step 1: Tambah types baru ke `src/types/index.ts`**

Pertama, update interface `Produksi` yang sudah ada — tambahkan 3 field baru setelah field `needReview`:
```typescript
// Di dalam interface Produksi yang sudah ada, setelah needReview:
totalBiaya: number
costPerPorsi: number
qcSelesai: boolean
```

Kemudian tambahkan di akhir file:

```typescript
// ─── Stok Batch ───────────────────────────────────────────────────
export interface StokBatch {
  id: string
  sppgId: string
  bahanBakuId: string
  bahanBaku?: { nama: string; satuan: string }
  pengadaanId: string | null
  lokasiId: string | null
  lokasi?: { nama: string; tipe: string } | null
  jumlahMasuk: number
  jumlahTersisa: number
  tanggalMasuk: string
  tanggalKadaluarsa: string | null
  hargaSatuan: number
  catatan: string | null
  createdAt: string
}

// ─── Biaya Produksi ───────────────────────────────────────────────
export type KategoriBiaya = 'BAHAN_BAKU' | 'UPAH' | 'UTILITAS' | 'LAINNYA'

export interface BiayaProduksiItem {
  id: string
  produksiId: string
  sppgId: string
  kategori: KategoriBiaya
  deskripsi: string
  jumlah: number
  createdAt: string
}

export interface BiayaSummary {
  items: BiayaProduksiItem[]
  totalBiaya: number
  costPerPorsi: number
}

// ─── QC ───────────────────────────────────────────────────────────
export interface QcTemplateItem {
  id: string
  sppgId: string
  namaCheck: string
  urutan: number
  isActive: boolean
}

export interface QcHasil {
  id: string
  produksiId: string
  templateItemId: string
  templateItem?: QcTemplateItem
  passed: boolean
  catatan: string | null
  checkedById: string | null
  checkedAt: string | null
}
```

- [ ] **Step 2: Buat `src/api/endpoints/stok-batch.ts`**

```typescript
import { api } from '@/api/axios'
import type { ApiResponse, StokBatch } from '@/types'

export const stokBatchApi = {
  getBahan: (bahanBakuId: string) =>
    api.get<ApiResponse<StokBatch[]>>(`/bahan-baku/${bahanBakuId}/batches`),
  createManual: (bahanBakuId: string, data: {
    bahanBakuId: string
    jumlahMasuk: number
    tanggalMasuk: string
    tanggalKadaluarsa?: string
    hargaSatuan?: number
    lokasiId?: string
    catatan?: string
  }) => api.post<ApiResponse<StokBatch>>(`/bahan-baku/${bahanBakuId}/batches`, data),
  update: (id: string, data: { lokasiId?: string | null; tanggalKadaluarsa?: string | null }) =>
    api.patch<ApiResponse<StokBatch>>(`/stok-batch/${id}`, data),
  expiring: (days = 7) =>
    api.get<ApiResponse<StokBatch[]>>(`/stok-batch/expiring?days=${days}`),
}
```

- [ ] **Step 3: Buat `src/api/endpoints/biaya-produksi.ts`**

```typescript
import { api } from '@/api/axios'
import type { ApiResponse, BiayaSummary, BiayaProduksiItem } from '@/types'

export const biayaApi = {
  get: (produksiId: string) =>
    api.get<ApiResponse<BiayaSummary>>(`/produksi/${produksiId}/biaya`),
  tambah: (produksiId: string, data: { kategori: string; deskripsi: string; jumlah: number }) =>
    api.post<ApiResponse<BiayaProduksiItem>>(`/produksi/${produksiId}/biaya`, data),
  hapus: (produksiId: string, itemId: string) =>
    api.delete(`/produksi/${produksiId}/biaya/${itemId}`),
}
```

- [ ] **Step 4: Buat `src/api/endpoints/qc.ts`**

```typescript
import { api } from '@/api/axios'
import type { ApiResponse, QcTemplateItem, QcHasil, Produksi } from '@/types'

export const qcApi = {
  getTemplate: () =>
    api.get<ApiResponse<QcTemplateItem[]>>('/qc-template'),
  getHasil: (produksiId: string) =>
    api.get<ApiResponse<QcHasil[]>>(`/produksi/${produksiId}/qc`),
  init: (produksiId: string) =>
    api.post<ApiResponse<QcHasil[]>>(`/produksi/${produksiId}/qc/init`),
  centang: (produksiId: string, hasilId: string, data: { passed: boolean; catatan?: string }) =>
    api.patch<ApiResponse<QcHasil>>(`/produksi/${produksiId}/qc/${hasilId}`, data),
  selesai: (produksiId: string) =>
    api.post<ApiResponse<Produksi>>(`/produksi/${produksiId}/qc/selesai`),
}
```

- [ ] **Step 5: TypeScript check + commit**

```bash
cd /home/wanda/mbg-web && npx tsc --noEmit 2>&1 | head -10
```

```bash
cd /home/wanda/mbg-web
git add src/types/index.ts \
        src/api/endpoints/stok-batch.ts \
        src/api/endpoints/biaya-produksi.ts \
        src/api/endpoints/qc.ts
git commit -m "feat(frontend): types StokBatch+Biaya+QC, API clients baru"
```

---

## Task 2: BahanBakuDetailPage

**Files:**
- Create: `src/pages/bahan-baku/BahanBakuDetailPage.tsx`

- [ ] **Step 1: Buat `src/pages/bahan-baku/BahanBakuDetailPage.tsx`**

```tsx
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { bahanBakuApi } from '@/api/endpoints/bahan-baku'
import { stokBatchApi } from '@/api/endpoints/stok-batch'
import { StatusBadge } from '@/components/StatusBadge'
import { getErrorMessage } from '@/utils/error'

const formatRp = (n: number) => `Rp ${Number(n).toLocaleString('id-ID')}`

function getDaysUntilExpiry(tanggal: string | null): number | null {
  if (!tanggal) return null
  const diff = new Date(tanggal).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function BahanBakuDetailPage() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const [showBatchForm, setShowBatchForm] = useState(false)
  const [batchJumlah, setBatchJumlah] = useState('')
  const [batchTanggal, setBatchTanggal] = useState('')
  const [batchKadaluarsa, setBatchKadaluarsa] = useState('')
  const [batchHarga, setBatchHarga] = useState('')
  const [error, setError] = useState('')

  const { data: bahanData, isLoading } = useQuery({
    queryKey: ['bahan-baku', id],
    queryFn: () => bahanBakuApi.getOne(id!),
    enabled: !!id,
  })

  const { data: batchData } = useQuery({
    queryKey: ['stok-batch', id],
    queryFn: () => stokBatchApi.getBahan(id!),
    enabled: !!id,
  })

  const createBatchMutation = useMutation({
    mutationFn: () => stokBatchApi.createManual(id!, {
      bahanBakuId: id!,
      jumlahMasuk: parseFloat(batchJumlah),
      tanggalMasuk: batchTanggal,
      tanggalKadaluarsa: batchKadaluarsa || undefined,
      hargaSatuan: batchHarga ? parseFloat(batchHarga) : undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stok-batch', id] })
      qc.invalidateQueries({ queryKey: ['bahan-baku', id] })
      setShowBatchForm(false)
      setBatchJumlah(''); setBatchTanggal(''); setBatchKadaluarsa(''); setBatchHarga('')
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  if (isLoading) return <p className="text-gray-500">Memuat...</p>
  const bahan = bahanData?.data.data
  if (!bahan) return <p className="text-red-500">Data tidak ditemukan</p>

  const batches = batchData?.data.data ?? []
  const expiringBatches = batches.filter(b => {
    const days = getDaysUntilExpiry(b.tanggalKadaluarsa)
    return days !== null && days <= 7 && b.jumlahTersisa > 0
  })

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/bahan-baku" className="text-bgn-800 hover:underline text-sm">← Bahan Baku</Link>
        <span className="text-gray-400">/</span>
        <h1 className="text-2xl font-bold text-bgn-900">{bahan.nama}</h1>
        <StatusBadge status={bahan.statusStok} />
      </div>

      {/* Alert expiring */}
      {expiringBatches.length > 0 && (
        <div className="bg-orange-50 border border-orange-300 rounded-lg p-4 mb-4 text-sm text-orange-700">
          ⚠ <strong>{expiringBatches.length} batch</strong> akan kadaluarsa dalam 7 hari!
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}

      {/* Info bahan */}
      <div className="bg-white rounded-xl shadow-md border border-bgn-100 p-5 mb-4">
        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
          <div><span className="text-gray-500">Satuan:</span> <span className="font-medium">{bahan.satuan}</span></div>
          <div><span className="text-gray-500">Kategori:</span> <span className="font-medium">{bahan.kategori ?? '-'}</span></div>
          <div><span className="text-gray-500">Stok Minimum:</span> <span className="font-medium">{bahan.stokMinimum} {bahan.satuan}</span></div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Stok Akhir', value: `${bahan.stokAkhir} ${bahan.satuan}`, color: bahan.statusStok !== 'NORMAL' ? 'text-red-600' : 'text-bgn-green-700' },
            { label: 'Stok Masuk', value: `${bahan.stokMasuk} ${bahan.satuan}` },
            { label: 'Stok Keluar', value: `${bahan.stokKeluar} ${bahan.satuan}` },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center p-3 bg-bgn-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`font-bold ${color ?? 'text-gray-800'}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stok Batch */}
      <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-bgn-100">
          <h2 className="font-semibold text-bgn-900">Batch Stok</h2>
          <button onClick={() => setShowBatchForm(!showBatchForm)}
            className="bg-bgn-green-400 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-bgn-green-500">
            + Input Batch Manual
          </button>
        </div>

        {showBatchForm && (
          <div className="p-5 border-b border-bgn-100 bg-bgn-50">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Jumlah ({bahan.satuan})</label>
                <input type="number" value={batchJumlah} onChange={(e) => setBatchJumlah(e.target.value)} placeholder="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Masuk</label>
                <input type="date" value={batchTanggal} onChange={(e) => setBatchTanggal(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Kadaluarsa (opsional)</label>
                <input type="date" value={batchKadaluarsa} onChange={(e) => setBatchKadaluarsa(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Harga Satuan (opsional)</label>
                <input type="number" value={batchHarga} onChange={(e) => setBatchHarga(e.target.value)} placeholder="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => createBatchMutation.mutate()}
                disabled={!batchJumlah || !batchTanggal || createBatchMutation.isPending}
                className="bg-bgn-green-400 text-white px-5 py-2 rounded-lg text-sm hover:bg-bgn-green-500 disabled:opacity-50">
                {createBatchMutation.isPending ? 'Menyimpan...' : 'Simpan Batch'}
              </button>
              <button onClick={() => setShowBatchForm(false)} className="border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
                Batal
              </button>
            </div>
          </div>
        )}

        {batches.length === 0 ? (
          <p className="px-5 py-8 text-center text-gray-400 text-sm">Belum ada data batch stok</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-bgn-200">
              <tr>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Masuk</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Kadaluarsa</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Jumlah Masuk</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Sisa</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Lokasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bgn-100">
              {batches.map((b) => {
                const days = getDaysUntilExpiry(b.tanggalKadaluarsa)
                return (
                  <tr key={b.id} className="odd:bg-white even:bg-bgn-50">
                    <td className="px-4 py-3 text-gray-700">{b.tanggalMasuk}</td>
                    <td className="px-4 py-3">
                      {b.tanggalKadaluarsa ? (
                        <span className={`text-xs font-medium ${days !== null && days <= 3 ? 'text-red-600' : days !== null && days <= 7 ? 'text-orange-600' : 'text-gray-600'}`}>
                          {b.tanggalKadaluarsa}
                          {days !== null && days <= 7 && (
                            <span className={`ml-1 px-1.5 py-0.5 rounded text-xs ${days <= 3 ? 'bg-red-100' : 'bg-orange-100'}`}>
                              {days}h lagi
                            </span>
                          )}
                        </span>
                      ) : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{b.jumlahMasuk} {bahan.satuan}</td>
                    <td className={`px-4 py-3 font-medium ${Number(b.jumlahTersisa) <= 0 ? 'text-gray-400 line-through' : 'text-bgn-900'}`}>
                      {b.jumlahTersisa} {bahan.satuan}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{b.lokasi?.nama ?? '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd /home/wanda/mbg-web && npx tsc --noEmit 2>&1 | head -10
```

- [ ] **Step 3: Commit**

```bash
cd /home/wanda/mbg-web
git add src/pages/bahan-baku/BahanBakuDetailPage.tsx
git commit -m "feat(frontend): BahanBakuDetailPage dengan stok batch + form manual"
```

---

## Task 3: ProduksiDetailPage

**Files:**
- Create: `src/pages/produksi/ProduksiDetailPage.tsx`

- [ ] **Step 1: Buat `src/pages/produksi/ProduksiDetailPage.tsx`**

```tsx
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { produksiApi } from '@/api/endpoints/produksi'
import { biayaApi } from '@/api/endpoints/biaya-produksi'
import { qcApi } from '@/api/endpoints/qc'
import { StatusBadge } from '@/components/StatusBadge'
import { getErrorMessage } from '@/utils/error'
import type { KategoriBiaya } from '@/types'

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

  const tambahBiayaMutation = useMutation({
    mutationFn: () => biayaApi.tambah(id!, { kategori: biayaKategori, deskripsi: biayaDeskripsi, jumlah: parseFloat(biayaJumlah) }),
    onSuccess: () => {
      refetchBiaya()
      setShowBiayaForm(false)
      setBiayaDeskripsi(''); setBiayaJumlah('')
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const hapusBiayaMutation = useMutation({
    mutationFn: (itemId: string) => biayaApi.hapus(id!, itemId),
    onSuccess: () => refetchBiaya(),
    onError: (err) => setError(getErrorMessage(err)),
  })

  const initQcMutation = useMutation({
    mutationFn: () => qcApi.init(id!),
    onSuccess: () => refetchQc(),
    onError: (err) => setError(getErrorMessage(err)),
  })

  const centangMutation = useMutation({
    mutationFn: ({ hasilId, passed, catatan }: { hasilId: string; passed: boolean; catatan?: string }) =>
      qcApi.centang(id!, hasilId, { passed, catatan }),
    onSuccess: () => refetchQc(),
  })

  const selesaiQcMutation = useMutation({
    mutationFn: () => qcApi.selesai(id!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['produksi', id] }); refetchQc() },
    onError: (err) => setError(getErrorMessage(err)),
  })

  if (isLoading) return <p className="text-gray-500">Memuat...</p>
  const prod = prodData?.data.data
  if (!prod) return <p className="text-red-500">Data tidak ditemukan</p>

  const biaya = biayaData?.data.data
  const hasilList = qcData?.data.data ?? []

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
            {hasilList.map(hasil => (
              <div key={hasil.id} className={`flex items-center gap-3 px-5 py-3 ${hasil.passed ? 'bg-bgn-green-50' : hasil.checkedAt ? 'bg-red-50' : 'bg-white'}`}>
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
                <div className="flex-1">
                  <p className={`text-sm ${hasil.passed ? 'text-bgn-green-700 font-medium' : hasil.checkedAt ? 'text-red-600' : 'text-gray-700'}`}>
                    {hasil.templateItem?.namaCheck ?? `Item ${hasil.templateItemId.slice(0,6)}`}
                  </p>
                  {hasil.catatan && <p className="text-xs text-gray-500 mt-0.5">{hasil.catatan}</p>}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  hasil.passed ? 'bg-bgn-green-100 text-bgn-green-700' :
                  hasil.checkedAt ? 'bg-red-100 text-red-600' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {hasil.passed ? 'Lulus' : hasil.checkedAt ? 'Gagal' : 'Belum'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd /home/wanda/mbg-web && npx tsc --noEmit 2>&1 | head -10
```

- [ ] **Step 3: Commit**

```bash
cd /home/wanda/mbg-web
git add src/pages/produksi/ProduksiDetailPage.tsx
git commit -m "feat(frontend): ProduksiDetailPage dengan biaya produksi + QC checklist"
```

---

## Task 4: Update Lists + App.tsx Routes

**Files:**
- Modify: `src/pages/bahan-baku/BahanBakuListPage.tsx`
- Modify: `src/pages/produksi/ProduksiListPage.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Update BahanBakuListPage — nama bahan jadi link ke detail**

Buka `src/pages/bahan-baku/BahanBakuListPage.tsx`. Cari cell nama bahan baku di tabel (biasanya `{b.nama}` di dalam `<td>`). Ganti dengan:

```tsx
<Link to={`/bahan-baku/${b.id}`} className="text-bgn-800 hover:underline font-medium">
  {b.nama}
</Link>
```

Pastikan `Link` sudah di-import dari `react-router-dom`.

- [ ] **Step 2: Update ProduksiListPage — nama/tanggal produksi jadi link ke detail**

Buka `src/pages/produksi/ProduksiListPage.tsx`. Cari identifier produksi di tabel (tanggal atau nama menu). Tambahkan link ke detail:

```tsx
<Link to={`/produksi/${p.id}`} className="text-bgn-800 hover:underline font-medium">
  Produksi {p.tanggal}
</Link>
```

Pastikan baris yang sudah ada tidak duplikasi navigasi.

- [ ] **Step 3: Update App.tsx**

Buka `src/App.tsx`. Tambahkan import dan routes baru:

Import:
```typescript
import { BahanBakuDetailPage } from '@/pages/bahan-baku/BahanBakuDetailPage'
import { ProduksiDetailPage } from '@/pages/produksi/ProduksiDetailPage'
```

Tambahkan route `bahan-baku/:id` setelah route `bahan-baku/:id/edit`:
```tsx
<Route path="bahan-baku/:id" element={<BahanBakuDetailPage />} />
```

Ganti route `produksi/:id` yang salah (sekarang → `ProduksiListPage`) dengan:
```tsx
<Route path="produksi/:id" element={<ProduksiDetailPage />} />
```

- [ ] **Step 4: TypeScript check + semua test**

```bash
cd /home/wanda/mbg-web && npx tsc --noEmit 2>&1 | head -10
```

- [ ] **Step 5: Commit**

```bash
cd /home/wanda/mbg-web
git add src/pages/bahan-baku/BahanBakuListPage.tsx \
        src/pages/produksi/ProduksiListPage.tsx \
        src/App.tsx
git commit -m "feat(frontend): link ke detail di BahanBakuList+ProduksiList, fix route produksi/:id"
```

---

## Task 5: Visual Smoke Test

- [ ] **Step 1: Pastikan dev server running**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/
```

Expected: `200`

- [ ] **Step 2: Screenshot BahanBakuDetail**

Gunakan Playwright MCP — navigate ke `http://localhost:5173/bahan-baku`, klik nama bahan baku pertama. Screenshot halaman detail. Verifikasi:
- Header nama bahan + status badge
- Info grid stok akhir/masuk/keluar
- Tabel batch (mungkin kosong tapi tampil)
- Tombol "+ Input Batch Manual"

- [ ] **Step 3: Screenshot ProduksiDetail**

Navigate ke `http://localhost:5173/produksi`, klik link produksi pertama. Screenshot. Verifikasi:
- Info porsi diproduksi/gagal
- Section "Biaya Produksi"
- Section "QC Checklist" dengan tombol Init QC

- [ ] **Step 4: Push ke GitHub**

```bash
cd /home/wanda/mbg-web && git push origin master
```
