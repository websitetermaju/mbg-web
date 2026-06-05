# Frontend Grup C — Workflow Pages (PR + Invoice) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Buat halaman frontend untuk Permintaan Pembelian (PR) dan Invoice — lengkap dengan workflow approval, konversi ke PO, dan partial payment.

**Architecture:** React + TanStack Query + Tailwind BGN palette. Ikuti pola existing pages (PengadaanDetailPage, MenuListPage). Tambah 2 API client files, 5 halaman baru, update App.tsx + Layout.tsx + types/index.ts + PengadaanDetailPage.

**Tech Stack:** React 18, TanStack Query, React Hook Form (untuk form PR), Tailwind CSS. Project: `/home/wanda/mbg-web`

---

## File Structure

| Action | Path | Tanggung Jawab |
|--------|------|----------------|
| Modify | `src/types/index.ts` | Tambah types PR + Invoice + Pembayaran |
| Create | `src/api/endpoints/permintaan-pembelian.ts` | API client PR |
| Create | `src/api/endpoints/invoice.ts` | API client Invoice |
| Create | `src/pages/permintaan-pembelian/PRListPage.tsx` | List PR dengan filter status |
| Create | `src/pages/permintaan-pembelian/PRFormPage.tsx` | Form buat PR baru |
| Create | `src/pages/permintaan-pembelian/PRDetailPage.tsx` | Detail PR + action buttons |
| Create | `src/pages/invoice/InvoiceListPage.tsx` | List invoice + overdue filter |
| Create | `src/pages/invoice/InvoiceDetailPage.tsx` | Detail + riwayat + form pembayaran |
| Modify | `src/App.tsx` | Tambah 5 routes baru |
| Modify | `src/components/Layout.tsx` | Tambah 2 nav items |
| Modify | `src/pages/pengadaan/PengadaanDetailPage.tsx` | Tambah link PR sumber + Invoice |

---

## Task 1: Types + API Clients

**Files:**
- Modify: `src/types/index.ts`
- Create: `src/api/endpoints/permintaan-pembelian.ts`
- Create: `src/api/endpoints/invoice.ts`

- [ ] **Step 1: Tambah types baru ke `src/types/index.ts`**

Buka file, tambahkan di bagian akhir:

```typescript
// ─── Permintaan Pembelian ──────────────────────────────────────────
export type StatusPR = 'DRAFT' | 'APPROVED' | 'CONVERTED' | 'REJECTED'
export type KategoriBiaya = 'BAHAN_BAKU' | 'UPAH' | 'UTILITAS' | 'LAINNYA'

export interface PRItem {
  id: string
  bahanBakuId: string
  bahanBaku?: { nama: string; satuan: string }
  jumlah: number
  keterangan: string | null
}

export interface PermintaanPembelian {
  id: string
  sppgId: string
  nomorPr: string
  tanggal: string
  catatan: string | null
  status: StatusPR
  alasanTolak: string | null
  createdById: string | null
  approvedById: string | null
  convertedPoId: string | null
  items: PRItem[]
  createdAt: string
  updatedAt: string
}

// ─── Invoice ───────────────────────────────────────────────────────
export type StatusInvoice = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE'
export type MetodeBayar = 'TRANSFER' | 'TUNAI' | 'CEK'

export interface Pembayaran {
  id: string
  invoiceId: string
  sppgId: string
  jumlah: number
  tanggalBayar: string
  metodeBayar: MetodeBayar
  buktiUrl: string | null
  catatan: string | null
  createdById: string | null
  createdAt: string
}

export interface Invoice {
  id: string
  sppgId: string
  pengadaanId: string
  pengadaan?: { nomorPo: string }
  supplierId: string | null
  supplier?: { nama: string } | null
  nomorInvoice: string
  tanggalTerbit: string
  tanggalJatuhTempo: string
  totalTagihan: number
  totalDibayar: number
  status: StatusInvoice
  catatan: string | null
  pembayaran: Pembayaran[]
  createdAt: string
  updatedAt: string
}
```

- [ ] **Step 2: Buat `src/api/endpoints/permintaan-pembelian.ts`**

