# Desain — Import & Tampil RAB Mingguan (Increment 1)

Tanggal: 2026-06-12
Status: disetujui (siap disusun rencana implementasi)
Repo terdampak: `mbg-new` (backend NestJS) dan `mbg-web` (frontend React/Vite)

## Latar belakang

Laporan keuangan asli SPPG berbentuk **RAB (Rencana Anggaran Biaya)** — file Excel
per minggu yang diajukan ke BGN sebelum dana cair. Tiga file acuan ada di
`mbg-new/docs/`:

- `P1W1 - RAB minggu 1 periode 1.xlsx`
- `minggu 1 periode 2.xlsx`
- `minggu 2 periode 1.xlsx`

Struktur tiap file (konsisten di ketiganya):

- Sheet per hari masak bernama `"Monday Future "`, `"Tuesday Future "`, … (label
  "Future" = hari mendatang yang direncanakan). Tiap sheet adalah satu
  *Material Requisition Form* harian.
- Sheet opsional `"B3"` — komponen terpisah (snack/susu/buah, mis. "Susu, Apel").
- Sheet `"anggaran"` — ringkasan mingguan: total anggaran, penggunaan, sisa.

Isi tiap sheet hari (posisi sel tetap, sudah diverifikasi):

- Baris 5 ke bawah: penerima manfaat per kategori
  (`kategori | jumlah porsi | harga/porsi | subtotal`), diakhiri baris "Total".
- Baris 13 kolom B: menu hari itu (teks).
- Baris 16: header tabel bahan `CTG | ITEM | QTY | SATUAN | HARGA SATUAN | TOTAL HS`.
- Baris 18 ke bawah: daftar bahan, diakhiri "TOTAL BAHAN BAKU".
- Ada nilai "Sisa anggaran" per hari (bisa negatif).

Modul Laporan/Keuangan app saat ini hanya menghasilkan rekap KPI agregat
(`LaporanExportService`), **belum** berbentuk RAB. Tujuan jangka panjang: app
menyamai format asli secara bertahap (pendekatan inkremental / "C").

## Lingkup Increment 1

Satu irisan vertikal: **import file Excel RAB → simpan terstruktur → tampil
read-only di web**. Fitur import dirancang permanen (dipakai sekarang untuk
memuat data contoh, dan tetap tersedia untuk staf upload mingguan).

### Termasuk

1. Menu sidebar baru "RAB Mingguan" (role `KEPALA_SPPG`, `BENDAHARA`).
2. Halaman daftar RAB + tombol "Import Excel" (upload `.xlsx`).
3. Backend mem-parse file (template seperti 3 file acuan) → simpan ke DB.
4. Halaman detail read-only: ringkasan anggaran + per hari (penerima manfaat,
   menu, daftar bahan, total bahan baku, sisa anggaran).
5. Ketiga file acuan dimuat sebagai data contoh via importer yang sama (seed).

### Tidak termasuk (increment berikutnya)

- Membuat/edit RAB dari dalam app (increment ini read-only).
- Keterhubungan ke master data (Sekolah, Bahan Baku) — data import disimpan
  sebagai snapshot mandiri.
- Perhitungan RAB otomatis dari menu/resep.
- Export balik ke Excel.

## Model data (4 tabel baru)

Semua tabel mandiri (tidak mengubah tabel lain), punya `sppg_id` dan soft-delete
mengikuti konvensi entitas lain. Nilai uang disimpan apa adanya dari file (tidak
dihitung ulang di increment ini) agar tampilan persis aslinya.

### `rab_mingguan` (satu file = satu baris)
| kolom | tipe | sumber |
|---|---|---|
| id (uuid) | PK | — |
| sppg_id (uuid) | FK | konteks user |
| label | varchar | dari nama file (mis. "Minggu 1 Periode 1") |
| total_anggaran | numeric | sheet `anggaran` |
| penggunaan_anggaran | numeric | sheet `anggaran` |
| sisa_anggaran | numeric | sheet `anggaran` |
| sumber_file | varchar | nama file asli |
| imported_at | timestamptz | sistem |
| created_by | uuid null | sistem |
| created_at / updated_at / deleted_at | — | konvensi |

### `rab_hari` (satu sheet hari atau B3 = satu baris)
| kolom | tipe | catatan |
|---|---|---|
| id (uuid) | PK | — |
| rab_mingguan_id | FK → rab_mingguan (CASCADE) | — |
| nama_hari | varchar | "Senin"…"Jumat" atau "B3" |
| jenis | enum `HARIAN` \| `B3` | — |
| menu | text null | teks menu |
| total_bahan_baku | numeric | TOTAL BAHAN BAKU |
| sisa_anggaran | numeric | per hari (bisa minus) |

### `rab_penerima` (baris penerima manfaat)
| kolom | tipe |
|---|---|
| id (uuid) PK | — |
| rab_hari_id FK → rab_hari (CASCADE) | — |
| kategori | varchar (mis. "PAUD, TK, SD 1-3") |
| jumlah_porsi | int |
| harga_per_porsi | numeric |
| subtotal | numeric |

