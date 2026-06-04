import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth.store'

export function useNotifikasiSocket() {
  const accessToken = useAuthStore((s) => s.accessToken)
  const qc = useQueryClient()
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    if (!accessToken) return

    socketRef.current = io({
      auth: { token: accessToken },
      transports: ['websocket'],
    })

    socketRef.current.on('notifikasi.baru', () => {
      void qc.invalidateQueries({ queryKey: ['notifikasi'] })
    })

    return () => {
      socketRef.current?.disconnect()
      socketRef.current = null
    }
  }, [accessToken, qc])
}
