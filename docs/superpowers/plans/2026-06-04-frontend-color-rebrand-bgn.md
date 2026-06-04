# Frontend Color Rebrand — BGN Blue

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ganti semua warna `green-*` di frontend dengan palet biru BGN resmi (`#071e49` biru tua, `#b5e0ea` biru muda pastel), sesuai identitas visual Badan Gizi Nasional.

**Architecture:** Tambah custom color scale `bgn` ke `tailwind.config.js`, lalu replace semua class Tailwind `green-*` dengan `bgn-*` di seluruh `src/`. StatusBadge tetap pakai `green-100/green-700` untuk status positif (COMPLETED, DELIVERED, dll) karena itu bukan warna brand — itu warna semantik.

**Tech Stack:** Tailwind CSS v3, React, TypeScript

---

## Mapping Warna

| Warna Lama | Hex Lama | Ganti Dengan | Hex Baru | Dipakai Di |
|---|---|---|---|---|
| `green-700` | `#15803d` | `bgn-900` | `#071e49` | Sidebar bg |
| `green-600` | `#16a34a` | `bgn-800` | `#0d3d5c` | Button bg, sidebar hover |
| `hover:bg-green-700` | — | `hover:bg-bgn-900` | — | Button hover |
| `hover:bg-green-600` | — | `hover:bg-bgn-800` | — | Sidebar nav hover |
| `focus:ring-green-500` | — | `focus:ring-bgn-600` | — | Input focus ring |
| `text-green-700` | — | `text-bgn-900` | — | Login title |
| `text-green-600` | — | `text-bgn-800` | — | Link teks, tombol teks |
| `text-green-200` | — | `text-bgn-300` | — | Sidebar teks redup |
| `text-green-300` | — | `text-bgn-200` | — | Sidebar teks sangat redup |
| `border-green-600` | — | `border-bgn-800` | — | Sidebar border |
| `border-green-500` | — | `border-bgn-600` | — | Border aksen |
| `border-green-200` | — | `border-bgn-200` | — | Border light |
| `bg-green-50` | — | `bg-bgn-50` | — | Background sangat muda |
| `bg-green-100` | — | `bg-bgn-100` | — | Background muda (badge, dll) |

**Tidak diubah** (warna semantik, bukan brand):
- `StatusBadge`: `bg-green-100 text-green-700` untuk COMPLETED/RECEIVED/DELIVERED/ACCEPTED/NORMAL — ini warna "berhasil/positif", bukan brand BGN
- Warna `text-green-600` di tombol Excel di `LaporanListPage` (warna semantik Excel = hijau) — **diubah** ke `bgn-800` karena itu tombol aksi utama, bukan ikon file

---

## Palet BGN Custom (Tailwind)

```js
bgn: {
  50:  '#eef4fb',
  100: '#d6e8f5',
  200: '#b5e0ea',  // BGN biru muda pastel (resmi)
  300: '#87c9d9',
  400: '#56afc5',
  500: '#3594ae',
  600: '#247893',
  700: '#1a5f78',
  800: '#0d3d5c',
  900: '#071e49',  // BGN biru tua (resmi)
}
```

---

## File Structure

