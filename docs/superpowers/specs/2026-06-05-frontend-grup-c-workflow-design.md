# Design: Frontend Grup C — Workflow Pages (PR + Invoice)

**Tanggal:** 2026-06-05
**Scope:** Halaman frontend untuk Permintaan Pembelian (PR) dan Invoice — dua modul dengan workflow/approval logic. Ikuti pola existing pages (React + TanStack Query + Tailwind + BGN palette).

---

## 1. Permintaan Pembelian (PR)

### Routes
```
/permintaan-pembelian         → PRListPage
/permintaan-pembelian/baru    → PRFormPage (create only, no edit route — edit via PATCH)
/permintaan-pembelian/:id     → PRDetailPage
```

### PRListPage
- Tabel: Nomor PR | Tanggal | Jumlah Item | Status | Aksi
- Status badge: DRAFT (gray) | APPROVED (blue) | CONVERTED (green) | REJECTED (red)
- Filter by status (dropdown)
- Tombol "+ Buat PR" → navigate ke `/permintaan-pembelian/baru`
- Aksi per row:
  - Semua status: klik baris → navigate ke detail
  - DRAFT: tombol "Hapus" (merah)

### PRFormPage
- Field: Tanggal (date input), Catatan (textarea optional)
- Dynamic items: tambah baris (bahanBakuId dropdown dari API + jumlah + keterangan)
- Minimal 1 item
- Submit → POST /permintaan-pembelian → redirect ke detail

### PRDetailPage
- Header: Nomor PR, Tanggal, Status badge, Catatan
- Tabel items: Nama Bahan | Satuan | Jumlah | Keterangan
- Action bar berdasarkan status:
  - **DRAFT**: tombol "Approve" (bgn-green) + "Tolak" (merah, modal alasan) + "Edit" (outline) + "Hapus" (merah)
  - **APPROVED**: tombol "Convert ke PO" (bgn-green, besar) + info "Menunggu konversi ke Purchase Order"
  - **CONVERTED**: info "Sudah dikonversi" + link biru "Lihat PO: PO/2026/0001"
  - **REJECTED**: alert merah berisi alasan penolakan

---

## 2. Invoice

### Routes
```
/invoice          → InvoiceListPage
/invoice/:id      → InvoiceDetailPage
```
Tidak ada create route — Invoice dibuat otomatis saat PO received.

### InvoiceListPage
- Tabel: Nomor Invoice | PO Terkait | Supplier | Total Tagihan | Dibayar | Jatuh Tempo | Status
- Status badge: UNPAID (orange) | PARTIALLY_PAID (blue) | PAID (green) | OVERDUE (red)
- Filter by status
- Toggle "Tampilkan Overdue Saja" → call /invoice/overdue
- Klik baris → navigate ke detail

### InvoiceDetailPage
- Header: Nomor Invoice, Status badge, Tanggal Terbit, Jatuh Tempo, PO terkait (link)
- Progress bar visual: `total_dibayar / total_tagihan` (warna: hijau jika PAID, orange jika partial, merah jika OVERDUE)
- Summary: Total Tagihan | Total Dibayar | Sisa
- Tombol "Edit" (update nomor/jatuh tempo) — kecil, outline
- **Section Riwayat Pembayaran:**
  - Tabel: Tanggal | Metode | Jumlah | Catatan | Aksi (batalkan)
  - Tombol "+ Tambah Pembayaran" → inline form (collapse/expand)
- **Form Tambah Pembayaran** (inline):
  - Jumlah (number), Tanggal Bayar (date), Metode (TRANSFER/TUNAI/CEK dropdown), Bukti URL (optional), Catatan (optional)
  - Submit → POST /invoice/:id/bayar

---

## 3. Integrasi ke PengadaanDetailPage

File: `src/pages/pengadaan/PengadaanDetailPage.tsx`

Tambahkan dua section kecil di bawah header PO:
```
📋 Sumber PR: PR/2026/0001 [link biru → /permintaan-pembelian/:prId]
🧾 Invoice: INV-PO-001 — UNPAID Rp 5.000.000 [link biru → /invoice/:invoiceId]
```

Jika tidak ada PR source → tidak ditampilkan.
Jika tidak ada invoice → tidak ditampilkan.
Data diambil via:
- PR: dari field `permintaanPembelianId` + `nomorPr` di response pengadaan
- Invoice: `GET /invoice?pengadaanId=xxx` (query by pengadaanId)

---

## 4. API Endpoints yang Dipakai

### PR
```typescript
prApi.list(params)                    // GET /permintaan-pembelian
prApi.getOne(id)                      // GET /permintaan-pembelian/:id
prApi.create(dto)                     // POST /permintaan-pembelian
prApi.approve(id)                     // POST /permintaan-pembelian/:id/approve
prApi.reject(id, alasanTolak)         // POST /permintaan-pembelian/:id/reject
prApi.convert(id)                     // POST /permintaan-pembelian/:id/convert
prApi.delete(id)                      // DELETE /permintaan-pembelian/:id
```

### Invoice
```typescript
invoiceApi.list(params)               // GET /invoice
invoiceApi.overdue()                  // GET /invoice/overdue
invoiceApi.getOne(id)                 // GET /invoice/:id
invoiceApi.update(id, dto)            // PATCH /invoice/:id
invoiceApi.tambahPembayaran(id, dto)  // POST /invoice/:id/bayar
invoiceApi.batalkanPembayaran(id, bayarId) // DELETE /invoice/:id/bayar/:bayarId
```

---

## 5. File Structure

```
src/
├── api/endpoints/
│   ├── permintaan-pembelian.ts    (baru)
│   └── invoice.ts                 (baru)
├── pages/
│   ├── permintaan-pembelian/
│   │   ├── PRListPage.tsx          (baru)
│   │   ├── PRFormPage.tsx          (baru)
│   │   └── PRDetailPage.tsx        (baru)
│   └── invoice/
│       ├── InvoiceListPage.tsx     (baru)
│       └── InvoiceDetailPage.tsx   (baru)
├── App.tsx                         (tambah routes)
└── components/Layout.tsx           (tambah nav items)
```

---

## 6. Pola yang Diikuti

- Semua query pakai TanStack Query (`useQuery`, `useMutation`)
- Error handling: `window.alert` atau inline error message (konsisten dengan halaman lain)
- Loading state: `{isLoading && <p className="text-gray-500">Memuat...</p>}`
- Status badge: gunakan `StatusBadge` component yang sudah ada atau inline class
- Warna tombol: primary = `bg-bgn-green-400`, danger = `text-red-600`, outline = `border border-bgn-900`
- Navigasi sidebar: tambah "Permintaan Pembelian" dan "Invoice" ke `navItems` di Layout.tsx
