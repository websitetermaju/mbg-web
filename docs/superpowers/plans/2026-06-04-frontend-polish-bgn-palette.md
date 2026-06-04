# Frontend Polish — BGN Full Palette

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish visual frontend MBG menggunakan 4 warna resmi BGN secara proporsional — tombol primary hijau BGN, sidebar dengan active state, dashboard cards berwarna, tabel dengan header biru muda dan zebra stripe.

**Architecture:** Semua perubahan murni CSS/Tailwind di React frontend. Tambah dua Tailwind color scale baru (`bgn-green`, `bgn-gold`), lalu bulk replace class di pages dan components. Tidak ada perubahan logic atau API.

**Tech Stack:** Tailwind CSS v3, React, TypeScript. Project path: `/home/wanda/mbg-web`

---

## File Structure

| Action | Path | Perubahan |
|--------|------|-----------|
| Modify | `tailwind.config.js` | Tambah `bgn-green` + `bgn-gold` color scales |
| Modify | `src/components/Layout.tsx` | Active state sidebar + logo subtitle |
| Modify | `src/pages/DashboardPage.tsx` | Colored border + icon per stat card |
| Bulk modify | `src/pages/**/` (16 file) | Tombol primary → bgn-green, focus ring, table header+zebra |

---

## Task 1: Tambah Color Scales bgn-green dan bgn-gold ke Tailwind

**Files:**
- Modify: `tailwind.config.js`

- [ ] **Step 1: Ganti seluruh isi `tailwind.config.js` dengan:**

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
        'bgn-green': {
          50:  '#f4fce8',
          100: '#e5f8cc',
          200: '#cbf099',
          300: '#aae360',
          400: '#92d05d',
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
          400: '#d1b06c',
          500: '#b8924a',
          600: '#96732e',
          700: '#74551e',
          800: '#523b12',
          900: '#322308',
        },
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 2: Verifikasi TypeScript clean**

```bash
cd /home/wanda/mbg-web && npx tsc --noEmit 2>&1 | head -10
```

Expected: tidak ada output.

- [ ] **Step 3: Commit**

```bash
cd /home/wanda/mbg-web
git add tailwind.config.js
git commit -m "feat: tambah color scale bgn-green dan bgn-gold ke Tailwind"
```

---

## Task 2: Update Layout.tsx — Active State Sidebar + Logo Subtitle

**Files:**
- Modify: `src/components/Layout.tsx`

- [ ] **Step 1: Ganti seluruh isi `src/components/Layout.tsx` dengan:**

