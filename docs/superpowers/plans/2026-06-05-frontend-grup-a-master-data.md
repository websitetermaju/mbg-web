# Frontend Grup A — Master Data Baru Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Buat halaman CRUD untuk Supplier, Resep/BOM, dan Lokasi Gudang — 7 halaman baru + 3 API clients + types baru.

**Architecture:** Ikuti pola existing pages. Semua CRUD standar dengan TanStack Query. ResepDetailPage punya item management inline dan preview kebutuhan bahan.

**Tech Stack:** React 18, TanStack Query, Tailwind CSS BGN palette. Project: `/home/wanda/mbg-web`

---

## File Structure

| Action | Path |
|--------|------|
| Modify | `src/types/index.ts` — tambah Supplier, Resep, ResepItem, LokasiGudang types |
| Create | `src/api/endpoints/supplier.ts` |
| Create | `src/api/endpoints/resep.ts` |
| Create | `src/api/endpoints/lokasi-gudang.ts` |
| Create | `src/pages/supplier/SupplierListPage.tsx` |
| Create | `src/pages/supplier/SupplierFormPage.tsx` |
| Create | `src/pages/resep/ResepListPage.tsx` |
| Create | `src/pages/resep/ResepFormPage.tsx` |
| Create | `src/pages/resep/ResepDetailPage.tsx` |
| Create | `src/pages/lokasi-gudang/LokasiGudangPage.tsx` |
| Modify | `src/App.tsx` — tambah 7 routes |
| Modify | `src/components/Layout.tsx` — tambah 3 nav items |

---

## Task 1: Types + API Clients

- [ ] **Step 1: Tambah types ke `src/types/index.ts`**

Tambahkan di akhir file:

```typescript
// ─── Supplier ─────────────────────────────────────────────────────
export type JenisUsaha = 'PT' | 'CV' | 'KOPERASI' | 'UMKM' | 'PERORANGAN'
export type KategoriSupplier = 'BAHAN_SEGAR' | 'BAHAN_KERING' | 'BUMBU_REMPAH' | 'KEMASAN' | 'LAINNYA'
export type TerminBayar = 'COD' | 'NET_7' | 'NET_14' | 'NET_30'

export interface Supplier {
  id: string
  sppgId: string
  nama: string
  jenisUsaha: JenisUsaha
  npwp: string | null
  namaPic: string
  telepon: string
  email: string | null
  alamat: string | null
  kota: string | null
  namaBank: string | null
  noRekening: string | null
  atasNama: string | null
  terminBayar: TerminBayar
  kategori: KategoriSupplier
  minOrder: number | null
  leadTime: number | null
  catatan: string | null
  isActive: boolean
  createdAt: string
}

// ─── Resep ────────────────────────────────────────────────────────
export interface ResepItem {
  id: string
  resepId: string
  bahanBakuId: string
  bahanBaku?: { nama: string; satuan: string }
  jumlahPerPorsi: number
  catatan: string | null
}

export interface Resep {
  id: string
  sppgId: string
  nama: string
  jenisPenerima: JenisPenerima
  deskripsi: string | null
  isActive: boolean
  items: ResepItem[]
  createdAt: string
}

export interface KebutuhanBahan {
  bahanBakuId: string
  nama: string
  satuan: string
  jumlahPerPorsi: number
  kebutuhan: number
  stokTersedia: number
  cukup: boolean
}

export interface PreviewKebutuhan {
  jumlahPorsi: number
  items: KebutuhanBahan[]
  semuaCukup: boolean
}

// ─── Lokasi Gudang ────────────────────────────────────────────────
export type TipeLokasiGudang = 'KERING' | 'DINGIN' | 'BEKU'

export interface LokasiGudang {
  id: string
  sppgId: string
  nama: string
  tipe: TipeLokasiGudang
  keterangan: string | null
  isActive: boolean
  createdAt: string
}
```

- [ ] **Step 2: Buat `src/api/endpoints/supplier.ts`**

```typescript
import { api } from '@/api/axios'
import type { ApiResponse, Supplier } from '@/types'

export const supplierApi = {
  list: (params?: { page?: number; limit?: number; kategori?: string; isActive?: boolean }) =>
    api.get<ApiResponse<Supplier[]>>('/supplier', { params }),
  getOne: (id: string) => api.get<ApiResponse<Supplier>>(`/supplier/${id}`),
  create: (data: Partial<Supplier>) => api.post<ApiResponse<Supplier>>('/supplier', data),
  update: (id: string, data: Partial<Supplier>) => api.patch<ApiResponse<Supplier>>(`/supplier/${id}`, data),
  delete: (id: string) => api.delete(`/supplier/${id}`),
}
```

