import { NavLink, Outlet, Link } from 'react-router-dom'
import { useAuthStore } from '../store/ui'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Footer from '../components/Footer'

export default function RootLayout() {
  const [isAuthed, setIsAuthed] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
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

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  const handleNavClick = () => {
    setIsMenuOpen(false)
  }

  return (
    <>
      <nav>
        {/* Desktop Layout */}
        <div className="nav-desktop" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div className="row" style={{ gap: 16 }}>
            <Link to="/" aria-label="Home" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <img src="/logo.png" alt="Colortelier" style={{ width: 200, height: 40, borderRadius: 6 }} />
            </Link>
          </div>

          <div style={{ flex: 1 }}>
            {/*Navigation Bar*/}
            <ul style={{ display: 'flex', gap: 8, padding: 0, margin: 0, listStyle: 'none', justifyContent: 'center' }}>
              <li><NavLink to="/" end>Home</NavLink></li>
              <li><NavLink to="/palettes">Color Code</NavLink></li>
              <li><NavLink to="/filters">Photo Filter</NavLink></li>
              <li><NavLink to="/about">About Us</NavLink></li>
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
            {isAuthed || isAdmin ? (
              <Link to="/me" aria-label="My Page" title="My Page" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
            ) : (
              <>
                <Link to="/login" className="primary" style={{ padding: '8px 12px', borderRadius: 999 }}>
                  Login
                </Link>
                <Link to="/signup" className="primary" style={{ padding: '8px 12px', borderRadius: 999 }}>
                  Signup
                </Link>
              </>
            )}
            {isAdmin && (
              <Link to="/admin" className="primary" style={{ padding: '8px 12px', borderRadius: 999 }}>
                Admin
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="nav-mobile" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <button
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
            style={{ display: 'inline-flex', padding: 8, borderRadius: 999, border: 'none', background: 'transparent', cursor: 'pointer' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <Link to="/" aria-label="Home" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <img src="/logo.png" alt="Colortelier" style={{ width: 150, height: 30, borderRadius: 6 }} />
          </Link>

          <div className="row" style={{ gap: 8 }}>
            <Link to="/cart" aria-label="Cart" title="Cart" style={{ display: 'inline-flex', padding: 8, borderRadius: 999 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 12.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
            </Link>
            {isAuthed || isAdmin ? (
              <Link to="/me" aria-label="My Page" title="My Page" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
            ) : (
              <Link to="/login" className="primary" style={{ padding: '8px 12px', borderRadius: 999 }}>
                Login
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="primary" style={{ padding: '8px 12px', borderRadius: 999 }}>
                Admin
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation Modal */}
        {isMenuOpen && (
          <div
            className="mobile-nav-modal"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1000,
              display: 'flex'
            }}
            onClick={() => setIsMenuOpen(false)}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '280px',
                height: '100%',
                background: 'var(--bg)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Menu</h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close menu"
                  style={{ display: 'inline-flex', padding: 8, borderRadius: 999, border: 'none', background: 'transparent', cursor: 'pointer' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: 0, margin: 0, listStyle: 'none' }}>
                <li>
                  <NavLink to="/" end onClick={handleNavClick} className="mobile-nav-link" style={{ display: 'block', padding: '12px 16px', borderRadius: 8, textDecoration: 'none', color: 'var(--fg)' }}>
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/palettes" onClick={handleNavClick} className="mobile-nav-link" style={{ display: 'block', padding: '12px 16px', borderRadius: 8, textDecoration: 'none', color: 'var(--fg)' }}>
                    Color Code
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/filters" onClick={handleNavClick} className="mobile-nav-link" style={{ display: 'block', padding: '12px 16px', borderRadius: 8, textDecoration: 'none', color: 'var(--fg)' }}>
                    Photo Filter
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/about" onClick={handleNavClick} className="mobile-nav-link" style={{ display: 'block', padding: '12px 16px', borderRadius: 8, textDecoration: 'none', color: 'var(--fg)' }}>
                    About Us
                  </NavLink>
                </li>
                <li style={{ marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <Link to="/favorites" onClick={handleNavClick} className="mobile-nav-link" style={{ display: 'block', padding: '12px 16px', borderRadius: 8, textDecoration: 'none', color: 'var(--fg)' }}>
                    Favorites
                  </Link>
                </li>
              </ul>
              {(!isAuthed && !isAdmin) && (
                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <Link to="/login" onClick={handleNavClick} className="primary" style={{ padding: '12px 16px', borderRadius: 8, textAlign: 'center', textDecoration: 'none' }}>
                    Login
                  </Link>
                  <Link to="/signup" onClick={handleNavClick} className="primary" style={{ padding: '12px 16px', borderRadius: 8, textAlign: 'center', textDecoration: 'none' }}>
                    Signup
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