```typescript
import { api } from '@/api/axios'
import type { ApiResponse, PermintaanPembelian } from '@/types'

export const prApi = {
  list: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get<ApiResponse<PermintaanPembelian[]>>('/permintaan-pembelian', { params }),
  getOne: (id: string) =>
    api.get<ApiResponse<PermintaanPembelian>>(`/permintaan-pembelian/${id}`),
  create: (data: { tanggal: string; catatan?: string; items: { bahanBakuId: string; jumlah: number; keterangan?: string }[] }) =>
    api.post<ApiResponse<PermintaanPembelian>>('/permintaan-pembelian', data),
  approve: (id: string) =>
    api.post<ApiResponse<PermintaanPembelian>>(`/permintaan-pembelian/${id}/approve`),
  reject: (id: string, alasanTolak: string) =>
    api.post<ApiResponse<PermintaanPembelian>>(`/permintaan-pembelian/${id}/reject`, { alasanTolak }),
  convert: (id: string) =>
    api.post<ApiResponse<{ nomorPo: string; id: string }>>(`/permintaan-pembelian/${id}/convert`),
  delete: (id: string) =>
    api.delete(`/permintaan-pembelian/${id}`),
}
```

- [ ] **Step 3: Buat `src/api/endpoints/invoice.ts`**

```typescript
import { api } from '@/api/axios'
import type { ApiResponse, Invoice } from '@/types'

export const invoiceApi = {
  list: (params?: { page?: number; limit?: number; status?: string; pengadaanId?: string }) =>
    api.get<ApiResponse<Invoice[]>>('/invoice', { params }),
  overdue: () =>
    api.get<ApiResponse<Invoice[]>>('/invoice/overdue'),
  getOne: (id: string) =>
    api.get<ApiResponse<Invoice>>(`/invoice/${id}`),
  update: (id: string, data: { nomorInvoice?: string; tanggalJatuhTempo?: string; catatan?: string }) =>
    api.patch<ApiResponse<Invoice>>(`/invoice/${id}`, data),
  tambahPembayaran: (id: string, data: { jumlah: number; tanggalBayar: string; metodeBayar: string; buktiUrl?: string; catatan?: string }) =>
    api.post<ApiResponse<Invoice>>(`/invoice/${id}/bayar`, data),
  batalkanPembayaran: (id: string, bayarId: string) =>
    api.delete<ApiResponse<Invoice>>(`/invoice/${id}/bayar/${bayarId}`),
}
```

- [ ] **Step 4: TypeScript check**

```bash
cd /home/wanda/mbg-web && npx tsc --noEmit 2>&1 | head -10
```

Expected: tidak ada output.

- [ ] **Step 5: Commit**

```bash
cd /home/wanda/mbg-web
git add src/types/index.ts \
        src/api/endpoints/permintaan-pembelian.ts \
        src/api/endpoints/invoice.ts
git commit -m "feat(frontend): types PR + Invoice, API clients"
```

---

## Task 2: PRListPage + PRFormPage

**Files:**
- Create: `src/pages/permintaan-pembelian/PRListPage.tsx`
- Create: `src/pages/permintaan-pembelian/PRFormPage.tsx`

- [ ] **Step 1: Buat PRListPage**

```tsx
// src/pages/permintaan-pembelian/PRListPage.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { prApi } from '@/api/endpoints/permintaan-pembelian'
import { StatusBadge } from '@/components/StatusBadge'
import { Pagination } from '@/components/Pagination'
import type { StatusPR } from '@/types'

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Semua Status' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'APPROVED', label: 'Disetujui' },
  { value: 'CONVERTED', label: 'Dikonversi' },
  { value: 'REJECTED', label: 'Ditolak' },
]

export function PRListPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['pr', page, status],
    queryFn: () => prApi.list({ page, limit: 20, ...(status ? { status } : {}) }),
  })

  const deleteMutation = useMutation({
    mutationFn: prApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pr'] }),
  })

  const items = data?.data.data ?? []
  const meta = data?.data.meta

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-bgn-900">Permintaan Pembelian</h1>
        <Link to="/permintaan-pembelian/baru" className="bg-bgn-green-400 text-white px-4 py-2 rounded-lg text-sm hover:bg-bgn-green-500">
          + Buat PR
        </Link>
      </div>

      <div className="mb-4">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none"
        >
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Memuat...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bgn-200">
              <tr>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Nomor PR</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Tanggal</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Jumlah Item</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bgn-100">
              {items.map((pr) => (
                <tr key={pr.id} className="odd:bg-white even:bg-bgn-50 hover:bg-bgn-100 transition-colors">
                  <td className="px-4 py-3 font-medium text-bgn-900">
                    <Link to={`/permintaan-pembelian/${pr.id}`} className="hover:underline text-bgn-800">
                      {pr.nomorPr}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{pr.tanggal}</td>
                  <td className="px-4 py-3 text-gray-600">{pr.items?.length ?? 0} item</td>
                  <td className="px-4 py-3"><StatusBadge status={pr.status} /></td>
                  <td className="px-4 py-3 text-right">
                    {pr.status === 'DRAFT' && (
                      <button
                        onClick={() => { if (confirm('Hapus PR ini?')) deleteMutation.mutate(pr.id) }}
                        className="text-red-500 hover:underline text-xs"
                      >
                        Hapus
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Belum ada permintaan pembelian</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} totalPages={meta?.totalPages ?? 1} onPageChange={setPage} />
    </div>
  )
}
```