- [ ] **Step 3: Buat `src/api/endpoints/resep.ts`**

```typescript
import { api } from '@/api/axios'
import type { ApiResponse, Resep, ResepItem, PreviewKebutuhan } from '@/types'

export const resepApi = {
  list: (params?: { page?: number; limit?: number; jenisPenerima?: string; isActive?: boolean }) =>
    api.get<ApiResponse<Resep[]>>('/resep', { params }),
  getOne: (id: string) => api.get<ApiResponse<Resep>>(`/resep/${id}`),
  create: (data: { nama: string; jenisPenerima: string; deskripsi?: string }) =>
    api.post<ApiResponse<Resep>>('/resep', data),
  update: (id: string, data: Partial<{ nama: string; deskripsi: string; isActive: boolean }>) =>
    api.patch<ApiResponse<Resep>>(`/resep/${id}`, data),
  delete: (id: string) => api.delete(`/resep/${id}`),
  addItem: (id: string, data: { bahanBakuId: string; jumlahPerPorsi: number; catatan?: string }) =>
    api.post<ApiResponse<ResepItem>>(`/resep/${id}/items`, data),
  updateItem: (id: string, itemId: string, data: { jumlahPerPorsi?: number; catatan?: string }) =>
    api.patch<ApiResponse<ResepItem>>(`/resep/${id}/items/${itemId}`, data),
  removeItem: (id: string, itemId: string) =>
    api.delete(`/resep/${id}/items/${itemId}`),
  kebutuhan: (id: string, jumlahPorsi: number) =>
    api.get<ApiResponse<PreviewKebutuhan>>(`/resep/${id}/kebutuhan?jumlahPorsi=${jumlahPorsi}`),
}
```

- [ ] **Step 4: Buat `src/api/endpoints/lokasi-gudang.ts`**

```typescript
import { api } from '@/api/axios'
import type { ApiResponse, LokasiGudang } from '@/types'

export const lokasiGudangApi = {
  list: (params?: { tipe?: string; isActive?: boolean }) =>
    api.get<ApiResponse<LokasiGudang[]>>('/lokasi-gudang', { params }),
  create: (data: { nama: string; tipe: string; keterangan?: string }) =>
    api.post<ApiResponse<LokasiGudang>>('/lokasi-gudang', data),
  update: (id: string, data: Partial<{ nama: string; tipe: string; keterangan: string; isActive: boolean }>) =>
    api.patch<ApiResponse<LokasiGudang>>(`/lokasi-gudang/${id}`, data),
  delete: (id: string) => api.delete(`/lokasi-gudang/${id}`),
}
```

- [ ] **Step 5: TypeScript check + commit**

```bash
cd /home/wanda/mbg-web && npx tsc --noEmit 2>&1 | head -10
```

```bash
cd /home/wanda/mbg-web
git add src/types/index.ts src/api/endpoints/supplier.ts src/api/endpoints/resep.ts src/api/endpoints/lokasi-gudang.ts
git commit -m "feat(frontend): types Supplier+Resep+Lokasi, API clients Grup A"
```

---

## Task 2: Supplier Pages

- [ ] **Step 1: Buat `src/pages/supplier/SupplierListPage.tsx`**

```tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supplierApi } from '@/api/endpoints/supplier'
import { Pagination } from '@/components/Pagination'

const KATEGORI_LABELS: Record<string, string> = {
  BAHAN_SEGAR: 'Bahan Segar', BAHAN_KERING: 'Bahan Kering',
  BUMBU_REMPAH: 'Bumbu', KEMASAN: 'Kemasan', LAINNYA: 'Lainnya',
}

export function SupplierListPage() {
  const [page, setPage] = useState(1)
  const [kategori, setKategori] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['supplier', page, kategori],
    queryFn: () => supplierApi.list({ page, limit: 20, ...(kategori ? { kategori } : {}) }),
  })

  const deleteMutation = useMutation({
    mutationFn: supplierApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['supplier'] }),
  })

  const items = data?.data.data ?? []
  const meta = data?.data.meta

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-bgn-900">Supplier</h1>
        <Link to="/supplier/baru" className="bg-bgn-green-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-bgn-green-500">
          + Tambah Supplier
        </Link>
      </div>
      <div className="mb-4">
        <select value={kategori} onChange={(e) => { setKategori(e.target.value); setPage(1) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none">
          <option value="">Semua Kategori</option>
          {Object.entries(KATEGORI_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      {isLoading ? <p className="text-gray-500">Memuat...</p> : (
        <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bgn-200">
              <tr>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Nama</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Kategori</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">PIC</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Termin</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bgn-100">
              {items.map((s) => (
                <tr key={s.id} className="odd:bg-white even:bg-bgn-50 hover:bg-bgn-100 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-bgn-900">{s.nama}</p>
                    <p className="text-xs text-gray-500">{s.jenisUsaha} • {s.kota ?? '-'}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{KATEGORI_LABELS[s.kategori] ?? s.kategori}</td>
                  <td className="px-4 py-3">
                    <p className="text-gray-700 text-xs">{s.namaPic}</p>
                    <p className="text-gray-500 text-xs">{s.telepon}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{s.terminBayar.replace('_', ' ')}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.isActive ? 'bg-bgn-green-100 text-bgn-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {s.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Link to={`/supplier/${s.id}/edit`} className="text-bgn-800 hover:underline text-xs">Edit</Link>
                      <button onClick={() => { if (confirm('Hapus supplier?')) deleteMutation.mutate(s.id) }}
                        className="text-red-500 hover:underline text-xs">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Belum ada supplier</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} totalPages={meta?.totalPages ?? 1} onPageChange={setPage} />
    </div>
  )
}
```

- [ ] **Step 2: Buat `src/pages/supplier/SupplierFormPage.tsx`**