| Action | Path | Tanggung Jawab |
|--------|------|----------------|
| Modify | `tailwind.config.js` | Tambah palet `bgn` ke `theme.extend.colors` |
| Modify | `src/components/Layout.tsx` | `green-*` → `bgn-*` |
| Modify | `src/pages/LoginPage.tsx` | `green-*` → `bgn-*` |
| Modify | `src/pages/DashboardPage.tsx` | `green-*` → `bgn-*` (jika ada) |
| Modify | `src/pages/menu/MenuListPage.tsx` | `green-*` → `bgn-*` |
| Modify | `src/pages/menu/MenuFormPage.tsx` | `green-*` → `bgn-*` |
| Modify | `src/pages/bahan-baku/BahanBakuListPage.tsx` | `green-*` → `bgn-*` |
| Modify | `src/pages/bahan-baku/BahanBakuFormPage.tsx` | `green-*` → `bgn-*` |
| Modify | `src/pages/pengadaan/PengadaanListPage.tsx` | `green-*` → `bgn-*` |
| Modify | `src/pages/pengadaan/PengadaanFormPage.tsx` | `green-*` → `bgn-*` |
| Modify | `src/pages/pengadaan/PengadaanDetailPage.tsx` | `green-*` → `bgn-*` |
| Modify | `src/pages/produksi/ProduksiListPage.tsx` | `green-*` → `bgn-*` |
| Modify | `src/pages/produksi/ProduksiFormPage.tsx` | `green-*` → `bgn-*` |
| Modify | `src/pages/distribusi/DistribusiListPage.tsx` | `green-*` → `bgn-*` |
| Modify | `src/pages/distribusi/DistribusiFormPage.tsx` | `green-*` → `bgn-*` |
| Modify | `src/pages/keuangan/KeuanganListPage.tsx` | `green-*` → `bgn-*` |
| Modify | `src/pages/keuangan/KeuanganFormPage.tsx` | `green-*` → `bgn-*` |
| Modify | `src/pages/laporan/LaporanListPage.tsx` | `green-*` → `bgn-*` (kecuali tombol Excel) |
| Modify | `src/pages/laporan/LaporanFormPage.tsx` | `green-*` → `bgn-*` |

---

## Task 1: Tambah palet BGN ke Tailwind config

**Files:**
- Modify: `tailwind.config.js`

- [ ] **Step 1: Buka `/home/wanda/mbg-web/tailwind.config.js` dan ganti seluruh isinya dengan:**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bgn: {
          50:  '#eef4fb',
          100: '#d6e8f5',
          200: '#b5e0ea',
          300: '#87c9d9',
          400: '#56afc5',
          500: '#3594ae',
          600: '#247893',
          700: '#1a5f78',
          800: '#0d3d5c',
          900: '#071e49',
        },
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 2: Verifikasi build frontend tidak error**

```bash
cd /home/wanda/mbg-web && npx tsc --noEmit 2>&1 | head -10
```

Expected: tidak ada output (no TypeScript errors).

- [ ] **Step 3: Commit**

```bash
cd /home/wanda/mbg-web
git add tailwind.config.js
git commit -m "feat: tambah palet warna BGN ke Tailwind config"
```

---

## Task 2: Update Layout.tsx — sidebar biru BGN

**Files:**
- Modify: `src/components/Layout.tsx`

- [ ] **Step 1: Buka `/home/wanda/mbg-web/src/components/Layout.tsx` dan ganti semua class green-* sesuai mapping:**

Perubahan yang perlu dilakukan (gunakan find-replace):

| Cari | Ganti |
|------|-------|
| `bg-green-700` | `bg-bgn-900` |
| `border-green-600` | `border-bgn-800` |
| `text-green-200` | `text-bgn-300` |
| `text-green-300` | `text-bgn-200` |
| `hover:bg-green-600` | `hover:bg-bgn-800` |

Hasil akhir blok `<aside>` harus terlihat seperti:
```tsx
<aside className="w-56 bg-bgn-900 text-white flex flex-col">
  <div className="px-4 py-5 border-b border-bgn-800">
    <p className="font-bold text-lg">MBG</p>
    <p className="text-xs text-bgn-300 truncate">{user?.email}</p>
    <p className="text-xs text-bgn-200">{user?.role}</p>
  </div>
  <nav className="flex-1 py-2">
    {navItems.map((item) =>
      item.label === 'Notifikasi' ? (
        <Link
          key={item.to}
          to={item.to}
          className="flex items-center justify-between px-4 py-2 text-sm hover:bg-bgn-800 transition-colors"
        >
          ...
        </Link>
      ) : (
        <Link
          key={item.to}
          to={item.to}
          className="block px-4 py-2 text-sm hover:bg-bgn-800 transition-colors"
        >
          {item.label}
        </Link>
      )
    )}
  </nav>
  <button
    onClick={handleLogout}
    className="px-4 py-3 text-sm text-bgn-300 hover:text-white hover:bg-bgn-800 text-left transition-colors border-t border-bgn-800"
  >
    Keluar
  </button>
</aside>
```

