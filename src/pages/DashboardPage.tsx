import { useAuthStore } from '@/store/auth.store'

export function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard</h1>
      <p className="text-gray-600">Selamat datang, {user?.nama ?? user?.email}</p>
    </div>
  )
}