```tsx
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supplierApi } from '@/api/endpoints/supplier'
import { getErrorMessage } from '@/utils/error'
import { useState } from 'react'
import type { JenisUsaha, KategoriSupplier, TerminBayar } from '@/types'

export function SupplierFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    nama: '', jenisUsaha: 'CV' as JenisUsaha, npwp: '',
    namaPic: '', telepon: '', email: '', alamat: '', kota: '',
    namaBank: '', noRekening: '', atasNama: '',
    terminBayar: 'COD' as TerminBayar, kategori: 'LAINNYA' as KategoriSupplier,
    minOrder: '', leadTime: '', catatan: '', isActive: true,
  })

  const { isLoading: loadingExisting } = useQuery({
    queryKey: ['supplier', id],
    queryFn: () => supplierApi.getOne(id!),
    enabled: isEdit,
    select: (res) => {
      const d = res.data.data
      setForm({
        nama: d.nama, jenisUsaha: d.jenisUsaha, npwp: d.npwp ?? '',
        namaPic: d.namaPic, telepon: d.telepon, email: d.email ?? '',
        alamat: d.alamat ?? '', kota: d.kota ?? '',
        namaBank: d.namaBank ?? '', noRekening: d.noRekening ?? '', atasNama: d.atasNama ?? '',
        terminBayar: d.terminBayar, kategori: d.kategori,
        minOrder: d.minOrder?.toString() ?? '', leadTime: d.leadTime?.toString() ?? '',
        catatan: d.catatan ?? '', isActive: d.isActive,
      })
      return res.data.data
    },
  })

  const mutation = useMutation({
    mutationFn: (data: typeof form) => {
      const payload = {
        ...data,
        npwp: data.npwp || undefined, email: data.email || undefined,
        alamat: data.alamat || undefined, kota: data.kota || undefined,
        namaBank: data.namaBank || undefined, noRekening: data.noRekening || undefined,
        atasNama: data.atasNama || undefined,
        minOrder: data.minOrder ? parseFloat(data.minOrder) : undefined,
        leadTime: data.leadTime ? parseInt(data.leadTime) : undefined,
        catatan: data.catatan || undefined,
      }
      return isEdit ? supplierApi.update(id!, payload) : supplierApi.create(payload)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['supplier'] }); navigate('/supplier') },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const set = (field: string, value: string | boolean) => setForm(f => ({ ...f, [field]: value }))
  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none"
  const labelCls = "block text-sm font-medium text-gray-700 mb-1"

  if (isEdit && loadingExisting) return <p className="text-gray-500">Memuat...</p>

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-bgn-900 mb-6">{isEdit ? 'Edit Supplier' : 'Tambah Supplier'}</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form) }} className="space-y-5">
        {/* Identitas */}
        <div className="bg-white rounded-xl border border-bgn-100 p-5 shadow-md space-y-3">
          <h2 className="font-semibold text-bgn-900 text-sm uppercase tracking-wide">Identitas Bisnis</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className={labelCls}>Nama Usaha *</label>
              <input value={form.nama} onChange={(e) => set('nama', e.target.value)} required className={inputCls} /></div>
            <div><label className={labelCls}>Jenis Usaha *</label>
              <select value={form.jenisUsaha} onChange={(e) => set('jenisUsaha', e.target.value)} className={inputCls}>
                {(['PT','CV','KOPERASI','UMKM','PERORANGAN'] as JenisUsaha[]).map(v => <option key={v} value={v}>{v}</option>)}</select></div>
            <div><label className={labelCls}>NPWP</label>
              <input value={form.npwp} onChange={(e) => set('npwp', e.target.value)} placeholder="01.234.567.8" className={inputCls} /></div>
          </div>
        </div>
        {/* Kontak */}
        <div className="bg-white rounded-xl border border-bgn-100 p-5 shadow-md space-y-3">
          <h2 className="font-semibold text-bgn-900 text-sm uppercase tracking-wide">Kontak</h2>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Nama PIC *</label>
              <input value={form.namaPic} onChange={(e) => set('namaPic', e.target.value)} required className={inputCls} /></div>
            <div><label className={labelCls}>Telepon *</label>
              <input value={form.telepon} onChange={(e) => set('telepon', e.target.value)} required className={inputCls} /></div>
            <div><label className={labelCls}>Email</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>Kota</label>
              <input value={form.kota} onChange={(e) => set('kota', e.target.value)} className={inputCls} /></div>
            <div className="col-span-2"><label className={labelCls}>Alamat</label>
              <textarea value={form.alamat} onChange={(e) => set('alamat', e.target.value)} rows={2} className={inputCls} /></div>
          </div>
        </div>
        {/* Keuangan */}
        <div className="bg-white rounded-xl border border-bgn-100 p-5 shadow-md space-y-3">
          <h2 className="font-semibold text-bgn-900 text-sm uppercase tracking-wide">Keuangan & Operasional</h2>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Kategori *</label>
              <select value={form.kategori} onChange={(e) => set('kategori', e.target.value)} className={inputCls}>
                {['BAHAN_SEGAR','BAHAN_KERING','BUMBU_REMPAH','KEMASAN','LAINNYA'].map(v => <option key={v} value={v}>{v.replace('_',' ')}</option>)}</select></div>
            <div><label className={labelCls}>Termin Bayar *</label>
              <select value={form.terminBayar} onChange={(e) => set('terminBayar', e.target.value)} className={inputCls}>
                {(['COD','NET_7','NET_14','NET_30'] as TerminBayar[]).map(v => <option key={v} value={v}>{v.replace('_',' ')}</option>)}</select></div>
            <div><label className={labelCls}>Bank</label>
              <input value={form.namaBank} onChange={(e) => set('namaBank', e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>No. Rekening</label>
              <input value={form.noRekening} onChange={(e) => set('noRekening', e.target.value)} className={inputCls} /></div>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={mutation.isPending}
            className="bg-bgn-green-400 text-white px-6 py-2 rounded-lg hover:bg-bgn-green-500 disabled:opacity-50">
            {mutation.isPending ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Supplier'}
          </button>
          <button type="button" onClick={() => navigate('/supplier')}
            className="border border-bgn-900 text-bgn-900 px-6 py-2 rounded-lg hover:bg-bgn-50">Batal</button>
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: TypeScript check + commit**

```bash
cd /home/wanda/mbg-web && npx tsc --noEmit 2>&1 | head -10
```

```bash
cd /home/wanda/mbg-web
git add src/pages/supplier/
git commit -m "feat(frontend): SupplierListPage + SupplierFormPage"
```

---

## Task 3: Resep Pages

- [ ] **Step 1: Buat `src/pages/resep/ResepListPage.tsx`**

```tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { resepApi } from '@/api/endpoints/resep'
import { Pagination } from '@/components/Pagination'
import type { JenisPenerima } from '@/types'