```tsx
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { useQuery } from '@tanstack/react-query'
import { notifikasiApi } from '@/api/endpoints/notifikasi'
import { useNotifikasiSocket } from '@/hooks/useNotifikasiSocket'

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/menu', label: 'Menu Harian' },
  { to: '/bahan-baku', label: 'Bahan Baku' },
  { to: '/pengadaan', label: 'Pengadaan' },
  { to: '/produksi', label: 'Produksi' },
  { to: '/distribusi', label: 'Distribusi' },
  { to: '/keuangan', label: 'Keuangan' },
  { to: '/laporan', label: 'Laporan' },
  { to: '/notifikasi', label: 'Notifikasi' },
]

export function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  useNotifikasiSocket()

  const { data: unreadData } = useQuery({
    queryKey: ['notifikasi', 'unread-count'],
    queryFn: notifikasiApi.unreadCount,
    refetchInterval: 30_000,
  })
  const unreadCount = unreadData?.data.data.count ?? 0

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-60 bg-bgn-900 text-white flex flex-col shrink-0">
        <div className="px-4 py-5 border-b border-bgn-800">
          <p className="font-bold text-xl tracking-wide">MBG</p>
          <p className="text-xs text-bgn-200 mt-0.5">Makan Bergizi Gratis</p>
          <p className="text-xs text-bgn-300 mt-2 truncate">{user?.email}</p>
          <p className="text-xs text-bgn-400 font-medium">{user?.role}</p>
        </div>
        <nav className="flex-1 py-2 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.to)
            const baseClass = `flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
              active
                ? 'border-l-4 border-bgn-green-400 bg-bgn-800 font-semibold text-white'
                : 'border-l-4 border-transparent hover:bg-bgn-800 text-bgn-100'
            }`
            return item.label === 'Notifikasi' ? (
              <Link key={item.to} to={item.to} className={baseClass}>
                <span>{item.label}</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            ) : (
              <Link key={item.to} to={item.to} className={baseClass}>
                {item.label}
              </Link>
            )
          })}
        </nav>
        <button
          onClick={handleLogout}
          className="px-4 py-3 text-sm text-bgn-300 hover:text-white hover:bg-bgn-800 text-left transition-colors border-t border-bgn-800"
        >
          Keluar
        </button>
      </aside>
      {/* Konten utama */}
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Verifikasi TypeScript**

```bash
cd /home/wanda/mbg-web && npx tsc --noEmit 2>&1 | head -10
```

Expected: tidak ada output.

- [ ] **Step 3: Commit**

```bash
cd /home/wanda/mbg-web
git add src/components/Layout.tsx
git commit -m "feat: sidebar active state BGN green + logo subtitle"
```

---

## Task 3: Update DashboardPage — Colored Cards dengan Icon

**Files:**
- Modify: `src/pages/DashboardPage.tsx`

- [ ] **Step 1: Ganti seluruh isi `src/pages/DashboardPage.tsx` dengan:**

```tsx
import { useQuery } from '@tanstack/react-query'
import { bahanBakuApi } from '@/api/endpoints/bahan-baku'
import { keuanganApi } from '@/api/endpoints/keuangan'
import { useAuthStore } from '@/store/auth.store'
import { StatusBadge } from '@/components/StatusBadge'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  borderColor: string
  icon: string
  valueColor?: string
}

