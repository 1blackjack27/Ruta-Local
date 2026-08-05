import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { auth } from '../lib/firebase'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { SITE_NAME } from '../lib/constants'

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

export default function RegistroPersona() {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!nombre.trim()) {
      setError('Escribe tu nombre.')
      return
    }
    if (!email.trim()) {
      setError('Ingresa tu correo electrónico.')
      return
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (confirmPassword !== password) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (!auth) {
      setError('Servicio de autenticación no disponible. Intenta más tarde.')
      return
    }
    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
      await updateProfile(cred.user, { displayName: nombre.trim() })
      const next = router.query.next || '/'
      router.push(next)
    } catch (err) {
      const code = err.code || ''
      if (code === 'auth/email-already-in-use') {
        setError('Ese correo ya tiene una cuenta. Inicia sesión con tu contraseña.')
      } else if (code === 'auth/invalid-email') {
        setError('Ingresa un correo válido.')
      } else if (code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.')
      } else {
        setError(err.message)
      }
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '48px 20px 80px', fontFamily: 'var(--font-body)' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 800, marginBottom: 8 }}>
          Crea tu cuenta
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Regístrate como persona para dejar comentarios en los negocios de {SITE_NAME}
        </p>
      </div>

      <form onSubmit={handleSubmit} style={sCard} noValidate>
        <div style={{ marginBottom: 16 }}>
          <label style={sLabel}>Tu nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Ej: Ana Rodríguez"
            style={sField}
            required
          />
        </div>
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
        <div style={{ marginBottom: 16 }}>
          <label style={sLabel}>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            style={sField}
            required
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={sLabel}>Confirmar contraseña</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Repite tu contraseña"
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

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: '13px', background: 'var(--primary)', color: '#fff',
            borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: '0.95rem',
            border: 'none', cursor: 'pointer', transition: 'opacity 0.2s',
          }}
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
          Inicia sesión
        </Link>
      </p>
      <p style={{ textAlign: 'center', marginTop: 8, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        ¿Tienes un negocio?{' '}
        <Link href="/registro" style={{ color: 'var(--primary)', fontWeight: 600 }}>
          Regístralo aquí
        </Link>
      </p>
    </div>
  )
}