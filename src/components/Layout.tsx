import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'
import { useQuery } from '@tanstack/react-query'
import { notifikasiApi } from '@/api/endpoints/notifikasi'
import { useNotifikasiSocket } from '@/hooks/useNotifikasiSocket'
import type { Role } from '@/types'

// Item navigasi. `num` = nomor langkah operasional harian (1–7).
// `roles` = peran yang boleh melihat menu ini.
type NavItem = { to: string; label: string; num?: number; roles: Role[] }

// Semua peran (dipakai untuk menu yang tampil ke siapa pun yang login)
const SEMUA: Role[] = [
  'ADMIN_BGN',
  'KEPALA_SPPG',
  'AHLI_GIZI',
  'PETUGAS_DAPUR',
  'KURIR',
  'BENDAHARA',
]

// Kepala SPPG & Admin BGN (read-only) selalu melihat semua menu.
const INTI: Role[] = ['KEPALA_SPPG', 'ADMIN_BGN']

// Operasional harian — urutan langkah 1–7 sesuai prototipe sppg-app.html
const operasional: NavItem[] = [
  { num: 1, to: '/menu', label: 'Menu', roles: [...INTI, 'AHLI_GIZI'] },
  { num: 2, to: '/pengadaan', label: 'Pengadaan', roles: [...INTI, 'BENDAHARA'] },
  { num: 3, to: '/bahan-baku', label: 'Stok & bahan', roles: [...INTI, 'AHLI_GIZI', 'BENDAHARA', 'PETUGAS_DAPUR'] },
  { num: 4, to: '/produksi', label: 'Produksi', roles: [...INTI, 'AHLI_GIZI', 'PETUGAS_DAPUR'] },
  { num: 5, to: '/distribusi', label: 'Distribusi', roles: [...INTI, 'PETUGAS_DAPUR', 'KURIR'] },
  { num: 6, to: '/keuangan', label: 'Keuangan', roles: [...INTI, 'BENDAHARA'] },
  { num: 7, to: '/laporan', label: 'Laporan', roles: [...INTI, 'AHLI_GIZI', 'BENDAHARA'] },
]

// Setup — data dasar, jarang berubah
const setup: NavItem[] = [
  { to: '/sppg', label: 'Profil SPPG', roles: [...INTI] },
  { to: '/sekolah', label: 'Sekolah & penerima', roles: [...INTI, 'AHLI_GIZI'] },
  { to: '/supplier', label: 'Supplier', roles: [...INTI, 'BENDAHARA'] },
  { to: '/lokasi-gudang', label: 'Gudang', roles: [...INTI, 'BENDAHARA'] },
  { to: '/resep', label: 'Resep', roles: [...INTI, 'AHLI_GIZI'] },
  { to: '/users', label: 'Pengguna', roles: [...INTI] },
]

const beranda: NavItem = { to: '/', label: 'Beranda', roles: SEMUA }

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

  const role = user?.role
  const bolehLihat = (item: NavItem) => !!role && item.roles.includes(role)

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  // Kelas dasar untuk tiap link navigasi (mempertahankan tema BGN)
  const linkClass = (active: boolean) =>
    `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
      active
        ? 'border-l-4 border-bgn-green-400 bg-bgn-800 font-semibold text-white'
        : 'border-l-4 border-transparent hover:bg-bgn-800 text-bgn-100'
    }`

  // Chip nomor langkah (1–7) di kiri label
  const numChip = (active: boolean) =>
    `flex items-center justify-center w-5 h-5 rounded-md text-[11px] font-semibold shrink-0 ${
      active ? 'bg-bgn-green-500 text-white' : 'bg-white/10 text-bgn-200'
    }`

  const renderItem = (item: NavItem) => {
    const active = isActive(item.to)
    return (
      <Link key={item.to} to={item.to} className={linkClass(active)}>
        {item.num !== undefined && <span className={numChip(active)}>{item.num}</span>}
        <span>{item.label}</span>
      </Link>
    )
  }

  const operasionalTampil = operasional.filter(bolehLihat)
  const setupTampil = setup.filter(bolehLihat)

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
          {/* Beranda */}
          {bolehLihat(beranda) && renderItem(beranda)}

          {/* Operasional harian */}
          {operasionalTampil.length > 0 && (
            <>
              <p className="px-4 pt-5 pb-1.5 text-[11px] uppercase tracking-wider text-bgn-300 font-semibold">
                Operasional harian
              </p>
              {operasionalTampil.map(renderItem)}
            </>
          )}

          {/* Setup */}
          {setupTampil.length > 0 && (
            <>
              <p className="px-4 pt-5 pb-1.5 text-[11px] uppercase tracking-wider text-bgn-300 font-semibold">
                Setup
              </p>
              {setupTampil.map(renderItem)}
            </>
          )}
        </nav>

        {/* Utilitas: notifikasi + keluar */}
        <div className="border-t border-bgn-800">
          <Link
            to="/notifikasi"
            className={`${linkClass(isActive('/notifikasi'))} justify-between`}
          >
            <span>Notifikasi</span>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 text-sm text-bgn-300 hover:text-white hover:bg-bgn-800 text-left transition-colors"
          >
            Keluar
          </button>
        </div>
      </aside>

      {/* Konten utama */}
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
