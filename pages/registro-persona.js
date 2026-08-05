import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { auth } from '../lib/firebase'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { subirFotoPerfil, guardarPerfil } from '../lib/storage'
import { SITE_NAME } from '../lib/constants'

const sCard = {
  background: 'var(--surface)', borderRadius: 'var(--radius)',
  padding: '32px 36px', boxShadow: 'var(--shadow-sm)',
  border: '1px solid var(--border)', maxWidth: 460, margin: '0 auto',
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
  const [foto, setFoto] = useState('')
  const [fotoUrl, setFotoUrl] = useState('')
  const [subiendoFoto, setSubiendoFoto] = useState(false)
  const [fotoError, setFotoError] = useState('')
  const [instagram, setInstagram] = useState('')
  const [tiktok, setTiktok] = useState('')
  const [facebook, setFacebook] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFileFoto = async (e) => {
    setFotoError('')
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setFotoError('El archivo debe ser una imagen.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setFotoError('La imagen debe pesar máximo 5 MB.')
      return
    }
    setSubiendoFoto(true)
    const url = await subirFotoPerfil(file)
    setSubiendoFoto(false)
    if (url) {
      setFoto(url)
    } else {
      setFotoError('No se pudo subir la imagen. Intenta de nuevo.')
    }
  }

  const handleAddFotoUrl = () => {
    if (!fotoUrl.trim()) return
    setFoto(fotoUrl.trim())
    setFotoUrl('')
  }

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
      await guardarPerfil(cred.user.uid, {
        nombre: nombre.trim(),
        foto,
        instagram: instagram.trim().replace(/^@/, ''),
        tiktok: tiktok.trim().replace(/^@/, ''),
        facebook: facebook.trim(),
      })
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
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '48px 20px 80px', fontFamily: 'var(--font-body)' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 800, marginBottom: 8 }}>
          Crea tu cuenta
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Regístrate como persona, guarda tus lugares favoritos y comparte tu experiencia en {SITE_NAME}
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

        {/* Foto de perfil */}
        <div style={{ marginBottom: 16 }}>
          <label style={sLabel}>Foto de perfil (opcional)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
              background: foto ? `url(${foto}) center/cover` : 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '1.3rem', overflow: 'hidden',
            }}>
              {!foto && (nombre.charAt(0) || 'U')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
              <label style={{
                padding: '8px 14px', borderRadius: 'var(--radius-sm)', textAlign: 'center',
                background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: '0.8rem',
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <i className="fas fa-camera"></i> Elegir foto
                <input type="file" accept="image/*" onChange={handleFileFoto} style={{ display: 'none' }} />
              </label>
              <div style={{ display: 'flex', gap: 4 }}>
                <input
                  type="text"
                  value={fotoUrl}
                  onChange={e => setFotoUrl(e.target.value)}
                  placeholder="O pega una URL de imagen"
                  style={{ ...sField, padding: '8px 10px', fontSize: '0.78rem', flex: 1 }}
                />
                <button type="button" onClick={handleAddFotoUrl} disabled={!fotoUrl.trim()}
                  style={{
                    padding: '0 12px', borderRadius: 'var(--radius-sm)',
                    background: fotoUrl.trim() ? 'var(--primary)' : 'var(--muted)',
                    color: fotoUrl.trim() ? '#fff' : 'var(--text-muted)',
                    border: 'none', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer',
                  }}>
                  Añadir
                </button>
              </div>
            </div>
          </div>
          {subiendoFoto && <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>Subiendo imagen...</p>}
          {fotoError && <p style={{ fontSize: '0.78rem', color: 'var(--error)', marginTop: 6 }}>{fotoError}</p>}
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
        <div style={{ marginBottom: 16 }}>
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

        {/* Redes sociales */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 20 }}>
          <label style={{ ...sLabel, fontSize: '0.85rem', marginBottom: 12 }}>
            Tus redes sociales (opcional)
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ position: 'relative' }}>
              <i className="fab fa-instagram" style={{ position: 'absolute', left: 12, top: 13, color: '#E4405F' }}></i>
              <input
                type="text"
                value={instagram}
                onChange={e => setInstagram(e.target.value)}
                placeholder="@tuinstagram"
                style={{ ...sField, paddingLeft: 40 }}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <i className="fab fa-tiktok" style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-secondary)' }}></i>
              <input
                type="text"
                value={tiktok}
                onChange={e => setTiktok(e.target.value)}
                placeholder="@tutiktok"
                style={{ ...sField, paddingLeft: 40 }}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <i className="fab fa-facebook-f" style={{ position: 'absolute', left: 12, top: 13, color: '#1877F2' }}></i>
              <input
                type="text"
                value={facebook}
                onChange={e => setFacebook(e.target.value)}
                placeholder="URL de tu Facebook (opcional)"
                style={{ ...sField, paddingLeft: 40 }}
              />
            </div>
          </div>
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