const JP_LABELS: Record<string, string> = {
  BALITA: 'Balita', SD: 'SD', SMP_SMA: 'SMP/SMA', IBU_HAMIL: 'Ibu Hamil', LANSIA: 'Lansia',
}

export function ResepListPage() {
  const [page, setPage] = useState(1)
  const [jp, setJp] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['resep', page, jp],
    queryFn: () => resepApi.list({ page, limit: 20, ...(jp ? { jenisPenerima: jp } : {}) }),
  })

  const deleteMutation = useMutation({
    mutationFn: resepApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resep'] }),
  })

  const items = data?.data.data ?? []
  const meta = data?.data.meta

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-bgn-900">Resep / BOM</h1>
        <Link to="/resep/baru" className="bg-bgn-green-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-bgn-green-500">
          + Buat Resep
        </Link>
      </div>
      <div className="mb-4">
        <select value={jp} onChange={(e) => { setJp(e.target.value); setPage(1) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none">
          <option value="">Semua Penerima</option>
          {Object.entries(JP_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      {isLoading ? <p className="text-gray-500">Memuat...</p> : (
        <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bgn-200">
              <tr>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Nama Resep</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Penerima</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Bahan</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bgn-100">
              {items.map((r) => (
                <tr key={r.id} className="odd:bg-white even:bg-bgn-50 hover:bg-bgn-100 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/resep/${r.id}`} className="font-medium text-bgn-800 hover:underline">{r.nama}</Link>
                    {r.deskripsi && <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{r.deskripsi}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{JP_LABELS[r.jenisPenerima] ?? r.jenisPenerima}</td>
                  <td className="px-4 py-3 text-gray-600">{r.items?.length ?? 0} bahan</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.isActive ? 'bg-bgn-green-100 text-bgn-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {r.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <Link to={`/resep/${r.id}`} className="text-bgn-800 hover:underline text-xs">Detail</Link>
                      <button onClick={() => { if (confirm('Hapus resep?')) deleteMutation.mutate(r.id) }}
                        className="text-red-500 hover:underline text-xs">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Belum ada resep</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} totalPages={meta?.totalPages ?? 1} onPageChange={setPage} />
    </div>
  )
}
```

- [ ] **Step 2: Buat `src/pages/resep/ResepFormPage.tsx`**

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { resepApi } from '@/api/endpoints/resep'
import { getErrorMessage } from '@/utils/error'
import type { JenisPenerima } from '@/types'

const JP_OPTIONS: JenisPenerima[] = ['BALITA', 'SD', 'SMP_SMA', 'IBU_HAMIL', 'LANSIA']

export function ResepFormPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [nama, setNama] = useState('')
  const [jenisPenerima, setJenisPenerima] = useState<JenisPenerima>('SD')
  const [deskripsi, setDeskripsi] = useState('')
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: () => resepApi.create({ nama, jenisPenerima, deskripsi: deskripsi || undefined }),
    onSuccess: (res) => { qc.invalidateQueries({ queryKey: ['resep'] }); navigate(`/resep/${res.data.data.id}`) },
    onError: (err) => setError(getErrorMessage(err)),
  })

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-bgn-900 mb-6">Buat Resep Baru</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate() }} className="bg-white rounded-xl border border-bgn-100 p-6 shadow-md space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Resep *</label>
          <input value={nama} onChange={(e) => setNama(e.target.value)} required placeholder="Nasi Ayam Goreng SD"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Jenis Penerima *</label>
          <select value={jenisPenerima} onChange={(e) => setJenisPenerima(e.target.value as JenisPenerima)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-green-400 focus:outline-none">
            {JP_OPTIONS.map(v => <option key={v} value={v}>{v.replace('_', '/')}</option>)}</select></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi (opsional)</label>
          <textarea value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" /></div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={mutation.isPending}
            className="bg-bgn-green-400 text-white px-6 py-2 rounded-lg hover:bg-bgn-green-500 disabled:opacity-50">
            {mutation.isPending ? 'Menyimpan...' : 'Buat Resep'}
          </button>
          <button type="button" onClick={() => navigate('/resep')}
            className="border border-bgn-900 text-bgn-900 px-6 py-2 rounded-lg hover:bg-bgn-50">Batal</button>
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: Buat `src/pages/resep/ResepDetailPage.tsx`**

```tsx
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { resepApi } from '@/api/endpoints/resep'
import { bahanBakuApi } from '@/api/endpoints/bahan-baku'
import { getErrorMessage } from '@/utils/error'

export function ResepDetailPage() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const [showItemForm, setShowItemForm] = useState(false)
  const [itemBahan, setItemBahan] = useState('')
  const [itemJumlah, setItemJumlah] = useState('')
  const [itemCatatan, setItemCatatan] = useState('')
  const [previewPorsi, setPreviewPorsi] = useState('')
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['resep', id],
    queryFn: () => resepApi.getOne(id!),
    enabled: !!id,
  })

  const { data: bahanList } = useQuery({
    queryKey: ['bahan-baku', 'all'],
    queryFn: () => bahanBakuApi.list({ limit: 200 }),
  })

  const { data: previewData, refetch: refetchPreview } = useQuery({
    queryKey: ['resep-kebutuhan', id, previewPorsi],
    queryFn: () => resepApi.kebutuhan(id!, parseInt(previewPorsi)),
    enabled: false,
  })

  const addItemMutation = useMutation({
    mutationFn: () => resepApi.addItem(id!, { bahanBakuId: itemBahan, jumlahPerPorsi: parseFloat(itemJumlah), catatan: itemCatatan || undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['resep', id] }); setShowItemForm(false); setItemBahan(''); setItemJumlah(''); setItemCatatan('') },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => resepApi.removeItem(id!, itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resep', id] }),
  })

  if (isLoading) return <p className="text-gray-500">Memuat...</p>
  const resep = data?.data.data
  if (!resep) return <p className="text-red-500">Data tidak ditemukan</p>

  const bahanOptions = bahanList?.data.data ?? []
  const preview = previewData?.data.data

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/resep" className="text-bgn-800 hover:underline text-sm">← Resep</Link>
        <span className="text-gray-400">/</span>
        <h1 className="text-2xl font-bold text-bgn-900">{resep.nama}</h1>
        <span className="text-xs px-2 py-0.5 rounded bg-bgn-100 text-bgn-800">{resep.jenisPenerima.replace('_','/')}</span>
        <span className={`text-xs px-2 py-0.5 rounded ${resep.isActive ? 'bg-bgn-green-100 text-bgn-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {resep.isActive ? 'Aktif' : 'Nonaktif'}
        </span>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}

      {resep.deskripsi && <p className="text-gray-600 text-sm mb-4">{resep.deskripsi}</p>}

      {/* Komposisi Bahan */}
      <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden mb-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-bgn-100">
          <h2 className="font-semibold text-bgn-900">Komposisi Bahan (per 1 porsi)</h2>
          <button onClick={() => setShowItemForm(!showItemForm)}
            className="bg-bgn-green-400 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-bgn-green-500">
            + Tambah Bahan
          </button>
        </div>

        {showItemForm && (
          <div className="p-4 border-b border-bgn-100 bg-bgn-50">
            <div className="flex gap-2 mb-2">
              <select value={itemBahan} onChange={(e) => setItemBahan(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none">
                <option value="">-- Pilih Bahan --</option>
                {bahanOptions.map(b => <option key={b.id} value={b.id}>{b.nama} ({b.satuan})</option>)}
              </select>
              <input type="number" value={itemJumlah} onChange={(e) => setItemJumlah(e.target.value)}
                placeholder="Jumlah/porsi" step="0.001"
                className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
              <input type="text" value={itemCatatan} onChange={(e) => setItemCatatan(e.target.value)}
                placeholder="Catatan (opsional)"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => addItemMutation.mutate()} disabled={!itemBahan || !itemJumlah || addItemMutation.isPending}
                className="bg-bgn-green-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-bgn-green-500 disabled:opacity-50">Simpan</button>
              <button onClick={() => setShowItemForm(false)} className="border border-gray-300 px-4 py-2 rounded-lg text-sm">Batal</button>
            </div>
          </div>
        )}

        {resep.items.length === 0 ? (
          <p className="px-5 py-8 text-center text-gray-400 text-sm">Belum ada bahan ditambahkan</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-bgn-200">
              <tr>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Bahan Baku</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Jumlah/Porsi</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Catatan</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bgn-100">
              {resep.items.map(item => (
                <tr key={item.id} className="odd:bg-white even:bg-bgn-50">
                  <td className="px-4 py-3 text-gray-800">{item.bahanBaku?.nama ?? item.bahanBakuId}</td>
                  <td className="px-4 py-3 text-gray-700">{item.jumlahPerPorsi} {item.bahanBaku?.satuan ?? ''}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{item.catatan ?? '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { if (confirm('Hapus bahan dari resep?')) removeItemMutation.mutate(item.id) }}
                      className="text-red-500 hover:underline text-xs">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Preview Kebutuhan */}
      {resep.items.length > 0 && (
        <div className="bg-white rounded-xl shadow-md border border-bgn-100 p-5">
          <h2 className="font-semibold text-bgn-900 mb-3">Preview Kebutuhan Bahan</h2>
          <div className="flex gap-2 mb-3">
            <input type="number" value={previewPorsi} onChange={(e) => setPreviewPorsi(e.target.value)}
              placeholder="Jumlah porsi" className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
            <button onClick={() => void refetchPreview()} disabled={!previewPorsi}
              className="bg-bgn-green-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-bgn-green-500 disabled:opacity-50">
              Hitung
            </button>
          </div>
          {preview && (
            <div>
              <div className={`text-sm mb-2 font-medium ${preview.semuaCukup ? 'text-bgn-green-700' : 'text-red-600'}`}>
                {preview.semuaCukup ? '✓ Stok mencukupi untuk semua bahan' : '✗ Ada bahan yang stoknya tidak cukup'}
              </div>
              <div className="space-y-1">
                {preview.items.map(item => (
                  <div key={item.bahanBakuId} className={`flex justify-between text-sm px-3 py-1.5 rounded ${item.cukup ? 'bg-bgn-green-50' : 'bg-red-50'}`}>
                    <span className={item.cukup ? 'text-gray-700' : 'text-red-700 font-medium'}>{item.nama}</span>
                    <span className={`text-xs ${item.cukup ? 'text-gray-500' : 'text-red-600'}`}>
                      Butuh: {item.kebutuhan} {item.satuan} | Stok: {item.stokTersedia} {item.satuan}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: TypeScript check + commit**

```bash
cd /home/wanda/mbg-web && npx tsc --noEmit 2>&1 | head -10
```

```bash
cd /home/wanda/mbg-web
git add src/pages/resep/
git commit -m "feat(frontend): ResepListPage + ResepFormPage + ResepDetailPage dengan item management"
```

---

## Task 4: LokasiGudangPage + App.tsx + Layout.tsx

- [ ] **Step 1: Buat `src/pages/lokasi-gudang/LokasiGudangPage.tsx`**

```tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { lokasiGudangApi } from '@/api/endpoints/lokasi-gudang'
import { getErrorMessage } from '@/utils/error'
import type { TipeLokasiGudang } from '@/types'

const TIPE_ICONS: Record<string, string> = { KERING: '📦', DINGIN: '❄️', BEKU: '🧊' }

export function LokasiGudangPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [nama, setNama] = useState('')
  const [tipe, setTipe] = useState<TipeLokasiGudang>('KERING')
  const [keterangan, setKeterangan] = useState('')
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['lokasi-gudang'],
    queryFn: () => lokasiGudangApi.list(),
  })

  const saveMutation = useMutation({
    mutationFn: () => editId
      ? lokasiGudangApi.update(editId, { nama, tipe, keterangan: keterangan || undefined })
      : lokasiGudangApi.create({ nama, tipe, keterangan: keterangan || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lokasi-gudang'] })
      setShowForm(false); setEditId(null); setNama(''); setTipe('KERING'); setKeterangan('')
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: lokasiGudangApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lokasi-gudang'] }),
  })

  const openEdit = (item: { id: string; nama: string; tipe: TipeLokasiGudang; keterangan: string | null }) => {
    setEditId(item.id); setNama(item.nama); setTipe(item.tipe); setKeterangan(item.keterangan ?? '')
    setShowForm(true)
  }

  const items = data?.data.data ?? []
  const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none"

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-bgn-900">Lokasi Gudang</h1>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setNama(''); setTipe('KERING'); setKeterangan('') }}
          className="bg-bgn-green-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-bgn-green-500">
          + Tambah Lokasi
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}

      {showForm && (
        <div className="bg-white rounded-xl border border-bgn-200 p-5 shadow-md mb-4">
          <h3 className="font-semibold text-bgn-900 mb-3">{editId ? 'Edit Lokasi' : 'Tambah Lokasi Baru'}</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="col-span-2"><label className="block text-xs font-medium text-gray-700 mb-1">Nama Lokasi *</label>
              <input value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Kulkas Sayuran" className={inputCls} /></div>
            <div><label className="block text-xs font-medium text-gray-700 mb-1">Tipe *</label>
              <select value={tipe} onChange={(e) => setTipe(e.target.value as TipeLokasiGudang)} className={inputCls}>
                <option value="KERING">📦 Kering</option>
                <option value="DINGIN">❄️ Dingin (Kulkas)</option>
                <option value="BEKU">🧊 Beku (Freezer)</option>
              </select></div>
            <div><label className="block text-xs font-medium text-gray-700 mb-1">Keterangan (opsional)</label>
              <input value={keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder="Suhu 4°C" className={inputCls} /></div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => saveMutation.mutate()} disabled={!nama || saveMutation.isPending}
              className="bg-bgn-green-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-bgn-green-500 disabled:opacity-50">
              {saveMutation.isPending ? 'Menyimpan...' : editId ? 'Simpan' : 'Tambah'}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null) }} className="border border-gray-300 px-4 py-2 rounded-lg text-sm">Batal</button>
          </div>
        </div>
      )}

      {isLoading ? <p className="text-gray-500">Memuat...</p> : (
        <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bgn-200">
              <tr>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Nama</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Tipe</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Keterangan</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bgn-100">
              {items.map(item => (
                <tr key={item.id} className="odd:bg-white even:bg-bgn-50">
                  <td className="px-4 py-3 font-medium text-bgn-900">{item.nama}</td>
                  <td className="px-4 py-3 text-gray-600">{TIPE_ICONS[item.tipe]} {item.tipe}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{item.keterangan ?? '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(item)} className="text-bgn-800 hover:underline text-xs">Edit</button>
                      <button onClick={() => { if (confirm('Hapus lokasi?')) deleteMutation.mutate(item.id) }}
                        className="text-red-500 hover:underline text-xs">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Belum ada lokasi gudang</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Update App.tsx**

Baca file dulu. Tambahkan imports:
```typescript
import { SupplierListPage } from '@/pages/supplier/SupplierListPage'
import { SupplierFormPage } from '@/pages/supplier/SupplierFormPage'
import { ResepListPage } from '@/pages/resep/ResepListPage'
import { ResepFormPage } from '@/pages/resep/ResepFormPage'
import { ResepDetailPage } from '@/pages/resep/ResepDetailPage'
import { LokasiGudangPage } from '@/pages/lokasi-gudang/LokasiGudangPage'
```

Tambahkan routes (setelah routes invoice):
```tsx
<Route path="supplier" element={<SupplierListPage />} />
<Route path="supplier/baru" element={<SupplierFormPage />} />
<Route path="supplier/:id/edit" element={<SupplierFormPage />} />
<Route path="resep" element={<ResepListPage />} />
<Route path="resep/baru" element={<ResepFormPage />} />
<Route path="resep/:id" element={<ResepDetailPage />} />
<Route path="lokasi-gudang" element={<LokasiGudangPage />} />
```

- [ ] **Step 3: Update Layout.tsx navItems**

Baca file dulu. Tambahkan 3 nav items setelah Invoice:
```typescript
{ to: '/supplier', label: 'Supplier' },
{ to: '/resep', label: 'Resep / BOM' },
{ to: '/lokasi-gudang', label: 'Lokasi Gudang' },
```

- [ ] **Step 4: TypeScript check + semua test**

```bash
cd /home/wanda/mbg-web && npx tsc --noEmit 2>&1 | head -10
```

- [ ] **Step 5: Commit + push**

```bash
cd /home/wanda/mbg-web
git add src/pages/lokasi-gudang/ src/App.tsx src/components/Layout.tsx
git commit -m "feat(frontend): LokasiGudangPage, routes+nav Supplier+Resep+Lokasi Grup A"
git push origin master
```

---

## Task 5: Visual Smoke Test

- [ ] **Step 1: Screenshot Supplier list** — navigate ke `/supplier`, verifikasi tabel + tombol Tambah Supplier hijau

- [ ] **Step 2: Screenshot Resep list** — navigate ke `/resep`, verifikasi tabel + filter penerima

- [ ] **Step 3: Screenshot Lokasi Gudang** — navigate ke `/lokasi-gudang`, verifikasi tabel + form tambah inline
