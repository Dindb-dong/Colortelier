import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthStore } from '../store/ui'

type Props = { children: ReactNode }

export default function RequireAdmin({ children }: Props) {
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const location = useLocation()

  if (!isAdmin) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <>{children}</>
}