- [ ] **Step 2: Buat PRFormPage**

```tsx
// src/pages/permintaan-pembelian/PRFormPage.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { prApi } from '@/api/endpoints/permintaan-pembelian'
import { bahanBakuApi } from '@/api/endpoints/bahan-baku'
import { getErrorMessage } from '@/utils/error'

interface PRItemRow { bahanBakuId: string; jumlah: number; keterangan: string }

export function PRFormPage() {
  const navigate = useNavigate()
  const [tanggal, setTanggal] = useState('')
  const [catatan, setCatatan] = useState('')
  const [items, setItems] = useState<PRItemRow[]>([{ bahanBakuId: '', jumlah: 0, keterangan: '' }])
  const [error, setError] = useState('')

  const { data: bahanList } = useQuery({
    queryKey: ['bahan-baku', 'all'],
    queryFn: () => bahanBakuApi.list({ limit: 200 }),
  })

  const mutation = useMutation({
    mutationFn: prApi.create,
    onSuccess: (res) => navigate(`/permintaan-pembelian/${res.data.data.id}`),
    onError: (err) => setError(getErrorMessage(err)),
  })

  const addItem = () => setItems([...items, { bahanBakuId: '', jumlah: 0, keterangan: '' }])
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx))
  const updateItem = (idx: number, field: keyof PRItemRow, value: string | number) => {
    setItems(items.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tanggal) { setError('Tanggal wajib diisi'); return }
    if (items.some(i => !i.bahanBakuId || i.jumlah <= 0)) {
      setError('Semua item harus memiliki bahan baku dan jumlah > 0'); return
    }
    mutation.mutate({ tanggal, catatan: catatan || undefined, items })
  }

  const bahanOptions = bahanList?.data.data ?? []

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-bgn-900 mb-6">Buat Permintaan Pembelian</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md border border-bgn-100 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
          <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (opsional)</label>
          <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} rows={2}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Item Bahan Baku</label>
            <button type="button" onClick={addItem} className="text-sm text-bgn-800 hover:underline">+ Tambah Item</button>
          </div>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <select value={item.bahanBakuId} onChange={(e) => updateItem(idx, 'bahanBakuId', e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none">
                  <option value="">-- Pilih Bahan --</option>
                  {bahanOptions.map((b) => <option key={b.id} value={b.id}>{b.nama} ({b.satuan})</option>)}
                </select>
                <input type="number" min="0.01" step="0.01" value={item.jumlah || ''}
                  onChange={(e) => updateItem(idx, 'jumlah', parseFloat(e.target.value) || 0)}
                  placeholder="Jumlah" className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
                <input type="text" value={item.keterangan} onChange={(e) => updateItem(idx, 'keterangan', e.target.value)}
                  placeholder="Ket. (opsional)" className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(idx)} className="text-red-500 px-2 py-2 text-lg leading-none">×</button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={mutation.isPending}
            className="bg-bgn-green-400 text-white px-6 py-2 rounded-lg hover:bg-bgn-green-500 disabled:opacity-50">
            {mutation.isPending ? 'Menyimpan...' : 'Buat PR'}
          </button>
          <button type="button" onClick={() => navigate('/permintaan-pembelian')}
            className="border border-bgn-900 text-bgn-900 px-6 py-2 rounded-lg hover:bg-bgn-50">
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: TypeScript check**

```bash
cd /home/wanda/mbg-web && npx tsc --noEmit 2>&1 | head -10
```

- [ ] **Step 4: Commit**

```bash
cd /home/wanda/mbg-web
git add src/pages/permintaan-pembelian/
git commit -m "feat(frontend): PRListPage + PRFormPage"
```

---

## Task 3: PRDetailPage

**Files:**
- Create: `src/pages/permintaan-pembelian/PRDetailPage.tsx`

- [ ] **Step 1: Buat PRDetailPage**

```tsx
// src/pages/permintaan-pembelian/PRDetailPage.tsx
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { prApi } from '@/api/endpoints/permintaan-pembelian'
import { StatusBadge } from '@/components/StatusBadge'
import { getErrorMessage } from '@/utils/error'