function StatCard({ label, value, sub, borderColor, icon, valueColor }: StatCardProps) {
  return (
    <div className={`relative bg-white rounded-xl p-5 shadow-md border border-bgn-100 overflow-hidden ${borderColor}`}>
      <span className="absolute top-3 right-4 text-2xl opacity-20 select-none">{icon}</span>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${valueColor ?? 'text-gray-800'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  const today = new Date()
  const bulanIni = {
    mulai: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`,
    akhir: today.toISOString().slice(0, 10),
  }

  const { data: stokMenipis } = useQuery({
    queryKey: ['bahan-baku', 'low-stock'],
    queryFn: () => bahanBakuApi.list({ statusStok: 'LOW_STOCK', limit: 5 }),
    enabled: !!user,
  })

  const { data: stokHabis } = useQuery({
    queryKey: ['bahan-baku', 'out-of-stock'],
    queryFn: () => bahanBakuApi.list({ statusStok: 'OUT_OF_STOCK', limit: 5 }),
    enabled: !!user,
  })

  const { data: costData } = useQuery({
    queryKey: ['keuangan', 'cost-per-porsi', bulanIni],
    queryFn: () => keuanganApi.costPerPorsi(bulanIni.mulai, bulanIni.akhir),
    enabled: !!user && user.role !== 'ADMIN_BGN',
  })

  const cost = costData?.data.data
  const stokMenipisCount = stokMenipis?.data.meta?.total ?? 0
  const stokHabisCount = stokHabis?.data.meta?.total ?? 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-bgn-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Selamat datang, {user?.nama ?? user?.email}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Stok Menipis"
          value={stokMenipisCount}
          sub="bahan baku LOW_STOCK"
          borderColor="border-l-4 border-bgn-gold-400"
          icon="⚠️"
          valueColor={stokMenipisCount > 0 ? 'text-bgn-gold-600' : 'text-gray-800'}
        />
        <StatCard
          label="Stok Habis"
          value={stokHabisCount}
          sub="bahan baku OUT_OF_STOCK"
          borderColor="border-l-4 border-red-400"
          icon="🚫"
          valueColor={stokHabisCount > 0 ? 'text-red-600' : 'text-gray-800'}
        />
        {cost ? (
          <>
            <StatCard
              label="Cost Per Porsi"
              value={`Rp ${cost.costPerPorsi.toLocaleString('id-ID')}`}
              sub={`Pagu: Rp ${cost.pagu.toLocaleString('id-ID')}`}
              borderColor={cost.melebihiPagu ? 'border-l-4 border-red-400' : 'border-l-4 border-bgn-green-400'}
              icon="💰"
              valueColor={cost.melebihiPagu ? 'text-red-600' : 'text-bgn-green-600'}
            />
            <StatCard
              label="Total Porsi Bulan Ini"
              value={cost.totalPorsi.toLocaleString('id-ID')}
              sub="porsi diproduksi"
              borderColor="border-l-4 border-bgn-200"
              icon="🍱"
            />
          </>
        ) : (
          <>
            <StatCard label="Cost Per Porsi" value="Rp 0" sub="Pagu: Rp 15.000" borderColor="border-l-4 border-bgn-green-400" icon="💰" />
            <StatCard label="Total Porsi Bulan Ini" value={0} sub="porsi diproduksi" borderColor="border-l-4 border-bgn-200" icon="🍱" />
          </>
        )}
      </div>

      {stokMenipisCount > 0 && (
        <div className="bg-white rounded-xl shadow-md border border-bgn-100 p-5 mb-4">
          <h2 className="font-semibold text-bgn-900 mb-3">Bahan Baku Perlu Perhatian</h2>
          <div className="space-y-2">
            {stokMenipis?.data.data.map((b) => (
              <div key={b.id} className="flex items-center justify-between text-sm py-1 border-b border-bgn-50 last:border-0">
                <span className="text-gray-700">{b.nama}</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">{b.stokAkhir} {b.satuan}</span>
                  <StatusBadge status={b.statusStok} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verifikasi TypeScript**

```bash
cd /home/wanda/mbg-web && npx tsc --noEmit 2>&1 | head -10
```

Expected: tidak ada output.

- [ ] **Step 3: Commit**

```bash
cd /home/wanda/mbg-web
git add src/pages/DashboardPage.tsx
git commit -m "feat: dashboard cards dengan colored border dan icon BGN"
```

---

## Task 4: Bulk Replace — Tombol Primary + Focus Ring + Table Style

**Files:**
- Modify: semua file di `src/pages/` dan `src/pages/**/`

Satu sed command yang mengganti:
1. Tombol primary: `bg-bgn-900 text-white ... hover:bg-bgn-900` → `bg-bgn-green-400 text-white ... hover:bg-bgn-green-500`
2. Focus ring input: `focus:ring-bgn-600` → `focus:ring-bgn-green-400`
3. Table thead: `bg-gray-50` → `bg-bgn-200`
4. Table th text: `text-gray-600 font-medium` → `text-bgn-900 font-semibold`
5. Table row hover: `hover:bg-gray-50` → `odd:bg-white even:bg-bgn-50 hover:bg-bgn-100 transition-colors`
6. Table container shadow: `shadow-sm border border-gray-100` → `shadow-md border border-bgn-100`
7. Table divider: `divide-gray-100` → `divide-bgn-100`

- [ ] **Step 1: Jalankan bulk sed replace**

```bash
find /home/wanda/mbg-web/src/pages -name "*.tsx" -exec sed -i \
  -e 's/hover:bg-bgn-900/hover:bg-bgn-green-500/g' \
  -e 's/bg-bgn-900 text-white/bg-bgn-green-400 text-white/g' \
  -e 's/focus:ring-bgn-600/focus:ring-bgn-green-400/g' \
  -e 's/shadow-sm border border-gray-100 overflow-hidden/shadow-md border border-bgn-100 overflow-hidden/g' \
  -e 's/bg-gray-50">$//g' \
  {} \;
```

Lanjut dengan replace yang butuh multi-line context (dilakukan manual per pattern):

```bash
# thead background
find /home/wanda/mbg-web/src/pages -name "*.tsx" -exec sed -i \
  -e 's/className="bg-gray-50"/className="bg-bgn-200"/g' \
  {} \;

# th text style  
find /home/wanda/mbg-web/src/pages -name "*.tsx" -exec sed -i \
  -e 's/text-gray-600 font-medium"/text-bgn-900 font-semibold"/g' \
  {} \;

# tr hover (zebra + hover)
find /home/wanda/mbg-web/src/pages -name "*.tsx" -exec sed -i \
  -e 's/className="hover:bg-gray-50"/className="odd:bg-white even:bg-bgn-50 hover:bg-bgn-100 transition-colors"/g' \
  {} \;

# table divider
find /home/wanda/mbg-web/src/pages -name "*.tsx" -exec sed -i \
  -e 's/divide-gray-100/divide-bgn-100/g' \
  {} \;
```

- [ ] **Step 2: Fix LoginPage — tombol Masuk TIDAK pakai bgn-green (sudah benar bgn-900)**

Login page punya tombol "Masuk" yang kita sengaja biarkan `bg-bgn-900` (bukan tombol aksi data, tapi tombol auth). Cek dan rollback jika ter-replace:

```bash
grep "bg-bgn-green-400" /home/wanda/mbg-web/src/pages/LoginPage.tsx
```

Jika ada output, fix manual:
```bash
sed -i 's/bg-bgn-green-400 text-white.*rounded-lg py-2 font-medium hover:bg-bgn-green-500/bg-bgn-900 text-white rounded-lg py-2 font-medium hover:bg-bgn-800/g' \
  /home/wanda/mbg-web/src/pages/LoginPage.tsx
```

- [ ] **Step 3: Verifikasi tidak ada `bg-bgn-900 text-white` yang tersisa di pages (kecuali LoginPage)**

```bash
grep -r "bg-bgn-900 text-white" /home/wanda/mbg-web/src/pages/ --include="*.tsx" | grep -v "LoginPage"
```

Expected: tidak ada output (semua sudah jadi `bg-bgn-green-400`).

- [ ] **Step 4: Verifikasi TypeScript**

```bash
cd /home/wanda/mbg-web && npx tsc --noEmit 2>&1 | head -10
```

Expected: tidak ada output.

- [ ] **Step 5: Commit**

```bash
cd /home/wanda/mbg-web
git add src/pages/
git commit -m "feat: tombol primary bgn-green, focus ring, table header bgn-200 + zebra"
```

---

## Task 5: Visual Smoke Test — Screenshot Halaman Utama

**Files:** tidak ada perubahan kode

- [ ] **Step 1: Pastikan dev server running**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/
```

Expected: `200`

Jika tidak running, jalankan:
```bash
cd /home/wanda/mbg-web && npx vite --port 5173 > /tmp/vite.log 2>&1 &
sleep 3
```

- [ ] **Step 2: Screenshot login page**

Gunakan Playwright MCP untuk navigate ke `http://localhost:5173/login` dan screenshot. Verifikasi:
- Tombol "Masuk" tetap navy `#071e49`
- Logo "MBG" biru tua

- [ ] **Step 3: Login dan screenshot dashboard**

Login dengan `kepala@sppg.id` / `Password123!`. Screenshot dashboard. Verifikasi:
- Sidebar: item aktif punya border kiri hijau BGN + bg sedikit lebih terang
- Subtitle "Makan Bergizi Gratis" di bawah "MBG"
- Dashboard cards: masing-masing punya colored left border dan icon emoji

- [ ] **Step 4: Screenshot halaman Menu Harian**

Navigate ke `/menu`. Verifikasi:
- Tombol "+ Buat Menu" hijau BGN (bukan navy)
- Table header biru muda BGN
- Row bergantian putih/biru sangat muda (zebra)

- [ ] **Step 5: Commit perbaikan jika ada dari smoke test**

```bash
cd /home/wanda/mbg-web
git add -A && git commit -m "fix: perbaikan visual dari smoke test polish BGN"
```

Jika tidak ada perbaikan, skip step ini.
