import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/api/endpoints/users'
import { getErrorMessage } from '@/utils/error'
import type { Role } from '@/types'

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'ADMIN_BGN', label: 'Admin BGN' },
  { value: 'KEPALA_SPPG', label: 'Kepala SPPG' },
  { value: 'AHLI_GIZI', label: 'Ahli Gizi' },
  { value: 'PETUGAS_DAPUR', label: 'Petugas Dapur' },
  { value: 'KURIR', label: 'Kurir' },
  { value: 'BENDAHARA', label: 'Bendahara' },
]

export function UserFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    nama: '',
    role: 'PETUGAS_DAPUR' as Role,
    isActive: true,
  })

  const [email, setEmail] = useState('')
  const [passwordForm, setPasswordForm] = useState({
    passwordLama: '',
    passwordBaru: '',
  })

  const { isLoading: loadingExisting } = useQuery({
    queryKey: ['users', id],
    queryFn: () => usersApi.getOne(id!),
    enabled: !!id,
    select: (res) => {
      const d = res.data.data
      setForm({
        nama: d.nama,
        role: d.role,
        isActive: d.isActive,
      })
      setEmail(d.email)
      return d
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: typeof form) => usersApi.update(id!, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); navigate('/users') },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const passwordMutation = useMutation({
    mutationFn: (data: typeof passwordForm) => usersApi.changePassword(id!, data),
    onSuccess: () => { setPasswordForm({ passwordLama: '', passwordBaru: '' }); setError('') },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const set = (field: string, value: string | boolean) => setForm(f => ({ ...f, [field]: value }))
  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-bgn-green-400 focus:outline-none'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  if (loadingExisting) return <p className="text-gray-500">Memuat...</p>

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-bgn-900 mb-6">Edit Pengguna</h1>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}

      <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate(form) }} className="space-y-5">
        <div className="bg-white rounded-xl border border-bgn-100 p-5 shadow-md space-y-3">
          <h2 className="font-semibold text-bgn-900 text-sm uppercase tracking-wide">Data Pengguna</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Nama *</label>
              <input value={form.nama} onChange={(e) => set('nama', e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input value={email} disabled
                className={`${inputCls} bg-gray-100 cursor-not-allowed`} />
            </div>
            <div>
              <label className={labelCls}>Role *</label>
              <select value={form.role} onChange={(e) => set('role', e.target.value)} className={inputCls}>
                {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)}
                  className="rounded border-gray-300 text-bgn-green-400 focus:ring-bgn-green-400" />
                Aktif
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={updateMutation.isPending}
            className="bg-bgn-green-400 text-white px-6 py-2 rounded-lg hover:bg-bgn-green-500 disabled:opacity-50">
            {updateMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
          <button type="button" onClick={() => navigate('/users')}
            className="border border-bgn-900 text-bgn-900 px-6 py-2 rounded-lg hover:bg-bgn-50">Batal</button>
        </div>
      </form>

      {id && (
        <div className="bg-white rounded-xl border border-bgn-100 p-5 shadow-md space-y-3 mt-6">
          <h2 className="font-semibold text-bgn-900 text-sm uppercase tracking-wide">Ubah Password</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Password Lama</label>
              <input type="password" value={passwordForm.passwordLama}
                onChange={(e) => setPasswordForm(f => ({ ...f, passwordLama: e.target.value }))}
                className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Password Baru</label>
              <input type="password" value={passwordForm.passwordBaru}
                onChange={(e) => setPasswordForm(f => ({ ...f, passwordBaru: e.target.value }))}
                className={inputCls} />
            </div>
          </div>
          <button type="button" onClick={() => passwordMutation.mutate(passwordForm)}
            disabled={!passwordForm.passwordLama || !passwordForm.passwordBaru || passwordMutation.isPending}
            className="bg-bgn-800 text-white px-5 py-2 rounded-lg text-sm hover:bg-bgn-900 disabled:opacity-50">
            {passwordMutation.isPending ? 'Menyimpan...' : 'Ubah Password'}
          </button>
        </div>
      )}
    </div>
  )
}