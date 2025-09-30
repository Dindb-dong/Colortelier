import { NavLink, Outlet, Link } from 'react-router-dom'
import { useAuthStore } from '../store/ui'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Footer from '../components/Footer'

export default function RootLayout() {
  const [isAuthed, setIsAuthed] = useState(false)
  const isAdmin = useAuthStore((s) => s.isAdmin)

  useEffect(() => {
    let mounted = true
    if (!supabase) return
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return
      setIsAuthed(!!data.user)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthed(!!session?.user)
    })
    return () => {
      mounted = false
      sub?.subscription.unsubscribe()
    }
  }, [])

  return (
    <>
      <nav>
        <div style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div className="row" style={{ gap: 16 }}>
            <Link to="/" aria-label="Home" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <img src="/logo.png" alt="Colortelier" style={{ width: 200, height: 40, borderRadius: 6 }} />
            </Link>
          </div>

          <div style={{ flex: 1 }}>
            <ul style={{ display: 'flex', gap: 8, padding: 0, margin: 0, listStyle: 'none', justifyContent: 'center' }}>
              <li><NavLink to="/" end>Home</NavLink></li>
              <li><NavLink to="/palettes">Color Code</NavLink></li>
              <li><NavLink to="/filters">Photo Filter</NavLink></li>
              <li><NavLink to="/about">About Us</NavLink></li>
              {isAdmin && <li><NavLink to="/admin">Admin</NavLink></li>}
            </ul>
          </div>

          <div className="row" style={{ gap: 8 }}>
            <Link to="/cart" aria-label="Cart" title="Cart" style={{ display: 'inline-flex', padding: 8, borderRadius: 999 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 12.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </Link>
            <Link to="/favorites" aria-label="Favorites" title="Favorites" style={{ display: 'inline-flex', padding: 8, borderRadius: 999 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </Link>
            {isAuthed ? (
              <Link to="/me" aria-label="My Page" title="My Page" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
            ) : (
              <Link to="/login" className="primary" style={{ padding: '8px 12px', borderRadius: 999 }}>
                Login / Signup
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="primary" style={{ padding: '8px 12px', borderRadius: 999 }}>
                Admin
              </Link>
            )}
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

