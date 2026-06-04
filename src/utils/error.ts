import type { AxiosError } from 'axios'

export function getErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<{ message?: string }>
  return axiosError?.response?.data?.message ?? 'Terjadi kesalahan'
}