- [ ] **Step 2: Commit**

```bash
cd /home/wanda/mbg-web
git add src/components/Layout.tsx
git commit -m "feat: rebrand sidebar warna BGN biru"
```

---

## Task 3: Update LoginPage.tsx

**Files:**
- Modify: `src/pages/LoginPage.tsx`

- [ ] **Step 1: Ganti semua `green-*` di `LoginPage.tsx`:**

| Cari | Ganti |
|------|-------|
| `text-green-700` | `text-bgn-900` |
| `focus:ring-green-500` | `focus:ring-bgn-600` |
| `bg-green-600` | `bg-bgn-900` |
| `hover:bg-green-700` | `hover:bg-bgn-800` |

- [ ] **Step 2: Commit**

```bash
cd /home/wanda/mbg-web
git add src/pages/LoginPage.tsx
git commit -m "feat: rebrand login page warna BGN biru"
```

---

## Task 4: Update semua halaman CRUD — bulk replace

**Files:**
- Modify: semua `.tsx` di `src/pages/` kecuali file yang tidak punya `green-*`

- [ ] **Step 1: Jalankan bulk sed replace untuk pattern umum di semua halaman**

```bash
cd /home/wanda/mbg-web/src/pages

# Pattern yang paling umum — tombol primary dan focus ring
find . -name "*.tsx" -exec sed -i \
  -e 's/bg-green-600/bg-bgn-900/g' \
  -e 's/hover:bg-green-700/hover:bg-bgn-800/g' \
  -e 's/focus:ring-green-500/focus:ring-bgn-600/g' \
  -e 's/text-green-600/text-bgn-800/g' \
  -e 's/text-green-700/text-bgn-900/g' \
  -e 's/border-green-500/border-bgn-600/g' \
  -e 's/border-green-200/border-bgn-200/g' \
  -e 's/bg-green-50/bg-bgn-50/g' \
  -e 's/bg-green-100/bg-bgn-100/g' \
  -e 's/bg-green-200/bg-bgn-200/g' \
  {} \;
```

- [ ] **Step 2: Verifikasi tidak ada `green-*` yang tersisa di pages (kecuali StatusBadge)**

```bash
grep -r "green-" /home/wanda/mbg-web/src/pages/ --include="*.tsx" | grep -v "StatusBadge"
```

Jika masih ada sisa `green-*`, fix manual.

- [ ] **Step 3: Verifikasi TypeScript clean**

```bash
cd /home/wanda/mbg-web && npx tsc --noEmit 2>&1 | head -10
```

Expected: tidak ada output.

- [ ] **Step 4: Commit**

```bash
cd /home/wanda/mbg-web
git add src/pages/
git commit -m "feat: rebrand semua halaman CRUD — green ke BGN biru"
```

---

## Task 5: Visual smoke test — screenshot sebelum dan sesudah

**Files:** tidak ada perubahan kode

- [ ] **Step 1: Pastikan dev server running di port 5173**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/
```

Expected: `200`

- [ ] **Step 2: Navigasi ke login page via Playwright dan screenshot**

Gunakan Playwright MCP tool (`mcp__plugin_playwright_playwright__browser_navigate`) untuk buka `http://localhost:5173/login` lalu `browser_take_screenshot`. Verifikasi:
- Background tombol "Masuk" biru gelap (bukan hijau)
- Judul "MBG" berwarna biru gelap

- [ ] **Step 3: Login dan screenshot sidebar**

Login dengan `kepala@sppg.id` / `Password123!`, screenshot dashboard. Verifikasi:
- Sidebar biru gelap `#071e49` (bukan hijau)
- Hover item sidebar biru sedikit lebih muda

- [ ] **Step 4: Commit final jika ada perbaikan visual dari smoke test**

```bash
cd /home/wanda/mbg-web
git add -A
git commit -m "fix: perbaikan visual color rebrand setelah smoke test"
```
