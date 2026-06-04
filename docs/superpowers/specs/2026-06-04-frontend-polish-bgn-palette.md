# Design: Frontend Polish — BGN Full Palette

**Tanggal:** 2026-06-04
**Scope:** Visual polish seluruh frontend MBG menggunakan 4 warna resmi BGN secara proporsional. Tidak ada perubahan logic, routing, atau API.

---

## Latar Belakang

Setelah color rebrand ke navy BGN (`#071e49`), app terasa monochrome — sidebar, tombol, dan fokus ring semuanya warna yang sama. BGN punya 4 warna resmi (navy, biru muda, hijau cerah, emas) yang seharusnya berperan bersama. Polish ini mengaktifkan ketiga warna yang belum dipakai.

---

## Warna Resmi BGN (Referensi: bgn.go.id/logo-meaning)

| Token | Hex | Makna |
|---|---|---|
| Navy | `#071e49` | Kebijaksanaan, stabilitas — sudah dipakai |
| Biru Muda | `#b5e0ea` | Ketenangan, harapan — belum optimal |
| Hijau Cerah | `#92d05d` | Kesehatan, pertumbuhan — belum dipakai |
| Emas | `#d1b06c` | Kemakmuran, keberhasilan — belum dipakai |

---

## 1. Tailwind Config — Tambah Scale Baru

Tambah dua scale ke `theme.extend.colors` di `tailwind.config.js` di samping `bgn` yang sudah ada:

```js
'bgn-green': {
  50:  '#f4fce8',
  100: '#e5f8cc',
  200: '#cbf099',
  300: '#aae360',
  400: '#92d05d',  // base resmi BGN
  500: '#72b03e',
  600: '#568e2b',
  700: '#3f6e1e',
  800: '#2a4f13',
  900: '#18300a',
},
'bgn-gold': {
  50:  '#fdf8ee',
  100: '#f9edcf',
  200: '#f3d99e',
  300: '#e9c06d',
  400: '#d1b06c',  // base resmi BGN
  500: '#b8924a',
  600: '#96732e',
  700: '#74551e',
  800: '#523b12',
  900: '#322308',
},
```

---

## 2. Mapping Perubahan Kelas Tailwind

### Tombol Primary
Semua tombol aksi utama (Simpan, Buat, Generate, dll):

| Sekarang | Ganti Dengan |
|---|---|
| `bg-bgn-900` (di tombol) | `bg-bgn-green-400` |
| `hover:bg-bgn-800` (di tombol) | `hover:bg-bgn-green-500` |

**Cara identifikasi tombol primary:** semua `<button>` dan `<Link>` yang punya `bg-bgn-900 text-white` dengan tujuan submit/create/action.

**Yang TIDAK diubah:** tombol Keluar di sidebar (`bg-bgn-900` sidebar nav), karena itu bukan tombol aksi melainkan navigasi.

### Focus Ring Input
| Sekarang | Ganti Dengan |
|---|---|
| `focus:ring-bgn-600` | `focus:ring-bgn-green-400` |

### Tombol Secondary/Outline (opsional, jika ada)
Tombol Batal atau Edit yang saat ini pakai `text-bgn-800`:
- Tetap seperti sekarang, tidak perlu diubah

---

## 3. Sidebar — Active State & Logo

**File:** `src/components/Layout.tsx`

### Active Nav Item
Gunakan `useLocation()` dari `react-router-dom` untuk deteksi route aktif. Item yang match:
```tsx
// Active
className="flex items-center ... border-l-4 border-bgn-green-400 bg-bgn-800 font-semibold"

// Inactive (sudah ada, tidak berubah)
className="block px-4 py-2 text-sm hover:bg-bgn-800 transition-colors"
```

Untuk item Notifikasi (yang punya badge), sama — tambah active state.

### Logo Area
Ganti teks `"MBG"` di sidebar atas dengan:
```tsx
<p className="font-bold text-lg tracking-wide">MBG</p>
<p className="text-xs text-bgn-200 mt-0.5">Makan Bergizi Gratis</p>
```
Subtitle menggunakan `text-bgn-200` (biru muda sangat redup) — tidak mengganggu tapi memberi konteks.

---

## 4. Dashboard Cards — Colored Border + Icon

