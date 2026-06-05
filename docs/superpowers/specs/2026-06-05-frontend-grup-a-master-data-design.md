# Design: Frontend Grup A — Master Data Baru (Supplier, Resep, Lokasi Gudang)

**Tanggal:** 2026-06-05
**Scope:** Tiga modul CRUD baru — Supplier, Resep/BOM, Lokasi Gudang. Semua ikuti pola existing pages.

---

## 1. Supplier (`/supplier`, `/supplier/baru`, `/supplier/:id/edit`)

**SupplierListPage:**
- Tabel: Nama | Jenis Usaha | Kategori | Kontak (PIC + telepon) | Termin Bayar | Status
- Filter: kategori dropdown + isActive toggle
- Tombol "+ Tambah Supplier" → form page
- Aksi per row: Edit | Hapus (soft delete)

**SupplierFormPage (create + edit):**
- Field wajib: nama, jenisUsaha, namaPic, telepon, kategori, terminBayar
- Field opsional: npwp, email, alamat, kota, namaBank, noRekening, atasNama, minOrder, leadTime, catatan
- Grouped dalam sections: "Identitas", "Kontak", "Keuangan", "Operasional"

---

## 2. Resep/BOM (`/resep`, `/resep/baru`, `/resep/:id`)

**ResepListPage:**
- Tabel: Nama Resep | Jenis Penerima | Jumlah Item | Status (aktif/nonaktif) | Aksi
- Filter: jenisPenerima dropdown

**ResepFormPage (create only — edit via detail):**
- Field: namaResep, jenisPenerima, deskripsi, isActive

**ResepDetailPage:**
- Header: nama + jenisPenerima badge + isActive badge
- Tabel items: Nama Bahan | Satuan | Jumlah Per Porsi | Catatan | Hapus
- Form tambah item: dropdown bahan baku + jumlah + catatan
- Preview kebutuhan: input jumlah porsi → tampilkan kebutuhan bahan (GET /resep/:id/kebutuhan?jumlahPorsi=N)

---

## 3. Lokasi Gudang (`/lokasi-gudang`)

**LokasiGudangPage (list + modal):**
- Tabel: Nama | Tipe (KERING/DINGIN/BEKU) | Status | Aksi
- Tombol "+ Tambah" → modal inline form
- Edit via modal
- Hapus dengan konfirmasi

---

## API Clients Baru

```typescript
// supplier.ts: list, getOne, create, update, delete
// resep.ts: list, getOne, create, addItem, updateItem, removeItem, kebutuhan
// lokasi-gudang.ts: list, create, update, delete
```

---

## Routes Baru

```
/supplier          → SupplierListPage
/supplier/baru     → SupplierFormPage
/supplier/:id/edit → SupplierFormPage
/resep             → ResepListPage
/resep/baru        → ResepFormPage
/resep/:id         → ResepDetailPage
/lokasi-gudang     → LokasiGudangPage
```

Nav sidebar: tambah "Supplier", "Resep", "Lokasi Gudang"
