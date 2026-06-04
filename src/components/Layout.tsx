import { Link, Outlet, useNavigate } from 'react-router-dom'
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
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
                <span>{item.label}</span>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
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
      {/* Konten utama */}
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
