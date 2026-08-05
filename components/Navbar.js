import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { SITE_NAME } from '../lib/constants'
import { auth } from '../lib/firebase'
import { signOut } from 'firebase/auth'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    if (!auth) return
    const unsub = auth.onAuthStateChanged(u => setUser(u))
    return () => unsub()
  }, [])

  const handleLogout = async () => {
    if (!auth) return
    await signOut(auth)
    setOpen(false)
    router.push('/')
  }

  const cerrar = () => setOpen(false)

  return (
    <nav style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64, maxWidth: 1200, margin: '0 auto', padding: '0 20px',
      }}>
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)',
        }}>
          <i className="fas fa-map-marked-alt"></i> {SITE_NAME}
        </Link>

        <button onClick={() => setOpen(!open)} style={{
          display: 'none', background: 'none', border: 'none', fontSize: '1.5rem', color: 'var(--text)', cursor: 'pointer',
        }} className="nav-toggle">
          <i className={`fas ${open ? 'fa-times' : 'fa-bars'}`}></i>
        </button>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 24,
        }} className="nav-links">
          <Link href="/" onClick={cerrar} style={{ fontSize: '0.88rem', fontWeight: 500, color: router.pathname === '/' ? 'var(--primary)' : 'var(--text-secondary)' }}>
            Inicio
          </Link>
          <Link href="/registro" onClick={cerrar} style={{ fontSize: '0.88rem', fontWeight: 500, color: router.pathname === '/registro' ? 'var(--primary)' : 'var(--text-secondary)' }}>
            Registrar negocio
          </Link>
          <Link href="/planes" onClick={cerrar} style={{ fontSize: '0.88rem', fontWeight: 500, color: router.pathname === '/planes' ? 'var(--primary)' : 'var(--text-secondary)' }}>
            Planes
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" onClick={cerrar} style={{ fontSize: '0.88rem', fontWeight: 500, color: router.pathname === '/dashboard' ? 'var(--primary)' : 'var(--text-secondary)' }}>
                <i className="fas fa-user" style={{ marginRight: 5 }}></i> Mi panel
              </Link>
              <button onClick={handleLogout} style={{
                background: 'none', border: '1px solid var(--border)', color: 'var(--text-secondary)',
                padding: '7px 16px', borderRadius: 50, fontWeight: 600, fontSize: '0.83rem', cursor: 'pointer',
              }}>
                <i className="fas fa-sign-out-alt" style={{ marginRight: 5 }}></i> Salir
              </button>
            </>
          ) : (
            <>
              <Link href="/registro-persona" onClick={cerrar} style={{
                background: 'none', border: '1.5px solid var(--primary)', color: 'var(--primary)',
                padding: '8px 20px', borderRadius: 50, fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap',
              }}>
                <i className="fas fa-user-plus"></i> Crear cuenta
              </Link>
              <Link href="/login" onClick={cerrar} style={{
                background: 'var(--primary)', color: '#fff', padding: '8px 20px',
                borderRadius: 50, fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap',
              }}>
                <i className="fas fa-user"></i> Iniciar sesión
              </Link>
            </>
          )}
        </div>
      </div>
      <style jsx>{`
        @media (max-width: 768px) {
          .nav-toggle { display: block !important; }
          .nav-links {
            display: ${open ? 'flex' : 'none'} !important;
            position: absolute; top: 64px; left: 0; right: 0;
            background: var(--surface); flex-direction: column;
            padding: 20px; border-bottom: 1px solid var(--border); gap: 16px;
          }
        }
      `}</style>
    </nav>
  )
}
