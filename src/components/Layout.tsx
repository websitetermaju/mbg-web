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
  { to: '/permintaan-pembelian', label: 'Permintaan Beli' },
  { to: '/invoice', label: 'Invoice' },
  { to: '/supplier', label: 'Supplier' },
  { to: '/resep', label: 'Resep / BOM' },
  { to: '/lokasi-gudang', label: 'Lokasi Gudang' },
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
