import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getPerfil, getFavoritos, getResenasDeUsuario } from '../lib/storage'
import { SITE_NAME } from '../lib/constants'

export default function PanelPersona({ user, onVerPanelNegocio }) {
  const [perfil, setPerfil] = useState(null)
  const [favoritos, setFavoritos] = useState([])
  const [resenas, setResenas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let activo = true
    ;(async () => {
      const [p, f, r] = await Promise.all([
        getPerfil(user.uid),
        getFavoritos(user.uid),
        getResenasDeUsuario(user.uid),
      ])
      if (!activo) return
      setPerfil(p)
      setFavoritos(f)
      setResenas(r)
      setLoading(false)
    })()
    return () => { activo = false }
  }, [user])

  if (loading) {
    return <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>Cargando tu perfil...</p>
  }

  const nombre = perfil?.nombre || user.displayName || (user.email || '').split('@')[0]
  const foto = perfil?.foto || ''

  return (
    <>
      {/* Tarjeta de perfil */}
      <div style={{
        background: 'var(--card-bg)', borderRadius: 12, padding: 24,
        border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,.04)',
        display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20,
        flexWrap: 'wrap',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
          background: foto ? `url(${foto}) center/cover` : 'linear-gradient(135deg, var(--primary), var(--secondary))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: '1.8rem', textTransform: 'uppercase',
        }}>
          {!foto && (nombre.charAt(0) || 'U')}
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text)' }}>{nombre}</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            {resenas.length} {resenas.length === 1 ? 'comentario' : 'comentarios'} · {favoritos.length} {favoritos.length === 1 ? 'lugar favorito' : 'lugares favoritos'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/perfil/editar" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '10px 20px', backgroundColor: 'var(--accent)', color: '#fff',
            border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
            cursor: 'pointer', textDecoration: 'none',
          }}>
            Editar perfil
          </Link>
          <Link href={`/perfil/${user.uid}`} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '10px 20px', backgroundColor: 'transparent', color: 'var(--accent)',
            border: '2px solid var(--accent)', borderRadius: 8, fontSize: 14, fontWeight: 600,
            cursor: 'pointer', textDecoration: 'none',
          }}>
            Ver perfil público
          </Link>
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 16, marginBottom: 20,
      }}>
        {/* Comentarios */}
        <div style={{
          backgroundColor: 'var(--card-bg)', borderRadius: 12, padding: 20,
          border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,.04)',
        }}>
          <p style={{ fontSize: 16, fontWeight: 600, margin: '0 0 12px 0', color: 'var(--text)' }}>
            💬 Tus comentarios
          </p>
          {resenas.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
              Aún no has comentado. Visita un negocio y deja tu experiencia.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320, overflowY: 'auto' }}>
              {resenas.slice(0, 20).map((r, i) => (
                <div key={i} style={{
                  padding: 12, borderRadius: 8, background: 'var(--bg)',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ fontSize: 12, color: '#f59e0b', marginBottom: 4 }}>
                    {'★'.repeat(Math.round(r.rating || 0))}
                    <span style={{ color: '#E5E7EB' }}>{'★'.repeat(5 - Math.round(r.rating || 0))}</span>
                  </div>
                  {r.negocioId ? (
                    <Link href={`/negocio/${r.negocioId}`} style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
                      {r.negocioNombre || 'Ver negocio'}
                    </Link>
                  ) : (
                    <span style={{ color: 'var(--text)', fontWeight: 600, fontSize: 13 }}>{r.negocioNombre || 'Negocio'}</span>
                  )}
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>{r.comentario}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Favoritos */}
        <div style={{
          backgroundColor: 'var(--card-bg)', borderRadius: 12, padding: 20,
          border: '1px solid var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,.04)',
        }}>
          <p style={{ fontSize: 16, fontWeight: 600, margin: '0 0 12px 0', color: 'var(--text)' }}>
            ♥ Tus lugares favoritos
          </p>
          {favoritos.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
              Guarda tus lugares favoritos tocando el corazón en cada negocio.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320, overflowY: 'auto' }}>
              {favoritos.map((f, i) => (
                <Link key={i} href={`/negocio/${f.negocioId}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    padding: 12, borderRadius: 8, background: 'var(--bg)',
                    border: '1px solid var(--border)', transition: 'box-shadow 0.2s',
                    display: 'flex', alignItems: 'center', gap: 10,
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 8, flexShrink: 0,
                      background: f.foto ? `url(${f.foto}) center/cover` : 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    }}></div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>
                        {f.nombre || 'Negocio'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f.municipio || '—'}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA para dueños de negocio */}
      <div style={{
        background: 'linear-gradient(135deg, var(--accent-bg), var(--secondary-bg))',
        border: '2px dashed var(--accent)', borderRadius: 16, padding: '24px 28px',
      }}>
        <p style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px 0', color: 'var(--accent)' }}>
          ¿También tienes un negocio?
        </p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 14px 0' }}>
          Regístralo en {SITE_NAME} y administra su información, fotos y estadísticas desde el panel de negocios.
        </p>
        <Link href="/registro" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '10px 24px', backgroundColor: 'var(--accent)', color: '#fff',
          border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600,
          cursor: 'pointer', textDecoration: 'none',
        }}>
          + Registrar negocio
        </Link>
      </div>
    </>
  )
}