### `rab_bahan` (baris bahan baku)
| kolom | tipe |
|---|---|
| id (uuid) PK | — |
| rab_hari_id FK → rab_hari (CASCADE) | — |
| ctg | varchar null (sering kosong) |
| item | varchar |
| qty | numeric (desimal: 44, 0.25, 0.1) |
| satuan | varchar (mis. "KG", "PCS", "LITER") |
| harga_satuan | numeric |
| total_hs | numeric |

Relasi: `rab_mingguan` 1—N `rab_hari` 1—N (`rab_penerima` + `rab_bahan`).

## Backend (`mbg-new`, modul `src/modules/rab/`)

Mengikuti pola modul `keuangan` dan `upload` yang ada.

```
src/modules/rab/
  entities/  rab-mingguan, rab-hari, rab-penerima, rab-bahan .entity.ts
  dto/       query-rab.dto.ts
  rab-parser.service.ts        # Excel -> objek terstruktur (ExcelJS)
  rab.service.ts               # simpan ke DB (transaksi), list, detail, hapus
  rab.controller.ts            # endpoint REST
  rab.module.ts
  rab-parser.service.spec.ts   # unit test parser pakai 3 file asli
src/database/migrations/        # 1 migrasi membuat 4 tabel
```

### Endpoint (prefix `/api/v1`, `JwtAuthGuard` + `RolesGuard`, role `KEPALA_SPPG`, `BENDAHARA`)
| Method | Path | Fungsi |
|---|---|---|
| POST | `/rab/import` | upload `.xlsx` (`FileInterceptor`, memori, max 5MB, validasi MIME xlsx) → parse → simpan → balikan ringkasan |
| GET | `/rab` | daftar RAB mingguan (difilter `sppg_id` user) |
| GET | `/rab/:id` | detail lengkap (hari + penerima + bahan) |
| DELETE | `/rab/:id` | soft-delete |

### `rab-parser.service.ts`
- Loop semua sheet:
  - Nama mengandung `"Future"` → `jenis = HARIAN`; petakan Monday→Senin, dst.
  - Nama `"B3"` → `jenis = B3`.
  - Nama `"anggaran"` → ambil total/penggunaan/sisa.
  - Sheet lain diabaikan.
- Per sheet hari: penerima manfaat (baris 5 → "Total"), menu (baris 13 kolom B),
  tabel bahan (baris 18 → "TOTAL BAHAN BAKU"), ambil total bahan baku & sisa.
- Tahan banting: lewati baris kosong & sel `#REF!`/`null`.

### Penanganan error
- Bukan `.xlsx` / korup → `BadRequestException` 400
  ("File harus Excel (.xlsx) sesuai format RAB.").
- Sheet `anggaran` tidak ada / header tabel tak cocok → 400 dengan sebut bagian
  yang kurang ("File tidak sesuai format RAB: …"). Tidak boleh 500.
- Penyimpanan dalam satu transaksi DB; gagal = rollback, tanpa data setengah jadi.

## Frontend (`mbg-web`)

Mengikuti pola halaman & API yang ada.

```
src/api/endpoints/rab.ts        # list, detail, import (multipart), delete
src/pages/rab/RabListPage.tsx
src/pages/rab/RabDetailPage.tsx
src/types                       # tambah tipe Rab*
```

- Menu sidebar "RAB Mingguan" di kelompok Operasional dekat Keuangan/Laporan,
  role `KEPALA_SPPG` + `BENDAHARA`.
- Route: `/rab` (list), `/rab/:id` (detail) di `App.tsx`.
- **RabListPage:** tabel (Label · Total anggaran · Penggunaan · Sisa · Tanggal
  import · aksi Lihat/Hapus) + tombol "Import Excel" (file picker `.xlsx` →
  `POST /rab/import` → notifikasi sukses/gagal dari backend → refresh). Pakai
  React Query.
- **RabDetailPage (read-only):** header label + kartu ringkasan anggaran
  (sisa merah bila minus); pemilih hari (Senin…Jumat, B3); per hari: menu, tabel
  penerima manfaat (kategori · porsi · harga/porsi · subtotal), tabel bahan baku
  (item · qty · satuan · harga satuan · total), total bahan baku & sisa anggaran.
- Bahasa Indonesia, sentence case, format `Rp` `id-ID` (pakai util yang ada).

## Data contoh & testing

- **Data contoh:** `src/database/seed.ts` memanggil `RabParserService` atas
  ketiga file di `mbg-new/docs/`, simpan ke SPPG contoh (`58e4527d-…`). `npm run
  seed` mengisi 3 RAB → langsung tampil di web. File `.xlsx` tetap di `docs/`.
- **Unit test parser:** assert angka kunci — file 1: total anggaran 17.346.000,
  sisa 27.250; Senin total 619 porsi, total bahan baku 6.215.750.
- **Test file rusak:** non-xlsx & xlsx tanpa sheet `anggaran` → 400, bukan 500.
- **Verifikasi manual:** import lewat web, buka detail, cocokkan dengan Excel.

## Catatan lintas-repo

Backend (`mbg-new`) dan frontend (`mbg-web`) adalah dua repo terpisah. Spec ini
disimpan di `mbg-web` sebagai rumah perencanaan; rencana implementasi akan
membagi tugas per repo.
