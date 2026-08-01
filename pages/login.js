import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { auth } from '../lib/firebase'
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'

const sCard = {
  background: 'var(--surface)', borderRadius: 'var(--radius)',
  padding: '32px 36px', boxShadow: 'var(--shadow-sm)',
  border: '1px solid var(--border)', maxWidth: 440, margin: '0 auto',
}

const sField = {
  width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-sm)',
  border: '1.5px solid var(--border)', fontSize: '0.9rem', fontWeight: 500,
  background: 'var(--surface)', color: 'var(--text)', outline: 'none',
  transition: 'border-color 0.2s', fontFamily: 'var(--font-body)', boxSizing: 'border-box',
}

const sLabel = {
  display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)',
  marginBottom: 6, letterSpacing: '0.01em',
}

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (auth) {
      const unsub = auth.onAuthStateChanged(user => {
        if (user) router.push('/dashboard')
      })
      return () => unsub()
    }
  }, [router])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setMsg('')
    if (!auth) {
      setError('Servicio de autenticación no disponible. Intenta más tarde.')
      return
    }
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
      router.push('/dashboard')
    } catch (err) {
      const code = err.code || ''
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setError('Correo o contraseña incorrectos.')
      } else if (code === 'auth/invalid-email') {
        setError('Ingresa un correo válido.')
      } else if (code === 'auth/too-many-requests') {
        setError('Demasiados intentos. Espera un momento y vuelve a intentar.')
      } else {
        setError(err.message)
      }
      setLoading(false)
    }
  }

  const handleReset = async () => {
    setError('')
    setMsg('')
    if (!auth) return
    if (!email.trim()) {
      setError('Escribe tu correo para enviarte el enlace de recuperación.')
      return
    }
    try {
      await sendPasswordResetEmail(auth, email.trim())
      setMsg('Te enviamos un enlace para restablecer tu contraseña. Revisa tu correo.')
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setMsg('Si el correo existe, te enviamos el enlace de recuperación.')
      } else {
        setError(err.message)
      }
    }
  }

  const containerStyle = {
    maxWidth: 480, margin: '0 auto', padding: '48px 20px 80px',
  }

  return (
    <div style={containerStyle}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 800, marginBottom: 8 }}>
          Inicia sesión
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Accede a tu panel para gestionar tus negocios
        </p>
      </div>

      <form onSubmit={handleLogin} style={sCard} noValidate>
        <div style={{ marginBottom: 16 }}>
          <label style={sLabel}>Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tucorreo@ejemplo.com"
            style={sField}
            required
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={sLabel}>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Tu contraseña"
            style={sField}
            required
          />
        </div>

        {error && (
          <div style={{
            background: '#FEE2E2', color: '#B91C1C', padding: '10px 14px',
            borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', marginBottom: 16,
          }}>{error}</div>
        )}
        {msg && (
          <div style={{
            background: '#DCFCE7', color: '#166534', padding: '10px 14px',
            borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', marginBottom: 16,
          }}>{msg}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: '13px', background: 'var(--primary)', color: '#fff',
            borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.95rem',
            border: 'none', cursor: 'pointer', transition: 'opacity 0.2s',
          }}
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>

        <button
          type="button"
          onClick={handleReset}
          style={{
            width: '100%', marginTop: 12, background: 'none', border: 'none',
            color: 'var(--primary)', fontSize: '0.83rem', fontWeight: 600, cursor: 'pointer',
          }}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
        ¿Aún no tienes cuenta?{' '}
        <Link href="/registro" style={{ color: 'var(--primary)', fontWeight: 700 }}>
          Regístrate gratis
        </Link>
      </p>
    </div>
  )
}