**File:** `src/pages/DashboardPage.tsx`

Setiap card mendapat:
1. `border-l-4` dengan warna berbeda per card
2. Emoji icon di pojok kanan atas sebagai visual cue (tidak perlu icon library)

| Card | Left Border | Icon |
|---|---|---|
| Stok Menipis | `border-l-4 border-bgn-gold-400` | `⚠️` |
| Stok Habis | `border-l-4 border-red-400` | `🚫` |
| Cost Per Porsi | `border-l-4 border-bgn-green-400` | `💰` |
| Total Porsi Bulan Ini | `border-l-4 border-bgn-200` | `🍱` |

Card container: tambah `relative overflow-hidden` untuk positioning icon.

Layout icon (pojok kanan atas card, text-2xl, opacity-20):
```tsx
<span className="absolute top-3 right-4 text-2xl opacity-20 select-none">⚠️</span>
```

---

## 5. Tabel List Pages — Header, Zebra, Hover

**Files:** semua `*ListPage.tsx` (9 file: menu, bahan-baku, pengadaan, produksi, distribusi, keuangan, laporan, notifikasi, penerima — jika ada)

### Table Header Row (`<thead>`)
```tsx
// Sekarang:
<thead className="bg-gray-50">
  <tr>
    <th className="text-left px-4 py-3 text-gray-600 font-medium">

// Ganti dengan:
<thead className="bg-bgn-200">
  <tr>
    <th className="text-left px-4 py-3 text-bgn-900 font-semibold text-sm uppercase tracking-wide">
```

### Zebra Stripe & Hover (`<tbody> <tr>`)
```tsx
// Sekarang:
<tr key={item.id} className="hover:bg-gray-50">

// Ganti dengan:
<tr key={item.id} className="odd:bg-white even:bg-bgn-50 hover:bg-bgn-100 transition-colors">
```

### Container Tabel
```tsx
// Sekarang:
<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

// Ganti dengan:
<div className="bg-white rounded-xl shadow-md border border-bgn-100 overflow-hidden">
```

---

## 6. File Structure

| Action | File | Perubahan |
|---|---|---|
| Modify | `tailwind.config.js` | Tambah `bgn-green` + `bgn-gold` scales |
| Modify | `src/components/Layout.tsx` | Active state sidebar + logo subtitle |
| Modify | `src/pages/DashboardPage.tsx` | Border warna + icon per card |
| Modify | `src/pages/menu/MenuListPage.tsx` | Table header + zebra + hover |
| Modify | `src/pages/bahan-baku/BahanBakuListPage.tsx` | Table header + zebra + hover |
| Modify | `src/pages/pengadaan/PengadaanListPage.tsx` | Table header + zebra + hover |
| Modify | `src/pages/produksi/ProduksiListPage.tsx` | Table header + zebra + hover |
| Modify | `src/pages/distribusi/DistribusiListPage.tsx` | Table header + zebra + hover |
| Modify | `src/pages/keuangan/KeuanganListPage.tsx` | Table header + zebra + hover |
| Modify | `src/pages/laporan/LaporanListPage.tsx` | Table header + zebra + hover + button |
| Modify | `src/pages/notifikasi/NotifikasiPage.tsx` | Table/card + button jika ada |
| Bulk modify | semua `*FormPage.tsx` (8 file) | Tombol primary → `bgn-green` + focus ring |
| Bulk modify | semua `*ListPage.tsx` | Tombol "+ Buat/Generate" → `bgn-green` |

---

## Yang TIDAK Diubah

- `StatusBadge.tsx` — warna semantik (hijau = berhasil, merah = gagal) tetap
- Logic, routing, API calls — tidak ada perubahan
- Struktur komponen — tidak ada refactor
- Sidebar background (`bgn-900`) dan hover (`bgn-800`) — tetap navy
- Warna teks konten — tetap gray

---

## Hasil Akhir yang Diharapkan

- Sidebar: navy dengan active indicator hijau BGN
- Tombol aksi: hijau cerah BGN (#92d05d) — lebih hidup dari navy
- Dashboard: 4 card dengan border warna berbeda + icon
- Tabel: header biru muda BGN, zebra stripe, hover smooth
- Konsisten dengan 4 warna resmi BGN secara proporsional
