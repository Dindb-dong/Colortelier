import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/ui'
import type { FormEvent } from 'react'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL as string | undefined
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD as string | undefined

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~`!@#$%^&*()_+\-={}|\[\]\\:";'<>?,.\/]).{8,16}$/

export default function SignUpPage() {
  const navigate = useNavigate()
  const loginAsAdmin = useAuthStore((s) => s.loginAsAdmin)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const emailInvalid = email.length > 0 && (!email.includes('@') || !email.includes('.'))

  const rules = {
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    digit: /\d/.test(password),
    special: /[~`!@#$%^&*()_+\-={}|\[\]\\:\";'<>?,.\/]/.test(password),
    length: password.length >= 8 && password.length <= 16,
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!PASSWORD_REGEX.test(password)) {
      setError('Password must be 8-16 chars, include lower/upper, number, special.')
      return
    }
    if (password !== confirm) {
      setError('Password does not match.')
      return
    }
    // Demo-only: if admin email chosen, allow signup and mark as admin
    if (ADMIN_EMAIL && ADMIN_PASSWORD && email.trim() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      loginAsAdmin(email.trim())
      navigate('/admin', { replace: true })
      return
    }
    // Otherwise, redirect to login with filled email
    navigate('/login', { replace: true, state: { prefillEmail: email.trim() } })
  }

  return (
    <section style={{ maxWidth: 520, margin: '48px auto', padding: 0 }}>
      <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', boxShadow: '0 6px 30px rgba(0,0,0,0.06)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'linear-gradient(180deg, rgba(0,0,0,0.02), transparent)' }}>
          <h1 style={{ margin: 0, fontSize: 22 }}>Create your account</h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>Join Colortelier</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14, padding: 24 }}>
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
          <div style={{ display: 'grid', gap: 12 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 13, color: '#374151' }}>Password</span>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '10px 40px 10px 12px', borderRadius: 10, border: '1px solid var(--border)' }}
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password visibility" style={{ position: 'absolute', right: 8, top: 6, padding: 4, borderRadius: 8, border: '1px solid var(--border)', background: 'white' }}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ fontSize: 13, color: '#374151' }}>Confirm password</span>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '10px 40px 10px 12px', borderRadius: 10, border: '1px solid var(--border)' }}
                />
                <button type="button" onClick={() => setShowConfirm((v) => !v)} aria-label="Toggle confirm visibility" style={{ position: 'absolute', right: 8, top: 6, padding: 4, borderRadius: 8, border: '1px solid var(--border)', background: 'white' }}>
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
            </label>
            <div style={{ display: 'grid', gap: 6, padding: 12, borderRadius: 10, background: 'rgba(0,0,0,0.02)', border: '1px solid var(--border)' }}>
              <span style={{ fontSize: 13, color: '#374151' }}>Password must include:</span>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6, fontSize: 13 }}>
                <li style={{ color: rules.lower ? 'var(--green-600)' : '#6b7280' }}>{rules.lower ? '✅' : '⬜'} Lowercase letter</li>
                <li style={{ color: rules.upper ? 'var(--green-600)' : '#6b7280' }}>{rules.upper ? '✅' : '⬜'} Uppercase letter</li>
                <li style={{ color: rules.digit ? 'var(--green-600)' : '#6b7280' }}>{rules.digit ? '✅' : '⬜'} Number</li>
                <li style={{ color: rules.special ? 'var(--green-600)' : '#6b7280' }}>{rules.special ? '✅' : '⬜'} Special character</li>
                <li style={{ color: rules.length ? 'var(--green-600)' : '#6b7280' }}>{rules.length ? '✅' : '⬜'} 8–16 characters</li>
              </ul>
            </div>
          </div>
          {error && (
            <div role="alert" style={{ color: '#ff0000', fontSize: 18 }}>
              {error}
            </div>
          )}
          <button type="submit" className="primary" style={{ padding: '10px 14px', borderRadius: 999 }}>
            Create account
          </button>
          <div style={{ paddingTop: 6, borderTop: '1px dashed var(--border)', display: 'flex', justifyContent: 'center' }}>
            <p style={{ color: '#6b7280', fontSize: 12, margin: 0 }}>
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  )
}
