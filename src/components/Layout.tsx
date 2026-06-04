import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth.store'

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

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-green-700 text-white flex flex-col">
        <div className="px-4 py-5 border-b border-green-600">
          <p className="font-bold text-lg">MBG</p>
          <p className="text-xs text-green-200 truncate">{user?.email}</p>
          <p className="text-xs text-green-300">{user?.role}</p>
        </div>
        <nav className="flex-1 py-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="block px-4 py-2 text-sm hover:bg-green-600 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="px-4 py-3 text-sm text-green-200 hover:text-white hover:bg-green-600 text-left transition-colors border-t border-green-600"
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