export function PRDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [alasanTolak, setAlasanTolak] = useState('')
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['pr', id],
    queryFn: () => prApi.getOne(id!),
    enabled: !!id,
  })

  const approveMutation = useMutation({
    mutationFn: () => prApi.approve(id!),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pr', id] }),
    onError: (err) => setError(getErrorMessage(err)),
  })

  const rejectMutation = useMutation({
    mutationFn: () => prApi.reject(id!, alasanTolak),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pr', id] }); setShowRejectModal(false) },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const convertMutation = useMutation({
    mutationFn: () => prApi.convert(id!),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['pr', id] })
      navigate(`/pengadaan/${res.data.data.id}`)
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: () => prApi.delete(id!),
    onSuccess: () => navigate('/permintaan-pembelian'),
  })

  if (isLoading) return <p className="text-gray-500">Memuat...</p>
  const pr = data?.data.data
  if (!pr) return <p className="text-red-500">Data tidak ditemukan</p>

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/permintaan-pembelian" className="text-bgn-800 hover:underline text-sm">← Permintaan Pembelian</Link>
        <span className="text-gray-400">/</span>
        <h1 className="text-2xl font-bold text-bgn-900">{pr.nomorPr}</h1>
        <StatusBadge status={pr.status} />
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}

      {/* Info */}
      <div className="bg-white rounded-xl shadow-md border border-bgn-100 p-5 mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Tanggal:</span> <span className="font-medium">{pr.tanggal}</span></div>
          <div><span className="text-gray-500">Status:</span> <StatusBadge status={pr.status} /></div>
          {pr.catatan && <div className="col-span-2"><span className="text-gray-500">Catatan:</span> <span>{pr.catatan}</span></div>}
        </div>
      </div>

      {/* Alert status khusus */}
      {pr.status === 'REJECTED' && pr.alasanTolak && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4">
          <p className="font-semibold text-sm mb-1">Alasan Penolakan:</p>
          <p className="text-sm">{pr.alasanTolak}</p>
        </div>
      )}
      {pr.status === 'CONVERTED' && pr.convertedPoId && (
        <div className="bg-bgn-50 border border-bgn-200 rounded-lg p-4 mb-4 text-sm">
          PR ini sudah dikonversi ke PO.{' '}
          <Link to={`/pengadaan/${pr.convertedPoId}`} className="text-bgn-800 font-semibold hover:underline">
            Lihat Purchase Order →
          </Link>
        </div>
      )}

      {/* Items */}
      <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden mb-4">
        <div className="px-5 py-4 border-b border-bgn-100">
          <h2 className="font-semibold text-bgn-900">Item Bahan Baku</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-bgn-200">
            <tr>
              <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Bahan Baku</th>
              <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Jumlah</th>
              <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Keterangan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-bgn-100">
            {pr.items.map((item) => (
              <tr key={item.id} className="odd:bg-white even:bg-bgn-50">
                <td className="px-4 py-3 text-gray-800">{item.bahanBaku?.nama ?? item.bahanBakuId}</td>
                <td className="px-4 py-3 text-gray-600">{item.jumlah} {item.bahanBaku?.satuan ?? ''}</td>
                <td className="px-4 py-3 text-gray-500">{item.keterangan ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {pr.status === 'DRAFT' && (
          <>
            <button onClick={() => approveMutation.mutate()} disabled={approveMutation.isPending}
              className="bg-bgn-green-400 text-white px-5 py-2 rounded-lg hover:bg-bgn-green-500 disabled:opacity-50 text-sm">
              Approve
            </button>
            <button onClick={() => setShowRejectModal(true)}
              className="border border-red-500 text-red-500 px-5 py-2 rounded-lg hover:bg-red-50 text-sm">
              Tolak
            </button>
            <button onClick={() => { if (confirm('Hapus PR ini?')) deleteMutation.mutate() }}
              className="text-red-500 hover:underline text-sm ml-auto">
              Hapus
            </button>
          </>
        )}
        {pr.status === 'APPROVED' && (
          <button onClick={() => convertMutation.mutate()} disabled={convertMutation.isPending}
            className="bg-bgn-green-400 text-white px-6 py-2.5 rounded-lg hover:bg-bgn-green-500 disabled:opacity-50 font-semibold">
            {convertMutation.isPending ? 'Mengkonversi...' : '🔄 Convert ke Purchase Order'}
          </button>
        )}
      </div>

      {/* Modal Tolak */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-bold text-bgn-900 mb-3">Tolak Permintaan Pembelian</h3>
            <textarea value={alasanTolak} onChange={(e) => setAlasanTolak(e.target.value)}
              placeholder="Masukkan alasan penolakan (minimal 5 karakter)..." rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
            <div className="flex gap-3">
              <button onClick={() => rejectMutation.mutate()} disabled={alasanTolak.length < 5 || rejectMutation.isPending}
                className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm">
                Konfirmasi Tolak
              </button>
              <button onClick={() => { setShowRejectModal(false); setAlasanTolak('') }}
                className="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-50 text-sm">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
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
git add src/pages/permintaan-pembelian/PRDetailPage.tsx
git commit -m "feat(frontend): PRDetailPage dengan approve/reject/convert workflow"
```

---

## Task 4: InvoiceListPage + InvoiceDetailPage

**Files:**
- Create: `src/pages/invoice/InvoiceListPage.tsx`
- Create: `src/pages/invoice/InvoiceDetailPage.tsx`

- [ ] **Step 1: Buat InvoiceListPage**

```tsx
// src/pages/invoice/InvoiceListPage.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { invoiceApi } from '@/api/endpoints/invoice'
import { StatusBadge } from '@/components/StatusBadge'
import { Pagination } from '@/components/Pagination'

const formatRp = (n: number) => `Rp ${Number(n).toLocaleString('id-ID')}`

export function InvoiceListPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [showOverdue, setShowOverdue] = useState(false)

  const { data: invoiceData, isLoading } = useQuery({
    queryKey: ['invoice', page, status, showOverdue],
    queryFn: () => showOverdue
      ? invoiceApi.overdue()
      : invoiceApi.list({ page, limit: 20, ...(status ? { status } : {}) }),
  })

  const items = invoiceData?.data.data ?? []
  const meta = (invoiceData?.data as { meta?: { totalPages: number } }).meta

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-bgn-900">Invoice</h1>
      </div>

      <div className="flex gap-3 mb-4">
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); setShowOverdue(false) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none">
          <option value="">Semua Status</option>
          <option value="UNPAID">Belum Dibayar</option>
          <option value="PARTIALLY_PAID">Sebagian Dibayar</option>
          <option value="PAID">Lunas</option>
          <option value="OVERDUE">Jatuh Tempo</option>
        </select>
        <button onClick={() => { setShowOverdue(!showOverdue); setStatus(''); setPage(1) }}
          className={`px-4 py-2 rounded-lg text-sm border transition-colors ${showOverdue ? 'bg-red-100 border-red-400 text-red-700' : 'border-gray-300 hover:bg-gray-50'}`}>
          ⚠ Jatuh Tempo
        </button>
      </div>

      {isLoading ? <p className="text-gray-500">Memuat...</p> : (
        <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bgn-200">
              <tr>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Nomor Invoice</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">PO</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Total Tagihan</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Dibayar</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Jatuh Tempo</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bgn-100">
              {items.map((inv) => (
                <tr key={inv.id} className="odd:bg-white even:bg-bgn-50 hover:bg-bgn-100 transition-colors cursor-pointer">
                  <td className="px-4 py-3">
                    <Link to={`/invoice/${inv.id}`} className="font-medium text-bgn-800 hover:underline">{inv.nomorInvoice}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{inv.pengadaan?.nomorPo ?? '-'}</td>
                  <td className="px-4 py-3 text-gray-800">{formatRp(inv.totalTagihan)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatRp(inv.totalDibayar)}</td>
                  <td className={`px-4 py-3 text-xs ${inv.status === 'OVERDUE' ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                    {inv.tanggalJatuhTempo}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Belum ada invoice</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {!showOverdue && <Pagination page={page} totalPages={meta?.totalPages ?? 1} onPageChange={setPage} />}
    </div>
  )
}
```

- [ ] **Step 2: Buat InvoiceDetailPage**

```tsx
// src/pages/invoice/InvoiceDetailPage.tsx
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { invoiceApi } from '@/api/endpoints/invoice'
import { StatusBadge } from '@/components/StatusBadge'
import { getErrorMessage } from '@/utils/error'
import type { MetodeBayar } from '@/types'

const formatRp = (n: number) => `Rp ${Number(n).toLocaleString('id-ID')}`

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [bayarJumlah, setBayarJumlah] = useState('')
  const [bayarTanggal, setBayarTanggal] = useState('')
  const [bayarMetode, setBayarMetode] = useState<MetodeBayar>('TRANSFER')
  const [bayarCatatan, setBayarCatatan] = useState('')
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoiceApi.getOne(id!),
    enabled: !!id,
  })

  const tambahMutation = useMutation({
    mutationFn: () => invoiceApi.tambahPembayaran(id!, {
      jumlah: parseFloat(bayarJumlah),
      tanggalBayar: bayarTanggal,
      metodeBayar: bayarMetode,
      catatan: bayarCatatan || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoice', id] })
      setShowForm(false)
      setBayarJumlah(''); setBayarTanggal(''); setBayarCatatan('')
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const batalMutation = useMutation({
    mutationFn: (bayarId: string) => invoiceApi.batalkanPembayaran(id!, bayarId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoice', id] }),
    onError: (err) => setError(getErrorMessage(err)),
  })

  if (isLoading) return <p className="text-gray-500">Memuat...</p>
  const inv = data?.data.data
  if (!inv) return <p className="text-red-500">Data tidak ditemukan</p>

  const pct = inv.totalTagihan > 0 ? Math.min(100, (inv.totalDibayar / inv.totalTagihan) * 100) : 0
  const sisa = inv.totalTagihan - inv.totalDibayar

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/invoice" className="text-bgn-800 hover:underline text-sm">← Invoice</Link>
        <span className="text-gray-400">/</span>
        <h1 className="text-2xl font-bold text-bgn-900">{inv.nomorInvoice}</h1>
        <StatusBadge status={inv.status} />
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}

      {/* Header info */}
      <div className="bg-white rounded-xl shadow-md border border-bgn-100 p-5 mb-4">
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div><span className="text-gray-500">PO:</span>{' '}
            <Link to={`/pengadaan/${inv.pengadaanId}`} className="text-bgn-800 hover:underline font-medium">
              {inv.pengadaan?.nomorPo ?? inv.pengadaanId}
            </Link>
          </div>
          <div><span className="text-gray-500">Jatuh Tempo:</span>{' '}
            <span className={inv.status === 'OVERDUE' ? 'text-red-600 font-semibold' : 'font-medium'}>
              {inv.tanggalJatuhTempo}
            </span>
          </div>
          {inv.supplier && <div><span className="text-gray-500">Supplier:</span> <span className="font-medium">{inv.supplier.nama}</span></div>}
        </div>

        {/* Progress bar */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progres Pembayaran</span>
            <span>{pct.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className={`h-2 rounded-full transition-all ${inv.status === 'PAID' ? 'bg-bgn-green-400' : inv.status === 'OVERDUE' ? 'bg-red-400' : 'bg-bgn-400'}`}
              style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="text-center p-3 bg-bgn-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Total Tagihan</p>
            <p className="font-bold text-bgn-900">{formatRp(inv.totalTagihan)}</p>
          </div>
          <div className="text-center p-3 bg-bgn-green-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Dibayar</p>
            <p className="font-bold text-bgn-green-600">{formatRp(inv.totalDibayar)}</p>
          </div>
          <div className={`text-center p-3 rounded-lg ${sisa > 0 ? 'bg-orange-50' : 'bg-bgn-green-50'}`}>
            <p className="text-xs text-gray-500 mb-1">Sisa</p>
            <p className={`font-bold ${sisa > 0 ? 'text-orange-600' : 'text-bgn-green-600'}`}>{formatRp(Math.max(0, sisa))}</p>
          </div>
        </div>
      </div>

      {/* Riwayat Pembayaran */}
      <div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden mb-4">
        <div className="flex items-center justify-between px-5 py-4 border-b border-bgn-100">
          <h2 className="font-semibold text-bgn-900">Riwayat Pembayaran</h2>
          {inv.status !== 'PAID' && (
            <button onClick={() => setShowForm(!showForm)}
              className="bg-bgn-green-400 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-bgn-green-500">
              + Tambah Pembayaran
            </button>
          )}
        </div>

        {showForm && (
          <div className="p-5 border-b border-bgn-100 bg-bgn-50">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Jumlah (Rp)</label>
                <input type="number" value={bayarJumlah} onChange={(e) => setBayarJumlah(e.target.value)}
                  placeholder="0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal Bayar</label>
                <input type="date" value={bayarTanggal} onChange={(e) => setBayarTanggal(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Metode</label>
                <select value={bayarMetode} onChange={(e) => setBayarMetode(e.target.value as MetodeBayar)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none">
                  <option value="TRANSFER">Transfer Bank</option>
                  <option value="TUNAI">Tunai</option>
                  <option value="CEK">Cek</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Catatan (opsional)</label>
                <input type="text" value={bayarCatatan} onChange={(e) => setBayarCatatan(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => tambahMutation.mutate()} disabled={!bayarJumlah || !bayarTanggal || tambahMutation.isPending}
                className="bg-bgn-green-400 text-white px-5 py-2 rounded-lg text-sm hover:bg-bgn-green-500 disabled:opacity-50">
                {tambahMutation.isPending ? 'Menyimpan...' : 'Simpan Pembayaran'}
              </button>
              <button onClick={() => setShowForm(false)} className="border border-gray-300 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
                Batal
              </button>
            </div>
          </div>
        )}

        {inv.pembayaran.length === 0 ? (
          <p className="px-5 py-6 text-center text-gray-400 text-sm">Belum ada pembayaran</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-bgn-200">
              <tr>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Tanggal</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Metode</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Jumlah</th>
                <th className="text-left px-4 py-3 text-bgn-900 font-semibold">Catatan</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bgn-100">
              {inv.pembayaran.map((p) => (
                <tr key={p.id} className="odd:bg-white even:bg-bgn-50">
                  <td className="px-4 py-3 text-gray-700">{p.tanggalBayar}</td>
                  <td className="px-4 py-3 text-gray-600">{p.metodeBayar}</td>
                  <td className="px-4 py-3 font-medium text-bgn-green-700">{formatRp(p.jumlah)}</td>
                  <td className="px-4 py-3 text-gray-500">{p.catatan ?? '-'}</td>
                  <td className="px-4 py-3 text-right">
                    {inv.status !== 'PAID' && (
                      <button onClick={() => { if (confirm('Batalkan pembayaran ini?')) batalMutation.mutate(p.id) }}
                        className="text-red-500 hover:underline text-xs">
                        Batalkan
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: TypeScript check**

```bash
cd /home/wanda/mbg-web && npx tsc --noEmit 2>&1 | head -10
```

- [ ] **Step 4: Commit**

```bash
cd /home/wanda/mbg-web
git add src/pages/invoice/
git commit -m "feat(frontend): InvoiceListPage + InvoiceDetailPage dengan partial payment"
```

---

## Task 5: App.tsx + Layout.tsx + PengadaanDetailPage integration

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/Layout.tsx`
- Modify: `src/pages/pengadaan/PengadaanDetailPage.tsx`

- [ ] **Step 1: Update App.tsx — tambah 5 routes baru**

Buka `src/App.tsx`. Tambahkan imports baru:
```typescript
import { PRListPage } from '@/pages/permintaan-pembelian/PRListPage'
import { PRFormPage } from '@/pages/permintaan-pembelian/PRFormPage'
import { PRDetailPage } from '@/pages/permintaan-pembelian/PRDetailPage'
import { InvoiceListPage } from '@/pages/invoice/InvoiceListPage'
import { InvoiceDetailPage } from '@/pages/invoice/InvoiceDetailPage'
```

Tambahkan routes (setelah route pengadaan):
```tsx
<Route path="permintaan-pembelian" element={<PRListPage />} />
<Route path="permintaan-pembelian/baru" element={<PRFormPage />} />
<Route path="permintaan-pembelian/:id" element={<PRDetailPage />} />
<Route path="invoice" element={<InvoiceListPage />} />
<Route path="invoice/:id" element={<InvoiceDetailPage />} />
```

- [ ] **Step 2: Update Layout.tsx — tambah 2 nav items**

Buka `src/components/Layout.tsx`. Tambahkan dua item ke `navItems` array setelah Pengadaan:
```typescript
{ to: '/permintaan-pembelian', label: 'Permintaan Beli' },
{ to: '/invoice', label: 'Invoice' },
```

- [ ] **Step 3: Update PengadaanDetailPage — tambah link PR sumber + Invoice**

Buka `src/pages/pengadaan/PengadaanDetailPage.tsx`.

Tambahkan import invoice API:
```typescript
import { invoiceApi } from '@/api/endpoints/invoice'
```

Tambahkan query untuk invoice (setelah query `data`):
```typescript
const { data: invoiceData } = useQuery({
  queryKey: ['invoice', 'by-po', id],
  queryFn: () => invoiceApi.list({ pengadaanId: id! }),
  enabled: !!id,
})
const invoice = invoiceData?.data.data?.[0]
```

Di JSX, setelah block header PO (sebelum tabel items), tambahkan:
```tsx
{/* Link PR sumber */}
{po.permintaanPembelianId && (
  <div className="text-sm text-gray-600 mb-2">
    📋 Dari PR:{' '}
    <Link to={`/permintaan-pembelian/${po.permintaanPembelianId}`} className="text-bgn-800 hover:underline font-medium">
      Lihat Permintaan Pembelian
    </Link>
  </div>
)}
{/* Link Invoice */}
{invoice && (
  <div className="text-sm text-gray-600 mb-4">
    🧾 Invoice:{' '}
    <Link to={`/invoice/${invoice.id}`} className="text-bgn-800 hover:underline font-medium">
      {invoice.nomorInvoice}
    </Link>
    {' — '}
    <span className={invoice.status === 'OVERDUE' ? 'text-red-600 font-semibold' : invoice.status === 'PAID' ? 'text-bgn-green-700' : 'text-orange-600'}>
      {invoice.status}
    </span>
    {' '}
    <span className="text-gray-500">Rp {Number(invoice.totalDibayar).toLocaleString('id-ID')} / {Number(invoice.totalTagihan).toLocaleString('id-ID')}</span>
  </div>
)}
```

CATATAN: Tambahkan `Link` ke import react-router-dom jika belum ada di PengadaanDetailPage.

- [ ] **Step 4: TypeScript check**

```bash
cd /home/wanda/mbg-web && npx tsc --noEmit 2>&1 | head -10
```

- [ ] **Step 5: Commit**

```bash
cd /home/wanda/mbg-web
git add src/App.tsx src/components/Layout.tsx \
        src/pages/pengadaan/PengadaanDetailPage.tsx
git commit -m "feat(frontend): routes + nav PR+Invoice, integrasi PengadaanDetail"
```

---

## Task 6: Visual Smoke Test

- [ ] **Step 1: Pastikan dev server running**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/
```

Expected: `200`. Jika tidak: `cd /home/wanda/mbg-web && npx vite --port 5173 > /tmp/vite.log 2>&1 &`

- [ ] **Step 2: Screenshot halaman PR**

Gunakan Playwright MCP:
- Navigate ke `http://localhost:5173/permintaan-pembelian`
- Screenshot → verifikasi: tabel PR tampil, nav "Permintaan Beli" ada di sidebar, tombol "+ Buat PR" hijau BGN

- [ ] **Step 3: Screenshot form PR**

Navigate ke `http://localhost:5173/permintaan-pembelian/baru` → verifikasi form dengan dropdown bahan baku.

- [ ] **Step 4: Screenshot halaman Invoice**

Navigate ke `http://localhost:5173/invoice` → verifikasi tabel invoice, tombol "⚠ Jatuh Tempo".

- [ ] **Step 5: Commit fix jika ada masalah visual**

```bash
cd /home/wanda/mbg-web
git add -A && git commit -m "fix: perbaikan visual smoke test frontend PR + Invoice"
```

Jika tidak ada masalah, skip step ini.
