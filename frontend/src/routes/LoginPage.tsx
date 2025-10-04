import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuthStore } from '../store/ui'
import { authApi } from '../utils/api'

// Admin authentication is now handled by backend

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation() as { state?: { from?: { pathname: string } } }
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const loginAsAdmin = useAuthStore((s) => s.loginAsAdmin)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const emailInvalid = email.length > 0 && (!email.includes('@') || !email.includes('.'))

  useEffect(() => {
    if (isAdmin) {
      const redirectTo = location.state?.from?.pathname || '/admin'
      navigate(redirectTo, { replace: true })
    }
  }, [isAdmin, location.state, navigate])

  async function handleSubmit(e: FormEvent, demo: boolean = false) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (demo) {
        // 데모 어드민 로그인
        loginAsAdmin('demo@admin.com')
        navigate('/admin', { replace: true })
        return
      }

      // 백엔드 API 로그인
      const result = await authApi.login(email.trim(), password)

      // 백엔드에서 받은 is_admin 값으로 어드민 권한 확인
      if (result.user.is_admin) {
        loginAsAdmin(result.user.email)
        navigate('/admin', { replace: true })
      } else {
        setError('어드민 권한이 없습니다.')
      }
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section style={{ maxWidth: 440, margin: '48px auto', padding: 0 }}>
      <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 6px 30px rgba(0,0,0,0.06)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'linear-gradient(180deg, rgba(0,0,0,0.02), transparent)' }}>
          <h1 style={{ margin: 0, fontSize: 22 }}>Welcome back</h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>Sign in to continue</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14, padding: 24 }}>
          {/* TODO: REMOVE TEST ADMIN BUTTON */}
          <button className="primary button-cta" onClick={(e) => handleSubmit(e, true)}>Test Admin</button>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 13, color: '#374151' }}>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-invalid={emailInvalid}
              placeholder="you@example.com"
              style={{ padding: '10px 12px', borderRadius: 10, border: `1px solid ${emailInvalid ? 'var(--red-500)' : 'var(--border)'}` }}
            />
            {emailInvalid && (
              <span style={{ color: 'var(--red-600)', fontSize: 12 }}>Please enter a valid email address.</span>
            )}
          </label>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontSize: 13, color: '#374151' }}>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)' }}
            />
          </label>
          {error && (
            <div role="alert" style={{ color: 'var(--red-600)', fontSize: 13 }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            className="primary"
            style={{ padding: '10px 14px', borderRadius: 999 }}
            disabled={loading}
          >
            {loading ? '로그인 중...' : 'Sign in'}
          </button>
          <div style={{ paddingTop: 6, borderTop: '1px dashed var(--border)', display: 'flex', justifyContent: 'center' }}>
            <p style={{ color: '#6b7280', fontSize: 12, margin: 0 }}>
              New here? <Link to="/signup">Create an account</Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  )
}


