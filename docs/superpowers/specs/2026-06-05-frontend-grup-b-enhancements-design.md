# Design: Frontend Grup B — Enhancements ke Halaman Existing

**Tanggal:** 2026-06-05
**Scope:** Tambah detail page Bahan Baku (StokBatch) dan detail page Produksi (BiayaProduksi + QC Checklist).

---

## 1. BahanBakuDetailPage (`/bahan-baku/:id`)

### Layout
- **Header**: nama bahan besar, badge status stok (NORMAL/LOW_STOCK/OUT_OF_STOCK), stok akhir angka besar
- **Info row**: satuan | kategori | stok minimum | harga satuan
- **Section StokBatch**: tabel batch aktif milik bahan ini
- **Form batch manual** (expandable): jumlah, tanggal masuk, kadaluarsa, lokasi, harga satuan
- **Alert expiring**: banner merah/kuning jika ada batch kadaluarsa ≤ 7 hari

### Tabel StokBatch
Kolom: Tanggal Masuk | Kadaluarsa | Masuk | Sisa | Lokasi | badge

Badge kadaluarsa:
- ≤ 3 hari: badge merah "Segera Kadaluarsa"
- 4-7 hari: badge oranye "Kadaluarsa Minggu Ini"
- > 7 hari atau null: tidak ada badge

### Update BahanBakuListPage
Setiap baris bahan baku: nama menjadi link ke `/bahan-baku/:id` (detail).

---

## 2. ProduksiDetailPage (`/produksi/:id`)

### Layout
- **Header**: nama menu (dari relasi), tanggal, status badge, tombol aksi
- **Info grid**: porsi target | porsi diproduksi | porsi gagal | waktu mulai | waktu selesai
- **Section Biaya Produksi**: tabel item biaya + summary total + cost per porsi + form tambah
- **Section QC Checklist**: tombol init QC → daftar item dengan checkbox → badge passed/failed → tombol "Selesaikan QC"

### Section Biaya Produksi
- Tabel: Kategori | Deskripsi | Jumlah
- Summary: Total Biaya + Cost Per Porsi
- Tombol "+ Tambah Biaya" → form inline: kategori dropdown + deskripsi + jumlah
- Hapus item dengan konfirmasi

### Section QC Checklist
- Jika belum init: tombol "Init QC dari Template" (disabled jika produksi belum IN_PROGRESS)
- Setelah init: list item dengan toggle passed/not passed + textarea catatan
- Tombol "Selesaikan QC" (set qc_selesai=true)
- Badge status per item: hijau (passed) / merah (failed) / abu (belum dicek)

### Fix Route
- Sebelum: `/produksi/:id` → ProduksiListPage
- Sesudah: `/produksi/:id` → ProduksiDetailPage
- Update ProduksiListPage: tambah link ke detail dari nama produksi

---

## 3. API Clients Baru

```typescript
// stok-batch.ts
stokBatchApi.getBahan(bahanBakuId)                    // GET /bahan-baku/:id/batches
stokBatchApi.createManual(bahanBakuId, dto)           // POST /bahan-baku/:id/batches
stokBatchApi.update(id, dto)                          // PATCH /stok-batch/:id
stokBatchApi.expiring(days)                           // GET /stok-batch/expiring?days=N

// biaya-produksi.ts
biayaApi.get(produksiId)                              // GET /produksi/:id/biaya
biayaApi.tambah(produksiId, dto)                      // POST /produksi/:id/biaya
biayaApi.hapus(produksiId, itemId)                    // DELETE /produksi/:id/biaya/:itemId

// qc.ts
qcApi.getTemplate()                                   // GET /qc-template
qcApi.getHasil(produksiId)                            // GET /produksi/:id/qc
qcApi.init(produksiId)                                // POST /produksi/:id/qc/init
qcApi.centang(produksiId, hasilId, dto)               // PATCH /produksi/:id/qc/:hasilId
qcApi.selesai(produksiId)                             // POST /produksi/:id/qc/selesai
```

---

## 4. File Structure

```
src/
├── api/endpoints/
│   ├── stok-batch.ts         (baru)
│   ├── biaya-produksi.ts     (baru)
│   └── qc.ts                 (baru)
├── types/index.ts             (tambah types baru)
├── pages/
│   ├── bahan-baku/
│   │   ├── BahanBakuDetailPage.tsx  (baru)
│   │   └── BahanBakuListPage.tsx    (update: tambah link ke detail)
│   └── produksi/
│       ├── ProduksiDetailPage.tsx   (baru)
│       └── ProduksiListPage.tsx     (update: link ke detail)
└── App.tsx                    (update: fix produksi/:id route + bahan-baku/:id route)
```
